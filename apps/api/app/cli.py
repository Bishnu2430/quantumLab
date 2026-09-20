"""Operational commands.

Run with ``uv run python -m app.cli <command>``, or through ``scripts/qlab``.
"""

from __future__ import annotations

import argparse
import asyncio
import secrets
import sys
from datetime import UTC, datetime

from sqlalchemy import func, select

from app.core.security import hash_password
from app.db.models.user import RefreshToken, Role, User
from app.db.session import dispose_engine, get_sessionmaker


async def _create_admin(email: str, display_name: str, password: str | None) -> int:
    """Create or promote an admin account.

    The first admin cannot be created through the API — self-registration always
    yields a learner — so this is the documented bootstrap path.
    """
    generated = password is None
    if generated:
        # url-safe 24 bytes clears the 12-character minimum comfortably.
        password = secrets.token_urlsafe(24)

    async with get_sessionmaker()() as db:
        existing = await db.scalar(select(User).where(User.email == email.lower()))
        if existing is not None:
            if existing.role is Role.ADMIN:
                print(f"{email} is already an admin.")
                return 0
            existing.role = Role.ADMIN
            await db.commit()
            print(f"Promoted existing account {email} to admin.")
            return 0

        db.add(
            User(
                email=email.lower(),
                display_name=display_name,
                password_hash=hash_password(password),
                role=Role.ADMIN,
            )
        )
        await db.commit()

    print(f"Created admin {email}")
    if generated:
        print(f"Generated password: {password}")
        print("Store it now: it is not recoverable and will not be shown again.")
    return 0


async def _prune_tokens() -> int:
    """Delete refresh tokens that are expired or revoked.

    Worth running periodically; the table only ever grows otherwise.
    """
    from sqlalchemy import delete, or_

    async with get_sessionmaker()() as db:
        result = await db.execute(
            delete(RefreshToken).where(
                or_(
                    RefreshToken.expires_at < datetime.now(UTC),
                    RefreshToken.revoked_at.is_not(None),
                )
            )
        )
        await db.commit()
    print(f"Removed {result.rowcount or 0} stale refresh token(s).")
    return 0


async def _stats() -> int:
    async with get_sessionmaker()() as db:
        rows = (await db.execute(select(User.role, func.count()).group_by(User.role))).all()
        total = sum(count for _, count in rows)
    print(f"Users: {total}")
    for role, count in rows:
        print(f"  {role.value:<12} {count}")
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="qlab", description="Quantum Lab admin commands")
    sub = parser.add_subparsers(dest="command", required=True)

    create = sub.add_parser("create-admin", help="Create or promote an admin account")
    create.add_argument("--email", required=True)
    create.add_argument("--name", default="Administrator")
    create.add_argument(
        "--password",
        default=None,
        help="Omit to generate a strong password and print it once.",
    )

    sub.add_parser("prune-tokens", help="Delete expired and revoked refresh tokens")
    sub.add_parser("stats", help="Print user counts by role")

    args = parser.parse_args(argv)

    async def _run() -> int:
        try:
            if args.command == "create-admin":
                return await _create_admin(args.email, args.name, args.password)
            if args.command == "prune-tokens":
                return await _prune_tokens()
            if args.command == "stats":
                return await _stats()
            return 1
        finally:
            await dispose_engine()

    return asyncio.run(_run())


if __name__ == "__main__":
    sys.exit(main())
