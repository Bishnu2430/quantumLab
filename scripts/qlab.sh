#!/usr/bin/env bash
# Quantum Lab — stack management.
#
#   ./scripts/qlab.sh <command>
#
# Every command is idempotent and safe to re-run.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

API_DIR="$ROOT/apps/api"
WEB_DIR="$ROOT/apps/web"

c_info()  { printf '\033[36m==>\033[0m %s\n' "$*"; }
c_ok()    { printf '\033[32m  ok\033[0m %s\n' "$*"; }
c_warn()  { printf '\033[33m  !!\033[0m %s\n' "$*"; }
c_err()   { printf '\033[31merror:\033[0m %s\n' "$*" >&2; }

require() {
  command -v "$1" >/dev/null 2>&1 || { c_err "$1 is required but not installed."; exit 1; }
}

docker_up() {
  require docker
  if ! docker info >/dev/null 2>&1; then
    c_err "Docker daemon is not running. Start Docker Desktop and retry."
    exit 1
  fi
}

ensure_env() {
  if [ ! -f "$ROOT/.env" ]; then
    c_warn ".env not found; creating from .env.example"
    cp "$ROOT/.env.example" "$ROOT/.env"
    # A generated secret beats shipping the same default everywhere.
    if command -v openssl >/dev/null 2>&1; then
      secret="$(openssl rand -hex 32)"
      # Portable in-place edit: BSD and GNU sed disagree on -i.
      sed "s|^JWT_SECRET_KEY=.*|JWT_SECRET_KEY=$secret|" "$ROOT/.env" > "$ROOT/.env.tmp"
      mv "$ROOT/.env.tmp" "$ROOT/.env"
      c_ok "generated a JWT_SECRET_KEY"
    fi
  fi
}

cmd_up() {
  docker_up; ensure_env
  c_info "Building and starting the stack"
  docker compose up -d --build
  c_info "Applying database migrations"
  docker compose exec -T api alembic upgrade head
  c_ok "web  http://localhost:${WEB_PORT:-3000}"
  c_ok "api  http://localhost:${API_PORT:-8000}/docs"
}

cmd_down() {
  docker_up
  c_info "Stopping the stack"
  docker compose down
}

cmd_reset() {
  docker_up
  c_warn "This deletes the database volume and all of its data."
  read -r -p "Type 'reset' to confirm: " reply
  [ "$reply" = "reset" ] || { c_info "Cancelled."; exit 0; }
  docker compose down -v
  c_ok "volumes removed"
}

cmd_logs()    { docker_up; docker compose logs -f --tail=100 "${1:-}"; }
cmd_ps()      { docker_up; docker compose ps; }
cmd_migrate() { docker_up; docker compose exec -T api alembic upgrade head; c_ok "migrations applied"; }

cmd_revision() {
  docker_up
  [ $# -ge 1 ] || { c_err "usage: qlab revision \"describe the change\""; exit 1; }
  docker compose exec -T api alembic revision --autogenerate -m "$*"
}

cmd_create_admin() {
  docker_up
  [ $# -ge 1 ] || { c_err "usage: qlab create-admin <email> [name]"; exit 1; }
  docker compose exec -T api python -m app.cli create-admin --email "$1" --name "${2:-Administrator}"
}

cmd_dev() {
  require uv
  ensure_env
  c_info "Starting Postgres only; api and web run on the host with hot reload"
  docker_up
  docker compose up -d db
  c_info "api  → cd apps/api && uv run uvicorn app.main:app --reload"
  c_info "web  → cd apps/web && npm run dev"
}

# Opens an interactive psql session against the project database.
# Falls back to a local psql client when the container is not running, so the
# command works whether or not the stack is up.
cmd_db() {
  docker_up
  # shellcheck disable=SC1091
  [ -f "$ROOT/.env" ] && set -a && . "$ROOT/.env" && set +a

  local user="${POSTGRES_USER:-quantum}"
  local database="${POSTGRES_DB:-quantumlab}"

  if docker compose ps --status running db 2>/dev/null | grep -q db; then
    c_info "psql as '$user' on '$database' (inside the db container)"
    c_info "Try: \dt to list tables, \d users to describe one, \q to quit"
    docker compose exec db psql -U "$user" -d "$database"
    return
  fi

  c_warn "The db container is not running."
  if command -v psql >/dev/null 2>&1; then
    c_info "Connecting with the local psql client instead"
    PGPASSWORD="${POSTGRES_PASSWORD:-quantum}"       psql -h localhost -p "${POSTGRES_PORT:-5432}" -U "$user" -d "$database"
  else
    c_err "Start it first with: ./scripts/qlab.sh up   (or 'dev' for just Postgres)"
    exit 1
  fi
}

# Runs a single statement and exits, for scripting and quick checks.
cmd_dbq() {
  docker_up
  [ $# -ge 1 ] || { c_err "usage: qlab dbq \"SELECT count(*) FROM users;\""; exit 1; }
  # shellcheck disable=SC1091
  [ -f "$ROOT/.env" ] && set -a && . "$ROOT/.env" && set +a
  docker compose exec -T db psql -U "${POSTGRES_USER:-quantum}"     -d "${POSTGRES_DB:-quantumlab}" -c "$*"
}

cmd_test() {
  require uv
  # Re-export first: the curriculum verification reads the JSON artifact, and a
  # stale one would test yesterday's content.
  c_info "Exporting curriculum"
  (cd "$WEB_DIR" && npm run --silent content:export)
  c_info "Backend tests"
  (cd "$API_DIR" && uv run pytest)
  c_info "Frontend typecheck"
  (cd "$WEB_DIR" && npx tsc --noEmit)
  c_ok "all checks passed"
}

cmd_lint() {
  require uv
  (cd "$API_DIR" && uv run ruff check app tests && uv run ruff format --check app tests)
}

cmd_format() {
  require uv
  (cd "$API_DIR" && uv run ruff check app tests --fix && uv run ruff format app tests)
}

cmd_help() {
  cat <<'USAGE'
Quantum Lab

  Stack
    up               build and start everything, then migrate
    down             stop the stack
    dev              start Postgres only, for host-side hot reload
    reset            destroy the database volume (asks for confirmation)
    ps               show container status
    logs [service]   follow logs

  Database
    migrate          apply migrations
    revision "msg"   autogenerate a migration
    create-admin <email> [name]
    db               open an interactive psql session on the project database
    dbq "SQL"        run one statement and print the result

  Quality
    test             backend tests and frontend typecheck
    lint             ruff check and format check
    format           apply ruff fixes and formatting
USAGE
}

case "${1:-help}" in
  up)           shift; cmd_up "$@" ;;
  down)         shift; cmd_down "$@" ;;
  dev)          shift; cmd_dev "$@" ;;
  reset)        shift; cmd_reset "$@" ;;
  ps)           shift; cmd_ps "$@" ;;
  logs)         shift; cmd_logs "$@" ;;
  migrate)      shift; cmd_migrate "$@" ;;
  revision)     shift; cmd_revision "$@" ;;
  create-admin) shift; cmd_create_admin "$@" ;;
  db)           shift; cmd_db "$@" ;;
  dbq)          shift; cmd_dbq "$@" ;;
  test)         shift; cmd_test "$@" ;;
  lint)         shift; cmd_lint "$@" ;;
  format)       shift; cmd_format "$@" ;;
  help|--help|-h) cmd_help ;;
  *) c_err "unknown command: $1"; echo; cmd_help; exit 1 ;;
esac
