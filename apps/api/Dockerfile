# syntax=docker/dockerfile:1.7
# Multi-stage build: dependencies resolve in a builder, the runtime image
# carries only the virtualenv and application source.

FROM python:3.12-slim-bookworm AS builder

COPY --from=ghcr.io/astral-sh/uv:0.5 /uv /usr/local/bin/uv

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=never

WORKDIR /app

# Dependencies install in their own layer so application edits don't force a
# reinstall of the (large) quantum stack on every build.
COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project --extra quantum --extra server

COPY . .
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --extra quantum --extra server


FROM python:3.12-slim-bookworm AS runtime

# Never run application code as root.
RUN groupadd --system --gid 1001 quantum \
 && useradd --system --uid 1001 --gid quantum --create-home quantum

WORKDIR /app

COPY --from=builder --chown=quantum:quantum /app /app

ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

USER quantum

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://localhost:8000/health', timeout=4).status==200 else 1)"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
