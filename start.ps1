param(
  [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$server = Join-Path $root "server"
$envFile = Join-Path $server ".env"
$mysqlBase = "C:\Program Files\MySQL\MySQL Server 8.0"
$mysqld = Join-Path $mysqlBase "bin\mysqld.exe"
$dataDir = Join-Path $server ".mysql\data"
$mysqlLog = Join-Path $server ".mysql\mysqld.log"
$mysqlPid = Join-Path $server ".mysql\mysqld.pid"
$apiPid = Join-Path $server ".mysql\api.pid"
$apiOut = Join-Path $server ".mysql\api.out.log"
$apiErr = Join-Path $server ".mysql\api.err.log"

function Write-Step($text) { Write-Host "  $text" -ForegroundColor Cyan }
function Write-Ok($text) { Write-Host "  $text" -ForegroundColor Green }

function Test-Port([int]$port) {
  $client = New-Object System.Net.Sockets.TcpClient
  try {
    $iar = $client.BeginConnect("127.0.0.1", $port, $null, $null)
    if (-not $iar.AsyncWaitHandle.WaitOne(900)) { return $false }
    $client.EndConnect($iar)
    return $true
  } catch {
    return $false
  } finally {
    $client.Close()
  }
}

function Test-Api {
  try {
    $res = Invoke-RestMethod -Uri "http://127.0.0.1:4000/api/health" -TimeoutSec 3
    return [bool]$res.ok
  } catch {
    return $false
  }
}

function Wait-For([scriptblock]$check, [int]$seconds) {
  for ($i = 0; $i -lt $seconds; $i++) {
    if (& $check) { return $true }
    Start-Sleep -Seconds 1
  }
  return $false
}

Write-Host ""
Write-Host "  Satyanarayan Puja - local app" -ForegroundColor Magenta
Write-Host "  ==============================" -ForegroundColor DarkGray
Write-Host ""

if (-not (Test-Path $envFile)) {
  Write-Host "  server/.env not found." -ForegroundColor Red
  Write-Host "  Run this first:  cd server ; powershell -ExecutionPolicy Bypass -File .\setup.ps1" -ForegroundColor Yellow
  exit 1
}

$dbPort = 3307
Get-Content $envFile | ForEach-Object {
  if ($_ -match "^\s*DB_PORT\s*=\s*(\d+)") { $dbPort = [int]$Matches[1] }
}

# ---------------------------------------------------------------- MySQL
if (Test-Port $dbPort) {
  Write-Ok "MySQL already running on port $dbPort"
} else {
  if (-not (Test-Path $mysqld)) {
    Write-Host "  MySQL 8 not found at $mysqld" -ForegroundColor Red
    exit 1
  }
  if (-not (Test-Path $dataDir)) {
    Write-Host "  MySQL data folder missing. Run server\setup.ps1 first." -ForegroundColor Red
    exit 1
  }

  Write-Step "Starting MySQL on port $dbPort..."
  $mysqlArgs = @(
    "--basedir=`"$mysqlBase`"",
    "--datadir=`"$dataDir`"",
    "--port=$dbPort",
    "--bind-address=127.0.0.1",
    "--mysqlx=0",
    "--skip-log-bin",
    "--pid-file=`"$mysqlPid`"",
    "--log-error=`"$mysqlLog`""
  )
  Start-Process -FilePath $mysqld -ArgumentList $mysqlArgs -WindowStyle Hidden

  if (-not (Wait-For { Test-Port $dbPort } 40)) {
    Write-Host "  MySQL did not start. Check $mysqlLog" -ForegroundColor Red
    exit 1
  }
  Write-Ok "MySQL ready on port $dbPort"
}

# ------------------------------------------------------------------ API
if (Test-Api) {
  Write-Ok "API already running on http://localhost:4000"
} elseif (Test-Port 4000) {
  Write-Host "  Port 4000 is used by another program. Close it or change PORT in server/.env." -ForegroundColor Red
  exit 1
} else {
  Write-Step "Starting the website + API on port 4000..."
  New-Item -ItemType Directory -Force -Path (Join-Path $server ".mysql") | Out-Null
  $proc = Start-Process -FilePath "node" -ArgumentList "src/server.js" -WorkingDirectory $server `
    -WindowStyle Hidden -PassThru -RedirectStandardOutput $apiOut -RedirectStandardError $apiErr
  Set-Content -Path $apiPid -Value $proc.Id

  if (-not (Wait-For { Test-Api } 25)) {
    Write-Host "  API did not start. Check $apiErr" -ForegroundColor Red
    exit 1
  }
  Write-Ok "API ready on http://localhost:4000"
}

Write-Host ""
Write-Host "  Website : http://localhost:4000/index.html" -ForegroundColor White
Write-Host "  Admin   : http://localhost:4000/admin.html" -ForegroundColor White
Write-Host "  Health  : http://localhost:4000/api/health" -ForegroundColor White
Write-Host ""
Write-Host "  Admin login: admin@panditapp.local / Admin@2026" -ForegroundColor DarkYellow
Write-Host "  Stop with  : .\stop.ps1   (or double-click stop.bat)" -ForegroundColor DarkGray
Write-Host ""

if (-not $NoBrowser) {
  Start-Process "http://localhost:4000/index.html"
}
