"""Shared test fixtures.

The suite runs against in-memory SQLite by default so it needs no database
daemon; point ``TEST_DATABASE_URL`` at Postgres to run the same tests against
the real engine in CI.
"""

from __future__ import annotations

import os
from collections.abc import AsyncGenerator

import pytest
import pytest_asyncio
from argon2 import PasswordHasher
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL", "sqlite+aiosqlite:///:memory:")

# Set before the app imports settings, so the application never reaches for a
# real database during tests.
os.environ.setdefault("DATABASE_URL", TEST_DATABASE_URL)
os.environ.setdefault("ENVIRONMENT", "test")
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-not-used-anywhere-else")


@pytest.fixture(scope="session", autouse=True)
def _fast_password_hashing() -> None:
    """Argon2 is deliberately slow; production parameters would dominate the suite.

    Only the cost parameters change — the algorithm under test stays Argon2id.
    """
    from app.core import security

    security._hasher = PasswordHasher(time_cost=1, memory_cost=8, parallelism=1)


@pytest_asyncio.fixture
async def db_engine(tmp_path):
    """A fresh, isolated database per test.

    Deliberately a temp *file* rather than ``:memory:``: an in-memory SQLite
    database belongs to a single connection, so anything that opens a second
    one silently gets an empty schema. A file removes that whole failure mode
    and behaves far closer to the Postgres this runs against in production.
    """
    # Importing the model package is what registers the tables on
    # Base.metadata. Without it create_all() silently creates nothing, and the
    # failure only shows up in whichever test happens to run first.
    import app.db.models  # noqa: F401
    from app.db.base import Base

    url = TEST_DATABASE_URL
    if url.endswith(":memory:"):
        url = f"sqlite+aiosqlite:///{tmp_path.as_posix()}/test.db"

    engine = create_async_engine(url)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(db_engine) -> AsyncGenerator[AsyncSession, None]:
    maker = async_sessionmaker(db_engine, expire_on_commit=False, autoflush=False)
    async with maker() as session:
        yield session


@pytest_asyncio.fixture
async def client(db_engine) -> AsyncGenerator[AsyncClient, None]:
    """An HTTP client bound to the app, with the database dependency overridden."""
    from app.db.session import get_db
    from app.main import app

    maker = async_sessionmaker(db_engine, expire_on_commit=False, autoflush=False)

    async def _override_get_db() -> AsyncGenerator[AsyncSession, None]:
        async with maker() as session:
            yield session

    app.dependency_overrides[get_db] = _override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def registered_user(client: AsyncClient) -> dict[str, str]:
    """A registered learner, with the client already holding its session cookies."""
    payload = {
        "email": "learner@example.com",
        "display_name": "Test Learner",
        "password": "correct-horse-battery-7",
    }
    res = await client.post("/api/v1/auth/register", json=payload)
    assert res.status_code == 201, res.text
    return payload


async def promote(db_session: AsyncSession, email: str, role: str) -> None:
    """Raise an account's role directly, bypassing the admin API."""
    from sqlalchemy import select

    from app.db.models.user import Role, User

    user = await db_session.scalar(select(User).where(User.email == email))
    assert user is not None
    user.role = Role(role)
    await db_session.commit()
