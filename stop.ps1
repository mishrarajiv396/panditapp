$ErrorActionPreference = "SilentlyContinue"
$root = $PSScriptRoot
$server = Join-Path $root "server"
$envFile = Join-Path $server ".env"
$mysqlPid = Join-Path $server ".mysql\mysqld.pid"
$apiPid = Join-Path $server ".mysql\api.pid"

Write-Host ""
Write-Host "  Stopping Satyanarayan Puja app..." -ForegroundColor Magenta

function Stop-FromPidFile([string]$file, [string]$name) {
  if (-not (Test-Path $file)) { return $false }
  $value = Get-Content $file -ErrorAction SilentlyContinue | Select-Object -First 1
  if (-not ($value -match "^\d+$")) { return $false }
  $proc = Get-Process -Id ([int]$value) -ErrorAction SilentlyContinue
  if (-not $proc) { return $false }
  Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
  Write-Host "  $name stopped." -ForegroundColor Green
  return $true
}

# ------------------------------------------------------------------ API
$stoppedApi = Stop-FromPidFile $apiPid "API"
if (-not $stoppedApi) {
  $api = Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($api -and $api.OwningProcess) {
    Stop-Process -Id $api.OwningProcess -Force -ErrorAction SilentlyContinue
    Write-Host "  API stopped." -ForegroundColor Green
    $stoppedApi = $true
  }
}
if (-not $stoppedApi) {
  # Fallback for an API started outside start.ps1.
  $nodes = Get-CimInstance Win32_Process -Filter "Name='node.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -like "*src/server.js*" }
  foreach ($node in $nodes) {
    Stop-Process -Id $node.ProcessId -Force -ErrorAction SilentlyContinue
    $stoppedApi = $true
  }
  if ($stoppedApi) { Write-Host "  API stopped." -ForegroundColor Green }
}
if (-not $stoppedApi) { Write-Host "  API was not running." -ForegroundColor DarkGray }

# ---------------------------------------------------------------- MySQL
$stoppedDb = Stop-FromPidFile $mysqlPid "MySQL"
if (-not $stoppedDb) {
  $dbPort = 3307
  if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
      if ($_ -match "^\s*DB_PORT\s*=\s*(\d+)") { $dbPort = [int]$Matches[1] }
    }
  }
  $mysql = Get-NetTCPConnection -LocalPort $dbPort -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($mysql -and $mysql.OwningProcess) {
    Stop-Process -Id $mysql.OwningProcess -Force -ErrorAction SilentlyContinue
    Write-Host "  MySQL stopped." -ForegroundColor Green
    $stoppedDb = $true
  }
}
if (-not $stoppedDb) { Write-Host "  MySQL was not running." -ForegroundColor DarkGray }

Remove-Item $apiPid, $mysqlPid -Force -ErrorAction SilentlyContinue
Write-Host ""
