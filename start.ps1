Write-Host ""
Write-Host "Resume Skill Extractor - Setup"
Write-Host "--------------------------------"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

if (-not (Test-Path ".env")) {
  Copy-Item ".env.example" ".env" | Out-Null
  Write-Host ""
  Write-Host "WARNING: No .env file found. Created one from .env.example"
  Write-Host "Please open .env and set your GROQ_API_KEY, then re-run this script."
  Write-Host ""
  Write-Host "Get your free key at: https://console.groq.com"
  Write-Host ""
  exit 1
}

if (-not $env:GROQ_API_KEY) {
  $envContent = Get-Content ".env" -ErrorAction SilentlyContinue
  foreach ($line in $envContent) {
    if ($line -match "^\s*GROQ_API_KEY\s*=\s*(.+)\s*$") {
      $key = $Matches[1].Trim().Trim('"')
      if ($key) {
        $env:GROQ_API_KEY = $key
      }
      break
    }
  }
}

if (-not $env:GROQ_API_KEY -or $env:GROQ_API_KEY -match "your_groq_api_key_here") {
  Write-Host ""
  Write-Host "WARNING: GROQ_API_KEY is not set."
  Write-Host "Open .env and set GROQ_API_KEY, then re-run this script."
  Write-Host ""
  exit 1
}

$envName = "resume-skill-extractor"

if (-not (Get-Command conda -ErrorAction SilentlyContinue)) {
  Write-Host ""
  Write-Host "ERROR: conda is not available in this shell."
  Write-Host "Open an Anaconda/Miniconda prompt or ensure conda is on PATH."
  Write-Host ""
  exit 1
}

$envExists = conda env list | Select-String -Pattern "^\s*$envName\s"
if (-not $envExists) {
  Write-Host ""
  Write-Host "ERROR: Conda env '$envName' not found."
  Write-Host "Create it with: conda create -n $envName python=3.11 -y"
  Write-Host ""
  exit 1
}

$backendDir = Join-Path $scriptDir "backend"
$frontendDir = Join-Path $scriptDir "frontend"

Write-Host "Starting backend in a new window..."
Start-Process -FilePath "conda" -WorkingDirectory $backendDir -ArgumentList @(
  "run", "-n", $envName, "uvicorn", "app.main:app", "--reload", "--port", "8000"
)

Push-Location $frontendDir
if (-not (Test-Path "node_modules")) {
  Write-Host "Installing frontend dependencies..."
  npm install
}
Write-Host "Starting frontend..."
npm run dev
Pop-Location
