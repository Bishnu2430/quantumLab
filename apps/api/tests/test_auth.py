"""Authentication and RBAC behaviour.

These assert the security properties, not just that the happy path returns 200:
tokens must not be readable by JavaScript, a refresh token must not work as an
access token, rotation must invalidate its predecessor, and login must not
reveal whether an address is registered.
"""

from __future__ import annotations

import pytest
from httpx import AsyncClient
from tests.conftest import promote

pytestmark = pytest.mark.asyncio

VALID_PASSWORD = "correct-horse-battery-7"


# --- registration ---------------------------------------------------------

async def test_register_returns_user_and_sets_httponly_cookies(client: AsyncClient) -> None:
    res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "New.User@Example.com",
            "display_name": "New User",
            "password": VALID_PASSWORD,
        },
    )
    assert res.status_code == 201, res.text
    body = res.json()

    assert body["user"]["email"] == "new.user@example.com"  # normalized
    assert body["user"]["role"] == "learner"  # self-registration never elevates
    assert "password" not in res.text and "hash" not in res.text

    cookies = {c.name: c for c in client.cookies.jar}
    assert "qlab_access" in cookies
    assert "qlab_refresh" in cookies
    # httpOnly keeps tokens out of reach of page scripts (XSS containment).
    for header in res.headers.get_list("set-cookie"):
        assert "HttpOnly" in header


async def test_duplicate_email_is_rejected(client: AsyncClient, registered_user: dict) -> None:
    res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": registered_user["email"].upper(),
            "display_name": "Impostor",
            "password": VALID_PASSWORD,
        },
    )
    assert res.status_code == 409
    assert res.json()["detail"]["code"] == "EMAIL_TAKEN"


@pytest.mark.parametrize(
    "password",
    ["short", "123456789012345", "abcdefghijklmnop", "aaaaaaaaaaaaaaaa"],
)
async def test_weak_passwords_are_rejected(client: AsyncClient, password: str) -> None:
    res = await client.post(
        "/api/v1/auth/register",
        json={"email": "weak@example.com", "display_name": "Weak", "password": password},
    )
    assert res.status_code == 422


# --- login ----------------------------------------------------------------

async def test_login_succeeds_with_correct_credentials(
    client: AsyncClient, registered_user: dict
) -> None:
    await client.post("/api/v1/auth/logout")
    res = await client.post(
        "/api/v1/auth/login",
        json={"email": registered_user["email"], "password": VALID_PASSWORD},
    )
    assert res.status_code == 200
    assert res.json()["user"]["email"] == registered_user["email"]


async def test_login_does_not_reveal_whether_an_account_exists(
    client: AsyncClient, registered_user: dict
) -> None:
    wrong_password = await client.post(
        "/api/v1/auth/login",
        json={"email": registered_user["email"], "password": "definitely-wrong-1"},
    )
    unknown_email = await client.post(
        "/api/v1/auth/login",
        json={"email": "nobody@example.com", "password": "definitely-wrong-1"},
    )
    assert wrong_password.status_code == unknown_email.status_code == 401
    assert wrong_password.json() == unknown_email.json()


# --- session ---------------------------------------------------------------

async def test_me_requires_authentication(client: AsyncClient) -> None:
    client.cookies.clear()
    res = await client.get("/api/v1/auth/me")
    assert res.status_code == 401


async def test_me_returns_the_signed_in_account(
    client: AsyncClient, registered_user: dict
) -> None:
    res = await client.get("/api/v1/auth/me")
    assert res.status_code == 200
    assert res.json()["email"] == registered_user["email"]


async def test_refresh_token_is_not_accepted_as_an_access_token(
    client: AsyncClient, registered_user: dict
) -> None:
    """Without an explicit `type` claim check, a refresh token would authorise
    every authenticated endpoint for its whole (much longer) lifetime."""
    refresh = client.cookies.get("qlab_refresh")
    assert refresh
    client.cookies.clear()
    res = await client.get(
        "/api/v1/auth/me", headers={"Authorization": f"Bearer {refresh}"}
    )
    assert res.status_code == 401


async def test_refresh_rotates_and_invalidates_the_previous_token(
    client: AsyncClient, registered_user: dict
) -> None:
    original = client.cookies.get("qlab_refresh")

    rotated = await client.post("/api/v1/auth/refresh")
    assert rotated.status_code == 200
    assert client.cookies.get("qlab_refresh") != original

    # Replaying the superseded token must fail...
    client.cookies.set("qlab_refresh", original, path="/api/v1/auth")
    replay = await client.post("/api/v1/auth/refresh")
    assert replay.status_code == 401
    assert replay.json()["detail"]["code"] == "REFRESH_TOKEN_REUSED"


async def test_reuse_of_a_rotated_token_revokes_every_session(
    client: AsyncClient, registered_user: dict
) -> None:
    """Replay means the token leaked, so the whole account is signed out."""
    original = client.cookies.get("qlab_refresh")
    await client.post("/api/v1/auth/refresh")  # rotates; `original` now revoked

    client.cookies.set("qlab_refresh", original, path="/api/v1/auth")
    await client.post("/api/v1/auth/refresh")  # triggers the breach response

    # Even the legitimately rotated token is now dead.
    res = await client.post("/api/v1/auth/refresh")
    assert res.status_code == 401


async def test_logout_clears_cookies_and_revokes_the_session(
    client: AsyncClient, registered_user: dict
) -> None:
    res = await client.post("/api/v1/auth/logout")
    assert res.status_code == 200
    assert (await client.get("/api/v1/auth/me")).status_code == 401


async def test_logout_is_safe_when_not_signed_in(client: AsyncClient) -> None:
    client.cookies.clear()
    assert (await client.post("/api/v1/auth/logout")).status_code == 200


# --- RBAC -----------------------------------------------------------------

async def test_learner_cannot_reach_admin_routes(
    client: AsyncClient, registered_user: dict
) -> None:
    res = await client.get("/api/v1/admin/users")
    assert res.status_code == 403
    detail = res.json()["detail"]
    assert detail["code"] == "INSUFFICIENT_ROLE"
    # The message names both roles so the UI can explain the gap.
    assert detail["requiredRole"] == "admin"
    assert detail["currentRole"] == "learner"


async def test_admin_can_list_users(
    client: AsyncClient, registered_user: dict, db_session
) -> None:
    await promote(db_session, registered_user["email"], "admin")
    res = await client.get("/api/v1/admin/users")
    assert res.status_code == 200
    assert any(u["email"] == registered_user["email"] for u in res.json())


async def test_roles_are_cumulative(client: AsyncClient, registered_user: dict, db_session) -> None:
    """An admin satisfies a researcher requirement; a learner does not."""
    from app.db.models.user import Role

    assert Role.ADMIN.satisfies(Role.RESEARCHER)
    assert Role.RESEARCHER.satisfies(Role.LEARNER)
    assert not Role.LEARNER.satisfies(Role.RESEARCHER)


async def test_role_change_takes_effect_without_waiting_for_token_expiry(
    client: AsyncClient, registered_user: dict, db_session
) -> None:
    """The role is read from the database per request, not trusted from the JWT."""
    assert (await client.get("/api/v1/admin/users")).status_code == 403
    await promote(db_session, registered_user["email"], "admin")
    assert (await client.get("/api/v1/admin/users")).status_code == 200


async def test_admin_cannot_demote_the_last_admin(
    client: AsyncClient, registered_user: dict, db_session
) -> None:
    await promote(db_session, registered_user["email"], "admin")
    me = (await client.get("/api/v1/auth/me")).json()

    res = await client.patch(
        f"/api/v1/admin/users/{me['id']}/role", json={"role": "learner"}
    )
    assert res.status_code == 409
    assert res.json()["detail"]["code"] == "LAST_ADMIN"


async def test_admin_promoting_a_learner_revokes_their_sessions(
    client: AsyncClient, registered_user: dict, db_session
) -> None:
    await promote(db_session, registered_user["email"], "admin")
    admin_cookies = dict(client.cookies)

    # A second account to act on.
    other = AsyncClient(transport=client._transport, base_url="http://testserver")
    await other.post(
        "/api/v1/auth/register",
        json={
            "email": "target@example.com",
            "display_name": "Target",
            "password": VALID_PASSWORD,
        },
    )
    target_id = (await other.get("/api/v1/auth/me")).json()["id"]

    client.cookies.update(admin_cookies)
    res = await client.patch(
        f"/api/v1/admin/users/{target_id}/role", json={"role": "researcher"}
    )
    assert res.status_code == 200
    assert res.json()["role"] == "researcher"

    # Their refresh token was revoked, so the elevated role is re-issued cleanly.
    assert (await other.post("/api/v1/auth/refresh")).status_code == 401
    await other.aclose()


async def test_admin_stats_reports_counts(
    client: AsyncClient, registered_user: dict, db_session
) -> None:
    await promote(db_session, registered_user["email"], "admin")
    res = await client.get("/api/v1/admin/stats")
    assert res.status_code == 200
    body = res.json()
    assert body["totalUsers"] >= 1
    assert body["activeSessions"] >= 1
