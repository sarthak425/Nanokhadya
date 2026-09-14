#!/usr/bin/env pwsh
# =====================================================
#   NanoTech Food Safety System — Launch Script
#   Starts both backend (FastAPI) and frontend (Vite)
# =====================================================

param(
    [switch]$BackendOnly,
    [switch]$FrontendOnly,
    [switch]$Install        # Run npm install + pip install first
)

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "   NanoTech Food Safety System" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "   Backend  : http://localhost:8000" -ForegroundColor White
Write-Host "   Frontend : http://localhost:5173" -ForegroundColor White
Write-Host "   API Docs : http://localhost:8000/docs" -ForegroundColor White
Write-Host "   Admin    : http://localhost:5173/admin" -ForegroundColor White
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# ── 1. Create .env if it doesn't exist ──────────────────────────────
$EnvFile = "$Root\backend\.env"
$EnvExample = "$Root\backend\.env.example"
if (-not (Test-Path $EnvFile)) {
    if (Test-Path $EnvExample) {
        Copy-Item $EnvExample $EnvFile
        Write-Host "✓ Created backend\.env from .env.example" -ForegroundColor Green
    } else {
        # Create a minimal .env
        @"
APP_NAME=NanoTech Food Safety System
APP_VERSION=0.1.0
DATA_SOURCE=DEVELOPMENT
DATABASE_URL=sqlite:///./nanotech.db
LOG_LEVEL=INFO
"@ | Set-Content $EnvFile
        Write-Host "✓ Created minimal backend\.env" -ForegroundColor Green
    }
}

# ── 2. Optional: install dependencies ───────────────────────────────
if ($Install) {
    Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
    Set-Location "$Root\backend"
    pip install -r requirements.txt
    Write-Host "Installing Node dependencies..." -ForegroundColor Yellow
    Set-Location "$Root\frontend"
    npm install
    Set-Location $Root
    Write-Host "✓ All dependencies installed" -ForegroundColor Green
    Write-Host ""
}

# ── 3. Start Backend ─────────────────────────────────────────────────
if (-not $FrontendOnly) {
    Write-Host "▶ Starting FastAPI backend..." -ForegroundColor Yellow
    $backendProc = Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "cd '$Root\backend'; Write-Host '[ BACKEND ]' -ForegroundColor Cyan; python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
    ) -PassThru -WindowStyle Normal

    # Give the backend a moment to start
    Write-Host "   Waiting for backend to start..." -ForegroundColor DarkGray
    Start-Sleep -Seconds 3
    Write-Host "✓ Backend started (PID $($backendProc.Id))" -ForegroundColor Green
    Write-Host ""
}

# ── 4. Start Frontend ────────────────────────────────────────────────
if (-not $BackendOnly) {
    Write-Host "▶ Starting Vite frontend..." -ForegroundColor Yellow
    Set-Location "$Root\frontend"
    npm run dev
}

# ── 5. Cleanup ───────────────────────────────────────────────────────
if ($backendProc -and -not $backendProc.HasExited) {
    $backendProc | Stop-Process -ErrorAction SilentlyContinue
    Write-Host "Backend stopped." -ForegroundColor DarkGray
}
