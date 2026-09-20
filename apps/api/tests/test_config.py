"""Settings parsing.

These exist because a configuration bug does not fail a unit test — it fails at
container startup, which is the worst place to find one. The comma-separated
ALLOWED_ORIGINS form is what `.env.example` documents and what docker-compose
passes, so it has to work.
"""

from __future__ import annotations

import pytest

from app.core.config import Settings


def test_comma_separated_origins_parse() -> None:
    """The documented format.

    Regression: `allowed_origins` is list-typed, and pydantic-settings
    JSON-decodes complex types at the source level, before field validators
    run. Without NoDecode this raised JSONDecodeError and killed the API on
    startup — but only when the variable was actually set, so it passed
    locally and failed in Docker.
    """
    settings = Settings(_env_file=None, ALLOWED_ORIGINS="http://a.test,http://b.test")
    assert settings.allowed_origins == ["http://a.test", "http://b.test"]


def test_origins_tolerate_whitespace() -> None:
    settings = Settings(_env_file=None, ALLOWED_ORIGINS="http://a.test , http://b.test ")
    assert settings.allowed_origins == ["http://a.test", "http://b.test"]


def test_single_origin_parses() -> None:
    settings = Settings(_env_file=None, ALLOWED_ORIGINS="http://only.test")
    assert settings.allowed_origins == ["http://only.test"]


def test_json_array_still_accepted() -> None:
    """Some deployment tooling emits JSON. Accept it rather than surprising it."""
    settings = Settings(_env_file=None, ALLOWED_ORIGINS='["http://a.test","http://b.test"]')
    assert settings.allowed_origins == ["http://a.test", "http://b.test"]


def test_default_origins_when_unset() -> None:
    settings = Settings(_env_file=None)
    assert "http://localhost:3000" in settings.allowed_origins


def test_production_rejects_default_secret() -> None:
    # Passed explicitly: the test session sets JWT_SECRET_KEY in the
    # environment, which would otherwise mask the default this guards against.
    settings = Settings(
        _env_file=None,
        ENVIRONMENT="production",
        JWT_SECRET_KEY="dev-only-insecure-secret-change-me",
    )
    with pytest.raises(RuntimeError, match="JWT_SECRET_KEY"):
        settings.validate_for_production()


def test_production_rejects_wildcard_origin() -> None:
    """A wildcard origin plus credentials is rejected by browsers, so it would
    silently break authentication rather than failing loudly."""
    settings = Settings(
        _env_file=None,
        ENVIRONMENT="production",
        JWT_SECRET_KEY="a-real-secret-for-this-test",
        ALLOWED_ORIGINS="*",
    )
    with pytest.raises(RuntimeError, match="wildcard"):
        settings.validate_for_production()


def test_production_accepts_a_valid_configuration() -> None:
    settings = Settings(
        _env_file=None,
        ENVIRONMENT="production",
        JWT_SECRET_KEY="a-real-secret-for-this-test",
        ALLOWED_ORIGINS="https://quantumlab.example",
    )
    settings.validate_for_production()  # must not raise
