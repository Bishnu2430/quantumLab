"""Authentication endpoints.

Tokens are delivered exclusively as httpOnly cookies. The access token is short
lived and stateless; the refresh token is rotated on every use and tracked in
the database so that logout and revocation are real rather than advisory.
"""

from __future__ import annotations

from datetime import UTC, datetime

from fastapi import APIRouter, HTTPException, Request, Response, status
from sqlalchemy import select, update

from app.core.config import get_settings
from app.core.deps import (
    ACCESS_COOKIE_NAME,
    REFRESH_COOKIE_NAME,
    CurrentUser,
    DbSession,
)
from app.core.security import (
    TokenClaims,
    TokenError,
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.db.models.user import RefreshToken, Role, User
from app.schemas.auth import (
    AuthResponse,
    MessageResponse,
    UserLogin,
    UserRead,
    UserRegister,
)

router = APIRouter(prefix="/auth", tags=["auth"])


def _set_auth_cookies(
    response: Response, access_token: str, refresh_token: str, refresh_claims: TokenClaims
) -> None:
    settings = get_settings()
    common = {
        "httponly": True,
        "secure": settings.cookie_secure,
        "samesite": settings.cookie_samesite,
        "domain": settings.cookie_domain,
    }
    response.set_cookie(
        ACCESS_COOKIE_NAME,
        access_token,
        max_age=settings.access_token_ttl_minutes * 60,
        path="/",
        **common,
    )
    # Scoped to the refresh endpoint so it is not attached to ordinary API
    # calls, narrowing where it can leak from.
    response.set_cookie(
        REFRESH_COOKIE_NAME,
        refresh_token,
        max_age=int(
            (refresh_claims.expires_at - datetime.now(UTC)).total_seconds()
        ),
        path="/api/v1/auth",
        **common,
    )


def _clear_auth_cookies(response: Response) -> None:
    settings = get_settings()
    response.delete_cookie(ACCESS_COOKIE_NAME, path="/", domain=settings.cookie_domain)
    response.delete_cookie(
        REFRESH_COOKIE_NAME, path="/api/v1/auth", domain=settings.cookie_domain
    )


async def _issue_session(
    db: DbSession, response: Response, user: User, request: Request
) -> AuthResponse:
    access_token, access_claims = create_access_token(user.id, user.role.value)
    refresh_token, refresh_claims = create_refresh_token(user.id, user.role.value)

    db.add(
        RefreshToken(
            jti=refresh_claims.jti,
            user_id=user.id,
            issued_at=datetime.now(UTC),
            expires_at=refresh_claims.expires_at,
            user_agent=request.headers.get("user-agent", "")[:255] or None,
        )
    )
    user.last_login_at = datetime.now(UTC)
    await db.commit()
    await db.refresh(user)

    _set_auth_cookies(response, access_token, refresh_token, refresh_claims)
    return AuthResponse(user=UserRead.model_validate(user), expires_at=access_claims.expires_at)


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(
    payload: UserRegister, request: Request, response: Response, db: DbSession
) -> AuthResponse:
    """Create an account. Self-registration always yields the learner role."""
    existing = await db.scalar(select(User).where(User.email == payload.email.lower()))
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": "EMAIL_TAKEN", "message": "That email is already registered."},
        )

    user = User(
        email=payload.email.lower(),
        display_name=payload.display_name.strip(),
        password_hash=hash_password(payload.password),
        role=Role.LEARNER,
    )
    db.add(user)
    await db.flush()
    return await _issue_session(db, response, user, request)


@router.post("/login", response_model=AuthResponse)
async def login(
    payload: UserLogin, request: Request, response: Response, db: DbSession
) -> AuthResponse:
    user = await db.scalar(select(User).where(User.email == payload.email.lower()))

    # Same response whether the address is unknown or the password is wrong, so
    # the endpoint cannot be used to enumerate registered accounts.
    invalid = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={"code": "INVALID_CREDENTIALS", "message": "Incorrect email or password."},
    )
    if user is None:
        raise invalid

    ok, upgraded_hash = verify_password(payload.password, user.password_hash)
    if not ok:
        raise invalid
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "ACCOUNT_DISABLED", "message": "This account is disabled."},
        )
    if upgraded_hash is not None:
        user.password_hash = upgraded_hash

    return await _issue_session(db, response, user, request)


@router.post("/refresh", response_model=AuthResponse)
async def refresh(request: Request, response: Response, db: DbSession) -> AuthResponse:
    """Exchange a refresh token for a new pair, rotating the old one."""
    token = request.cookies.get(REFRESH_COOKIE_NAME)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "NO_REFRESH_TOKEN", "message": "No active session."},
        )

    try:
        claims = decode_token(token, expected_type="refresh")
    except TokenError as exc:
        _clear_auth_cookies(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_REFRESH_TOKEN", "message": str(exc)},
        ) from exc

    record = await db.get(RefreshToken, claims.jti)
    if record is None:
        _clear_auth_cookies(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "UNKNOWN_REFRESH_TOKEN", "message": "Session not recognised."},
        )

    if record.is_revoked:
        # A revoked token being presented again means it was captured after
        # rotation. Drop every session for the account rather than just this one.
        await db.execute(
            update(RefreshToken)
            .where(RefreshToken.user_id == record.user_id, RefreshToken.revoked_at.is_(None))
            .values(revoked_at=datetime.now(UTC))
        )
        await db.commit()
        _clear_auth_cookies(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "REFRESH_TOKEN_REUSED",
                "message": "This session was already ended. Please sign in again.",
            },
        )

    user = await db.get(User, record.user_id)
    if user is None or not user.is_active:
        _clear_auth_cookies(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "ACCOUNT_UNAVAILABLE", "message": "Account is unavailable."},
        )

    access_token, access_claims = create_access_token(user.id, user.role.value)
    new_refresh, new_claims = create_refresh_token(user.id, user.role.value)

    now = datetime.now(UTC)
    record.revoked_at = now
    record.replaced_by = new_claims.jti
    db.add(
        RefreshToken(
            jti=new_claims.jti,
            user_id=user.id,
            issued_at=now,
            expires_at=new_claims.expires_at,
            user_agent=request.headers.get("user-agent", "")[:255] or None,
        )
    )
    await db.commit()

    _set_auth_cookies(response, access_token, new_refresh, new_claims)
    return AuthResponse(user=UserRead.model_validate(user), expires_at=access_claims.expires_at)


@router.post("/logout", response_model=MessageResponse)
async def logout(request: Request, response: Response, db: DbSession) -> MessageResponse:
    """End the current session. Safe to call when already signed out."""
    token = request.cookies.get(REFRESH_COOKIE_NAME)
    if token:
        try:
            claims = decode_token(token, expected_type="refresh")
        except TokenError:
            claims = None
        if claims is not None:
            record = await db.get(RefreshToken, claims.jti)
            if record is not None and not record.is_revoked:
                record.revoked_at = datetime.now(UTC)
                await db.commit()

    _clear_auth_cookies(response)
    return MessageResponse(message="Signed out.")


@router.post("/logout-all", response_model=MessageResponse)
async def logout_all(user: CurrentUser, response: Response, db: DbSession) -> MessageResponse:
    """Revoke every session for the signed-in account, on all devices."""
    await db.execute(
        update(RefreshToken)
        .where(RefreshToken.user_id == user.id, RefreshToken.revoked_at.is_(None))
        .values(revoked_at=datetime.now(UTC))
    )
    await db.commit()
    _clear_auth_cookies(response)
    return MessageResponse(message="Signed out of all sessions.")


@router.get("/me", response_model=UserRead)
async def me(user: CurrentUser) -> UserRead:
    return UserRead.model_validate(user)
