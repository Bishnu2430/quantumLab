# syntax=docker/dockerfile:1.7
# Multi-stage build: dependencies resolve in a builder, the runtime image
# carries only the virtualenv, the application source and the curriculum.
#
# The build context is the repository root, not apps/api, because the exported
# curriculum lives in packages/ and has to travel with the image.

FROM python:3.12-slim-bookworm AS builder

COPY --from=ghcr.io/astral-sh/uv:0.5 /uv /usr/local/bin/uv

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=never

WORKDIR /app

# Dependencies install in their own layer so application edits do not force a
# reinstall of the (large) quantum stack on every build.
COPY apps/api/pyproject.toml apps/api/uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project --extra quantum --extra server

# Application source, flattened so `app` is importable from /app.
COPY apps/api/app ./app
COPY apps/api/alembic ./alembic
COPY apps/api/alembic.ini ./alembic.ini

# The exported curriculum travels with the image so lesson code execution works
# in a container that has no access to the repository.
COPY packages/curriculum ./curriculum

RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --extra quantum --extra server


FROM python:3.12-slim-bookworm AS runtime

# Never run application code as root.
RUN groupadd --system --gid 1001 quantum \
 && useradd --system --uid 1001 --gid quantum --create-home quantum

WORKDIR /app

# The Docker CLI, so the API can start sandbox containers on a daemon whose
# socket is shared in. Client only — no daemon runs inside this image.
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates curl gnupg \
 && install -m 0755 -d /etc/apt/keyrings \
 && curl -fsSL https://download.docker.com/linux/debian/gpg \
      -o /etc/apt/keyrings/docker.asc \
 && chmod a+r /etc/apt/keyrings/docker.asc \
 && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
https://download.docker.com/linux/debian bookworm stable" > /etc/apt/sources.list.d/docker.list \
 && apt-get update \
 && apt-get install -y --no-install-recommends docker-ce-cli \
 && apt-get purge -y gnupg \
 && apt-get autoremove -y \
 && rm -rf /var/lib/apt/lists/*

COPY --from=builder --chown=quantum:quantum /app /app

ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app \
    CURRICULUM_PATH=/app/curriculum/curriculum.json

USER quantum

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://localhost:8000/health', timeout=4).status==200 else 1)"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
