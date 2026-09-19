"""Typed application settings, loaded from the environment.

Every environment-dependent value in the service resolves through this module
so that deployment differences (local Docker vs. serverless) are expressed in
one place rather than scattered `os.getenv` calls.
"""

from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

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
    allowed_origins: list[str] = Field(
        default=["http://localhost:3000", "http://127.0.0.1:3000"]
    )

    # --- ai ---------------------------------------------------------------
    groq_api_key: SecretStr | None = None
    groq_model: str = "llama-3.3-70b-versatile"

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def _split_origins(cls, value: object) -> object:
        """Accept a comma-separated string, which is how env vars carry lists."""
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

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
