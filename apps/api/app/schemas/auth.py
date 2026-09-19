"""Request and response models for authentication and account management."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.db.models.user import Role

# Long enough to resist offline guessing, capped because Argon2 hashes the
# whole input and an unbounded body is a cheap denial-of-service vector.
MIN_PASSWORD_LENGTH = 12
MAX_PASSWORD_LENGTH = 128


class UserRegister(BaseModel):
    email: EmailStr
    display_name: str = Field(min_length=2, max_length=80)
    password: str = Field(min_length=MIN_PASSWORD_LENGTH, max_length=MAX_PASSWORD_LENGTH)

    @field_validator("password")
    @classmethod
    def _reject_trivial_passwords(cls, value: str) -> str:
        if value.isdigit() or value.isalpha():
            raise ValueError(
                "Password must combine letters with numbers or symbols."
            )
        if len(set(value)) < 5:
            raise ValueError("Password is too repetitive.")
        return value


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=MAX_PASSWORD_LENGTH)


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: EmailStr
    display_name: str
    role: Role
    is_active: bool
    created_at: datetime
    last_login_at: datetime | None = None


class RoleUpdate(BaseModel):
    role: Role


class AuthResponse(BaseModel):
    """Returned on register/login/refresh.

    Deliberately carries no tokens: both the access and refresh token are set
    as httpOnly cookies, so JavaScript on the page can never read them.
    """

    user: UserRead
    expires_at: datetime = Field(description="When the access token expires (UTC)")


class MessageResponse(BaseModel):
    message: str
