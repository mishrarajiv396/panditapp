param(
  [switch]$UseExistingMySQL
)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$mysqlBase = "C:\Program Files\MySQL\MySQL Server 8.0"
$mysqld = Join-Path $mysqlBase "bin\mysqld.exe"
$mysql = Join-Path $mysqlBase "bin\mysql.exe"
$dataDir = Join-Path $root ".mysql\data"
$mysqlLog = Join-Path $root ".mysql\mysqld.log"
$mysqlPid = Join-Path $root ".mysql\mysqld.pid"
$envFile = Join-Path $root ".env"

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

function New-JwtSecret {
  $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  return -join (1..64 | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
}

function Write-EnvFile([string]$hostName, [int]$port, [string]$user, [string]$password, [string]$database) {
  $envText = @"
PORT=4000
NODE_ENV=development

DB_HOST=$hostName
DB_PORT=$port
DB_USER=$user
DB_PASSWORD=$password
DB_NAME=$database

CORS_ORIGIN=http://127.0.0.1:8123,http://localhost:8123,http://localhost:4000,http://127.0.0.1:4000

JWT_SECRET=$(New-JwtSecret)
JWT_EXPIRES_IN=12h

ADMIN_EMAIL=admin@panditapp.local
ADMIN_PASSWORD=Admin@2026
ADMIN_NAME=Site Admin
"@
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($envFile, $envText, $utf8NoBom)
  Write-Ok "Wrote server/.env"
}

Write-Host ""
Write-Host "  PanditApp - database setup" -ForegroundColor Magenta
Write-Host "  ==========================" -ForegroundColor DarkGray
Write-Host ""

if ($UseExistingMySQL) {
  $hostName = Read-Host "MySQL host [127.0.0.1]"
  if (-not $hostName) { $hostName = "127.0.0.1" }
  $portText = Read-Host "MySQL port [3306]"
  if (-not $portText) { $portText = "3306" }
  $user = Read-Host "MySQL user [root]"
  if (-not $user) { $user = "root" }
  $database = Read-Host "Database name [panditapp]"
  if (-not $database) { $database = "panditapp" }

  $secure = Read-Host "MySQL password for '$user'" -AsSecureString
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try { $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr) }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }

  Write-EnvFile $hostName ([int]$portText) $user $plain $database
} else {
  if (-not (Test-Path $mysqld)) {
    throw "MySQL 8 not found at $mysqld. Install MySQL 8, or run with -UseExistingMySQL."
  }

  New-Item -ItemType Directory -Force -Path (Join-Path $root ".mysql") | Out-Null

  if (-not (Test-Path (Join-Path $dataDir "mysql"))) {
    Write-Step "Creating a project-local MySQL data folder (first run, ~20 seconds)..."
    New-Item -ItemType Directory -Force -Path $dataDir | Out-Null
    & $mysqld --initialize-insecure --basedir="$mysqlBase" --datadir="$dataDir" --console 2>&1 | Out-Null
    if (-not (Test-Path (Join-Path $dataDir "mysql"))) {
      throw "MySQL initialization failed. Check that the data folder is empty and writable."
    }
  }

  if (-not (Test-Port 3307)) {
    Write-Step "Starting MySQL on port 3307..."
    $mysqlArgs = @(
      "--basedir=`"$mysqlBase`"",
      "--datadir=`"$dataDir`"",
      "--port=3307",
      "--bind-address=127.0.0.1",
      "--mysqlx=0",
      "--skip-log-bin",
      "--pid-file=`"$mysqlPid`"",
      "--log-error=`"$mysqlLog`""
    )
    Start-Process -FilePath $mysqld -ArgumentList $mysqlArgs -WindowStyle Hidden
    for ($i = 0; $i -lt 40; $i++) {
      if (Test-Port 3307) { break }
      Start-Sleep -Seconds 1
    }
    if (-not (Test-Port 3307)) { throw "MySQL did not start. Check $mysqlLog" }
  }
  Write-Ok "MySQL ready on port 3307"

  Write-Step "Creating database and app user..."
  $sql = @"
CREATE DATABASE IF NOT EXISTS panditapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'panditapp'@'127.0.0.1' IDENTIFIED BY 'PanditApp@2026';
ALTER USER 'panditapp'@'127.0.0.1' IDENTIFIED BY 'PanditApp@2026';
CREATE USER IF NOT EXISTS 'panditapp'@'localhost' IDENTIFIED BY 'PanditApp@2026';
ALTER USER 'panditapp'@'localhost' IDENTIFIED BY 'PanditApp@2026';
GRANT ALL PRIVILEGES ON panditapp.* TO 'panditapp'@'127.0.0.1';
GRANT ALL PRIVILEGES ON panditapp.* TO 'panditapp'@'localhost';
FLUSH PRIVILEGES;
"@
  $sql | & $mysql -h 127.0.0.1 -P 3307 -u root
  if ($LASTEXITCODE -ne 0) { throw "Could not create the database. Is the local MySQL instance healthy?" }

  Write-EnvFile "127.0.0.1" 3307 "panditapp" "PanditApp@2026" "panditapp"
}

Set-Location $root
if (-not (Test-Path "node_modules")) {
  Write-Step "Installing dependencies..."
  npm install --no-audit --no-fund
}

Write-Step "Applying the database schema..."
npm run migrate
if ($LASTEXITCODE -ne 0) { throw "Migration failed. Check server/.env." }

Write-Step "Seeding catalogue data..."
npm run seed
if ($LASTEXITCODE -ne 0) { throw "Seeding failed." }

Write-Host ""
Write-Ok "Setup complete."
Write-Host "  Start the app:  cd C:\PanditApp ; .\start.ps1" -ForegroundColor White
Write-Host "  Website:        http://localhost:4000/index.html" -ForegroundColor White
Write-Host "  Admin:          http://localhost:4000/admin.html" -ForegroundColor White
Write-Host "  Admin login:    admin@panditapp.local / Admin@2026" -ForegroundColor DarkYellow
Write-Host ""
