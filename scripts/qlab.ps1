<#
.SYNOPSIS
  Amplitude Lab stack management (PowerShell).
.DESCRIPTION
  Windows-native equivalent of scripts/qlab.sh. Run `.\scripts\qlab.ps1 help`
  for the command list. Every command is idempotent and safe to re-run.
#>
[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string]$Command = 'help',

    [Parameter(Position = 1, ValueFromRemainingArguments = $true)]
    [string[]]$Rest
)

$ErrorActionPreference = 'Stop'

$Root = Split-Path -Parent $PSScriptRoot
$ApiDir = Join-Path $Root 'apps\api'
$WebDir = Join-Path $Root 'apps\web'

function Write-Info { param([string]$m) Write-Host "==> $m" -ForegroundColor Cyan }
function Write-Ok   { param([string]$m) Write-Host "  ok $m" -ForegroundColor Green }
function Write-Warn { param([string]$m) Write-Host "  !! $m" -ForegroundColor Yellow }
function Write-Err  { param([string]$m) Write-Host "error: $m" -ForegroundColor Red }

function Assert-Command {
    param([string]$Name)
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        Write-Err "$Name is required but not installed."
        exit 1
    }
}

function Assert-Docker {
    Assert-Command docker
    docker info *> $null
    if (-not $?) {
        Write-Err 'Docker daemon is not running. Start Docker Desktop and retry.'
        exit 1
    }
}

function Initialize-EnvFile {
    $envPath = Join-Path $Root '.env'
    if (Test-Path $envPath) { return }

    Write-Warn '.env not found; creating from .env.example'
    Copy-Item (Join-Path $Root '.env.example') $envPath

    # Generate a per-install secret rather than shipping the shared default.
    $bytes = [byte[]]::new(32)
    [System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
    $secret = ($bytes | ForEach-Object { $_.ToString('x2') }) -join ''
    (Get-Content $envPath) -replace '^JWT_SECRET_KEY=.*', "JWT_SECRET_KEY=$secret" |
        Set-Content $envPath -Encoding utf8
    Write-Ok 'generated a JWT_SECRET_KEY'
}

function Invoke-Up {
    Assert-Docker; Initialize-EnvFile
    Write-Info 'Building and starting the stack'
    docker compose up -d --build
    if (-not $?) { exit 1 }
    Write-Info 'Applying database migrations'
    docker compose exec -T api alembic upgrade head
    $webPort = if ($env:WEB_PORT) { $env:WEB_PORT } else { '3000' }
    $apiPort = if ($env:API_PORT) { $env:API_PORT } else { '8000' }
    Write-Ok "web  http://localhost:$webPort"
    Write-Ok "api  http://localhost:$apiPort/docs"
}

function Invoke-Down {
    Assert-Docker
    Write-Info 'Stopping the stack'
    docker compose down
}

function Invoke-Reset {
    Assert-Docker
    Write-Warn 'This deletes the database volume and all of its data.'
    $reply = Read-Host "Type 'reset' to confirm"
    if ($reply -ne 'reset') { Write-Info 'Cancelled.'; return }
    docker compose down -v
    Write-Ok 'volumes removed'
}

function Invoke-Dev {
    Assert-Command uv; Initialize-EnvFile; Assert-Docker
    Write-Info 'Starting Postgres only; api and web run on the host with hot reload'
    docker compose up -d db
    Write-Info 'api  -> cd apps\api; uv run uvicorn app.main:app --reload'
    Write-Info 'web  -> cd apps\web; npm run dev'
}

function Invoke-Test {
    Assert-Command uv
    # Re-export first: the curriculum verification reads the JSON artifact, and
    # a stale one would test yesterday's content.
    Write-Info 'Exporting curriculum'
    Push-Location $WebDir
    try { npm run --silent content:export; if (-not $?) { exit 1 } } finally { Pop-Location }
    Write-Info 'Backend tests'
    Push-Location $ApiDir
    try { uv run pytest; if (-not $?) { exit 1 } } finally { Pop-Location }
    Write-Info 'Frontend typecheck'
    Push-Location $WebDir
    try { npx tsc --noEmit; if (-not $?) { exit 1 } } finally { Pop-Location }
    Write-Ok 'all checks passed'
}

function Invoke-Lint {
    Assert-Command uv
    Push-Location $ApiDir
    try {
        uv run ruff check app tests
        if ($?) { uv run ruff format --check app tests }
    } finally { Pop-Location }
}

function Invoke-Format {
    Assert-Command uv
    Push-Location $ApiDir
    try {
        uv run ruff check app tests --fix
        uv run ruff format app tests
    } finally { Pop-Location }
}

function Show-Help {
    @'
Amplitude Lab

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

  Quality
    test             backend tests and frontend typecheck
    lint             ruff check and format check
    format           apply ruff fixes and formatting
'@ | Write-Host
}

switch ($Command.ToLower()) {
    'up'    { Invoke-Up }
    'down'  { Invoke-Down }
    'dev'   { Invoke-Dev }
    'reset' { Invoke-Reset }
    'ps'    { Assert-Docker; docker compose ps }
    'logs'  {
        Assert-Docker
        if ($Rest) { docker compose logs -f --tail=100 $Rest[0] }
        else { docker compose logs -f --tail=100 }
    }
    'migrate' { Assert-Docker; docker compose exec -T api alembic upgrade head; Write-Ok 'migrations applied' }
    'revision' {
        Assert-Docker
        if (-not $Rest) { Write-Err 'usage: qlab revision "describe the change"'; exit 1 }
        docker compose exec -T api alembic revision --autogenerate -m ($Rest -join ' ')
    }
    'create-admin' {
        Assert-Docker
        if (-not $Rest) { Write-Err 'usage: qlab create-admin <email> [name]'; exit 1 }
        $name = if ($Rest.Count -gt 1) { $Rest[1] } else { 'Administrator' }
        docker compose exec -T api python -m app.cli create-admin --email $Rest[0] --name $name
    }
    'test'   { Invoke-Test }
    'lint'   { Invoke-Lint }
    'format' { Invoke-Format }
    'help'   { Show-Help }
    default  { Write-Err "unknown command: $Command"; Write-Host ''; Show-Help; exit 1 }
}
