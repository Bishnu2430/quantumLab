# Quantum Lab

An interactive quantum computing course. Every derivation is worked through step
by step, every circuit runs on a real simulator, and **every stated result is
verified against that simulator in CI** — if a lesson claims physics the
simulator does not reproduce, the build fails and the content does not ship.

Seventeen lessons take you from "what is a qubit" to Grover's search and BB84,
each with worked derivations, an interactive visual, a circuit you run, and
Python you execute in a sandbox.

---

## Quick start

Requires Docker, [uv](https://docs.astral.sh/uv/) and Node 20.

```bash
./scripts/qlab.sh up
```

That builds the images, starts Postgres, the API and the web app, and applies
migrations. Then visit <http://localhost:3000>.

On Windows use `.\scripts\qlab.ps1 up` — the two scripts are equivalent.

### Create the first admin

Self-registration always yields the `learner` role, so the first admin is made
from the command line:

```bash
./scripts/qlab.sh create-admin you@example.com "Your Name"
```

It prints a generated password once. Store it.

---

## The `qlab` script

One entry point for everything, in both shells.

| Command | What it does |
| --- | --- |
| `up` | Build and start the whole stack, then migrate |
| `down` | Stop the stack |
| `dev` | Start Postgres only, so the API and web run on the host with hot reload |
| `reset` | Destroy the database volume (asks for confirmation) |
| `ps` / `logs [service]` | Container status, follow logs |
| `migrate` | Apply migrations |
| `revision "msg"` | Autogenerate a migration |
| `create-admin <email> [name]` | Create or promote an admin |
| **`db`** | **Open an interactive `psql` session on the project database** |
| **`dbq "SQL"`** | **Run one statement and print the result** |
| `test` | Export the curriculum, run the backend suite, typecheck the frontend |
| `lint` / `format` | Ruff check / apply fixes |

### Poking at the database

```bash
./scripts/qlab.sh db
```

Drops you into `psql` inside the `db` container. `\dt` lists tables, `\d users`
describes one, `\q` quits. If the container is not running it falls back to a
local `psql` client. For one-off queries:

```bash
./scripts/qlab.sh dbq "SELECT email, role FROM users ORDER BY created_at;"
```

---

## Architecture

```
apps/web       Next.js 14 — lessons, the lab, the assistant
apps/api       FastAPI — simulation, auth, sandboxed execution
apps/sandbox   The hardened image that runs learner and researcher code
packages/      Generated curriculum artifact, shared schemas
docs/          Architecture notes and the source curriculum corpus
scripts/       qlab, in bash and PowerShell
```

### Content lives in code

Lessons are typed TypeScript modules under `apps/web/src/content/lessons/`, not
a CMS. That means every claim is reviewable in a pull request and the whole
curriculum is type-checked. `npm run content:export` emits
`packages/curriculum/curriculum.json` for the API test suite and the assistant's
retrieval; the artifact is generated, never committed.

A lesson omits `circuit`, `code` or `visual` entirely when it does not earn one.
A theory lesson shows no empty panels and no placeholder gates.

### Correctness is enforced, not reviewed

`apps/api/tests/test_curriculum.py` runs **every lesson circuit** through the
simulator and checks the stated probabilities, **executes every code example** and
checks it prints what the lesson promised, and enforces the editorial rules — no
placeholder text, no uncaptioned equation, no unjustified derivation step, no
un-annotated gate, no dangling prerequisite.

### Roles

Roles are cumulative: `learner < researcher < admin`.

| | Learner | Researcher | Admin |
| --- | --- | --- | --- |
| Read lessons, drive visuals | yes | yes | yes |
| Run the code a lesson ships | yes | yes | yes |
| Write and run their own code | — | yes | yes |
| Build circuits from scratch | — | yes | yes |
| Manage users and roles | — | — | yes |

A learner never submits code. They send a **lesson slug**, and the server runs
its own copy of that snippet — so the untrusted-code path does not exist for
that role at all.

### The execution sandbox

Researcher code runs in a fresh container per execution, destroyed afterwards:
no network, read-only root filesystem, all capabilities dropped, non-root user,
memory and swap capped together, process count limited, and a size-capped
`noexec` tmpfs as the only writable surface.

Without a Docker daemon the API falls back to an unsandboxed local runner. That
runner refuses to start in production and flags every result `isolated: false`,
which the UI displays plainly.

---

## Development without Docker

```bash
./scripts/qlab.sh dev          # Postgres only

cd apps/api && uv run uvicorn app.main:app --reload
cd apps/web && npm run dev
```

## Tests

```bash
./scripts/qlab.sh test
```

Runs 217 backend tests and the frontend typecheck. The suite uses file-backed
SQLite so it needs no database daemon; set `TEST_DATABASE_URL` to run it against
Postgres.

## Configuration

Copy `.env.example` to `.env`; `qlab up` does this for you and generates a
`JWT_SECRET_KEY` on first run. The API refuses to start in production while that
secret is still the default, or while `ALLOWED_ORIGINS` is a wildcard — cookies
are rejected by browsers against wildcard origins, so that combination would
silently break authentication.

`GROQ_API_KEY` is optional. Without it the assistant reports that it is not
configured and everything else works normally.
