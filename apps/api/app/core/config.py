"""Typed application settings, loaded from the environment.

Every environment-dependent value in the service resolves through this module
so that deployment differences (local Docker vs. serverless) are expressed in
one place rather than scattered `os.getenv` calls.
"""

from __future__ import annotations

import json
from functools import lru_cache
from typing import Annotated, Literal

from pydantic import Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

Environment = Literal["development", "test", "production"]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", ".env.local"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    environment: Environment = "development"

    # --- database ---------------------------------------------------------
    # Async driver by default. Tests fall back to in-memory SQLite so the suite
    # runs without a database daemon; CI overrides this to a real Postgres.
    database_url: str = "postgresql+psycopg://quantum:quantum@localhost:5432/quantumlab"

    # Serverless platforms give each invocation its own process, so a local
    # connection pool is wasted memory and holds server-side connections open.
    serverless: bool = False

    db_echo: bool = False

    # --- auth -------------------------------------------------------------
    jwt_secret_key: SecretStr = SecretStr("dev-only-insecure-secret-change-me")
    jwt_algorithm: str = "HS256"
    access_token_ttl_minutes: int = 15
    refresh_token_ttl_days: int = 14

    cookie_domain: str | None = None
    cookie_samesite: Literal["lax", "strict", "none"] = "lax"

    # --- http -------------------------------------------------------------
    # NoDecode is required, not cosmetic. Without it pydantic-settings treats a
    # list-typed field as JSON and calls json.loads() on the raw env value at
    # the *source* level, before any field validator runs -- so a perfectly
    # ordinary `ALLOWED_ORIGINS=a,b` crashes the service on startup with an
    # opaque JSONDecodeError. NoDecode hands the string through untouched so
    # the validator below can split it.
    allowed_origins: Annotated[list[str], NoDecode] = Field(
        default=["http://localhost:3000", "http://127.0.0.1:3000"]
    )

    # --- ai ---------------------------------------------------------------
    groq_api_key: SecretStr | None = None
    groq_model: str = "llama-3.3-70b-versatile"

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def _split_origins(cls, value: object) -> object:
        """Accept either a comma-separated string or a JSON array.

        Comma-separated is what `.env.example` documents and what compose
        passes. JSON is what some deployment tooling emits, and since NoDecode
        turned off the built-in JSON handling it has to be dealt with here.
        """
        if not isinstance(value, str):
            return value

        text = value.strip()
        if text.startswith("["):
            try:
                return json.loads(text)
            except json.JSONDecodeError:
                # Fall through: a malformed array is better reported as a
                # normal validation error than as a raw JSON exception.
                pass

        return [origin.strip() for origin in text.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def cookie_secure(self) -> bool:
        """Cookies are Secure everywhere except local HTTP development."""
        return self.is_production

    def validate_for_production(self) -> None:
        """Fail fast on startup rather than serving traffic with dev defaults."""
        if not self.is_production:
            return
        problems: list[str] = []
        if self.jwt_secret_key.get_secret_value() == "dev-only-insecure-secret-change-me":
            problems.append("JWT_SECRET_KEY is still the development default")
        if "*" in self.allowed_origins:
            problems.append("ALLOWED_ORIGINS must not be a wildcard when cookies are used")
        if not self.allowed_origins:
            problems.append("ALLOWED_ORIGINS must list at least one origin")
        if problems:
            raise RuntimeError(
                "Refusing to start in production: " + "; ".join(problems)
            )


@lru_cache
def get_settings() -> Settings:
    return Settings()
