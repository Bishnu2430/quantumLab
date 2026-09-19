"""Administrative endpoints.

Every route here requires the admin role. Actions that would let an admin lock
the platform out of itself — demoting or disabling the last remaining admin —
are refused.
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select, update

from app.core.deps import DbSession, RequireAdmin
from app.db.models.user import RefreshToken, Role, User
from app.schemas.auth import MessageResponse, RoleUpdate, UserRead

router = APIRouter(prefix="/admin", tags=["admin"])


async def _count_active_admins(db: DbSession, excluding: str | None = None) -> int:
    stmt = select(func.count()).select_from(User).where(
        User.role == Role.ADMIN, User.is_active.is_(True)
    )
    if excluding is not None:
        stmt = stmt.where(User.id != excluding)
    return int(await db.scalar(stmt) or 0)


@router.get("/users", response_model=list[UserRead])
async def list_users(
    _: RequireAdmin,
    db: DbSession,
    role: Annotated[Role | None, Query(description="Filter by role")] = None,
    search: Annotated[str | None, Query(max_length=120)] = None,
    limit: Annotated[int, Query(ge=1, le=200)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> list[UserRead]:
    stmt = select(User).order_by(User.created_at.desc()).limit(limit).offset(offset)
    if role is not None:
        stmt = stmt.where(User.role == role)
    if search:
        pattern = f"%{search.lower()}%"
        stmt = stmt.where(
            func.lower(User.email).like(pattern) | func.lower(User.display_name).like(pattern)
        )

    users = (await db.scalars(stmt)).all()
    return [UserRead.model_validate(u) for u in users]


@router.patch("/users/{user_id}/role", response_model=UserRead)
async def set_user_role(
    user_id: str, payload: RoleUpdate, admin: RequireAdmin, db: DbSession
) -> UserRead:
    """Promote or demote an account.

    This is the intended path from learner to researcher, which is what unlocks
    authoring circuits and running custom code.
    """
    user = await db.get(User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "USER_NOT_FOUND", "message": "No such user."},
        )

    if (
        user.role is Role.ADMIN
        and payload.role is not Role.ADMIN
        and await _count_active_admins(db, excluding=user.id) == 0
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "code": "LAST_ADMIN",
                "message": "Cannot demote the last remaining admin.",
            },
        )

    user.role = payload.role
    # A role change must take effect everywhere, not at the next token expiry.
    await db.execute(
        update(RefreshToken)
        .where(RefreshToken.user_id == user.id, RefreshToken.revoked_at.is_(None))
        .values(revoked_at=datetime.now(UTC))
    )
    await db.commit()
    await db.refresh(user)
    return UserRead.model_validate(user)


@router.patch("/users/{user_id}/active", response_model=UserRead)
async def set_user_active(
    user_id: str, is_active: bool, admin: RequireAdmin, db: DbSession
) -> UserRead:
    """Enable or disable an account without deleting its history."""
    user = await db.get(User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "USER_NOT_FOUND", "message": "No such user."},
        )
    if user.id == admin.id and not is_active:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": "SELF_DISABLE", "message": "You cannot disable your own account."},
        )
    if (
        not is_active
        and user.role is Role.ADMIN
        and await _count_active_admins(db, excluding=user.id) == 0
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": "LAST_ADMIN", "message": "Cannot disable the last remaining admin."},
        )

    user.is_active = is_active
    if not is_active:
        await db.execute(
            update(RefreshToken)
            .where(RefreshToken.user_id == user.id, RefreshToken.revoked_at.is_(None))
            .values(revoked_at=datetime.now(UTC))
        )
    await db.commit()
    await db.refresh(user)
    return UserRead.model_validate(user)


@router.post("/users/{user_id}/revoke-sessions", response_model=MessageResponse)
async def revoke_sessions(user_id: str, _: RequireAdmin, db: DbSession) -> MessageResponse:
    """Force a user to sign in again everywhere."""
    user = await db.get(User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "USER_NOT_FOUND", "message": "No such user."},
        )
    result = await db.execute(
        update(RefreshToken)
        .where(RefreshToken.user_id == user_id, RefreshToken.revoked_at.is_(None))
        .values(revoked_at=datetime.now(UTC))
    )
    await db.commit()
    return MessageResponse(message=f"Revoked {result.rowcount or 0} session(s).")


@router.get("/stats", response_model=dict)
async def platform_stats(_: RequireAdmin, db: DbSession) -> dict:
    """Headline counts for the admin dashboard."""
    by_role = (
        await db.execute(
            select(User.role, func.count()).group_by(User.role)
        )
    ).all()
    active_sessions = await db.scalar(
        select(func.count())
        .select_from(RefreshToken)
        .where(
            RefreshToken.revoked_at.is_(None),
            RefreshToken.expires_at > datetime.now(UTC),
        )
    )
    return {
        "usersByRole": {str(role.value): count for role, count in by_role},
        "totalUsers": sum(count for _role, count in by_role),
        "activeSessions": int(active_sessions or 0),
    }
