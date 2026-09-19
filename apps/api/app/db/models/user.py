"""User accounts, roles, and refresh-token records."""

from __future__ import annotations

from datetime import datetime
from enum import StrEnum

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, new_uuid


class Role(StrEnum):
    """Capability tiers.

    LEARNER    consumes lessons: read content, drive visualizations, run the
               circuit and code that ship with a lesson.
    RESEARCHER additionally authors circuits and code from scratch, which is
               what gates access to the execution sandbox.
    ADMIN      additionally manages users, content publication, and sees
               operational data.
    """

    LEARNER = "learner"
    RESEARCHER = "researcher"
    ADMIN = "admin"

    @property
    def rank(self) -> int:
        return _ROLE_RANK[self]

    def satisfies(self, required: Role) -> bool:
        """Roles are cumulative: a higher tier can do everything below it."""
        return self.rank >= required.rank


_ROLE_RANK: dict[Role, int] = {
    Role.LEARNER: 0,
    Role.RESEARCHER: 1,
    Role.ADMIN: 2,
}


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String(80), nullable=False)

    # Argon2id hash. Never a plaintext or reversible value.
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    role: Mapped[Role] = mapped_column(
        Enum(Role, name="user_role", native_enum=False, length=20),
        default=Role.LEARNER,
        nullable=False,
        index=True,
    )

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    refresh_tokens: Mapped[list[RefreshToken]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:  # pragma: no cover - debugging aid
        return f"<User {self.email} role={self.role}>"


class RefreshToken(Base):
    """A single issued refresh token.

    Storing one row per token is what makes logout and "revoke every session"
    meaningful — a stateless JWT alone cannot be withdrawn before it expires.
    Only the token's `jti` is kept; the token itself is never stored.
    """

    __tablename__ = "refresh_tokens"

    jti: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    issued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    # Set when this token is rotated, pointing at its successor. A reuse attempt
    # on a rotated token is the classic signal of a stolen refresh token.
    replaced_by: Mapped[str | None] = mapped_column(String(36))

    user_agent: Mapped[str | None] = mapped_column(String(255))

    user: Mapped[User] = relationship(back_populates="refresh_tokens")

    __table_args__ = (
        Index("ix_refresh_tokens_user_id", "user_id"),
        # Revocation sweeps and the active-session count both filter on these.
        Index("ix_refresh_tokens_revoked_expires", "revoked_at", "expires_at"),
    )

    @property
    def is_revoked(self) -> bool:
        return self.revoked_at is not None
