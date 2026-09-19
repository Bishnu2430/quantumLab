"""Password hashing and JWT issuing/verification.

Passwords use Argon2id, the PHC winner and OWASP's current recommendation.
Access tokens are short-lived and stateless; refresh tokens carry a `jti` that
is tracked in the database so sessions can actually be revoked.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import Any, Literal

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerifyMismatchError

from app.core.config import get_settings

TokenType = Literal["access", "refresh"]

# Defaults follow the argon2-cffi recommendations; tuned down only in tests,
# where the KDF cost would otherwise dominate the suite runtime.
_hasher = PasswordHasher()


class TokenError(Exception):
    """Raised when a token is absent, malformed, expired, or of the wrong type."""


@dataclass(frozen=True)
class TokenClaims:
    subject: str
    role: str
    token_type: TokenType
    jti: str
    expires_at: datetime


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password: str, password_hash: str) -> tuple[bool, str | None]:
    """Verify a password.

    Returns ``(ok, new_hash)``. ``new_hash`` is non-None when the stored hash
    used outdated parameters and should be transparently upgraded on this login.
    """
    try:
        _hasher.verify(password_hash, password)
    except (VerifyMismatchError, InvalidHashError):
        return False, None

    if _hasher.check_needs_rehash(password_hash):
        return True, _hasher.hash(password)
    return True, None


def _create_token(
    subject: str,
    role: str,
    token_type: TokenType,
    ttl: timedelta,
    jti: str | None = None,
) -> tuple[str, TokenClaims]:
    settings = get_settings()
    now = datetime.now(UTC)
    expires_at = now + ttl
    token_jti = jti or str(uuid.uuid4())

    payload: dict[str, Any] = {
        "sub": subject,
        "role": role,
        "type": token_type,
        "jti": token_jti,
        "iat": int(now.timestamp()),
        "exp": int(expires_at.timestamp()),
    }
    token = jwt.encode(
        payload,
        settings.jwt_secret_key.get_secret_value(),
        algorithm=settings.jwt_algorithm,
    )
    claims = TokenClaims(
        subject=subject,
        role=role,
        token_type=token_type,
        jti=token_jti,
        expires_at=expires_at,
    )
    return token, claims


def create_access_token(subject: str, role: str) -> tuple[str, TokenClaims]:
    settings = get_settings()
    return _create_token(
        subject, role, "access", timedelta(minutes=settings.access_token_ttl_minutes)
    )


def create_refresh_token(subject: str, role: str) -> tuple[str, TokenClaims]:
    settings = get_settings()
    return _create_token(
        subject, role, "refresh", timedelta(days=settings.refresh_token_ttl_days)
    )


def decode_token(token: str, expected_type: TokenType) -> TokenClaims:
    """Decode and validate a token, or raise :class:`TokenError`.

    The ``type`` claim is checked explicitly: without it a refresh token would
    be accepted as an access token, silently extending its privileges to every
    authenticated endpoint.
    """
    settings = get_settings()
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key.get_secret_value(),
            algorithms=[settings.jwt_algorithm],
            options={"require": ["exp", "sub", "jti"]},
        )
    except jwt.ExpiredSignatureError as exc:
        raise TokenError("Token has expired.") from exc
    except jwt.InvalidTokenError as exc:
        raise TokenError("Token is invalid.") from exc

    if payload.get("type") != expected_type:
        raise TokenError(f"Expected a {expected_type} token.")

    return TokenClaims(
        subject=str(payload["sub"]),
        role=str(payload.get("role", "learner")),
        token_type=expected_type,
        jti=str(payload["jti"]),
        expires_at=datetime.fromtimestamp(payload["exp"], tz=UTC),
    )
