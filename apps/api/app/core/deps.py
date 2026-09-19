"""Shared FastAPI dependencies: database sessions, the current user, and RBAC."""

from __future__ import annotations

from collections.abc import Awaitable, Callable
from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import TokenError, decode_token
from app.db.models.user import Role, User
from app.db.session import get_db

ACCESS_COOKIE_NAME = "qlab_access"
REFRESH_COOKIE_NAME = "qlab_refresh"

DbSession = Annotated[AsyncSession, Depends(get_db)]


def _unauthorized(detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={"code": "NOT_AUTHENTICATED", "message": detail},
        headers={"WWW-Authenticate": "Bearer"},
    )


def _read_access_token(request: Request) -> str:
    """Prefer the httpOnly cookie; accept a bearer header for API clients."""
    cookie = request.cookies.get(ACCESS_COOKIE_NAME)
    if cookie:
        return cookie

    header = request.headers.get("Authorization", "")
    scheme, _, token = header.partition(" ")
    if scheme.lower() == "bearer" and token:
        return token

    raise _unauthorized("Authentication required.")


async def get_current_user(request: Request, db: DbSession) -> User:
    """Resolve the authenticated user, or raise 401."""
    token = _read_access_token(request)
    try:
        claims = decode_token(token, expected_type="access")
    except TokenError as exc:
        raise _unauthorized(str(exc)) from exc

    user = await db.get(User, claims.subject)
    if user is None:
        raise _unauthorized("Account no longer exists.")
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "ACCOUNT_DISABLED", "message": "This account is disabled."},
        )

    # The role is re-read from the database rather than trusted from the token,
    # so a demotion takes effect immediately instead of at token expiry.
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


async def get_optional_user(request: Request, db: DbSession) -> User | None:
    """Resolve the user if credentials are present, otherwise ``None``.

    Used by endpoints that serve anonymous visitors but personalise for
    signed-in ones.
    """
    try:
        return await get_current_user(request, db)
    except HTTPException:
        return None


OptionalUser = Annotated[User | None, Depends(get_optional_user)]


def require_role(minimum: Role) -> Callable[[User], Awaitable[User]]:
    """Dependency factory enforcing a minimum role.

    Roles are cumulative, so ``require_role(Role.RESEARCHER)`` admits
    researchers and admins but not learners.
    """

    async def _guard(user: CurrentUser) -> User:
        if not user.role.satisfies(minimum):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "code": "INSUFFICIENT_ROLE",
                    "message": (
                        f"This action requires the {minimum.value} role; "
                        f"your account is {user.role.value}."
                    ),
                    "requiredRole": minimum.value,
                    "currentRole": user.role.value,
                },
            )
        return user

    return _guard


RequireLearner = Annotated[User, Depends(require_role(Role.LEARNER))]
RequireResearcher = Annotated[User, Depends(require_role(Role.RESEARCHER))]
RequireAdmin = Annotated[User, Depends(require_role(Role.ADMIN))]
