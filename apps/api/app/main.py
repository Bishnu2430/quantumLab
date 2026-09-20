"""FastAPI application entrypoint."""

from __future__ import annotations

import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_v1_router
from app.core.config import get_settings
from app.db.session import dispose_engine

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncGenerator[None, None]:
    app_settings = get_settings()
    app_settings.validate_for_production()
    logger.info("Starting quantum-lab-api in %s mode", app_settings.environment)
    yield
    await dispose_engine()


settings = get_settings()

app = FastAPI(
    title="Amplitude Lab API",
    description="Quantum simulation, curriculum delivery, and sandboxed code execution.",
    version="0.2.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Credentials now travel in cookies, so the origin list must be explicit.
# Browsers reject `Access-Control-Allow-Origin: *` on credentialed requests,
# so the previous wildcard-in-development branch would have silently broken
# authentication for every local developer.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(api_v1_router)


@app.get("/health", tags=["system"])
def health_check() -> dict[str, str]:
    return {
        "status": "online",
        "service": "quantum-lab-api",
        "version": "0.2.0",
        "backend": "qiskit-aer",
        "environment": settings.environment,
    }
