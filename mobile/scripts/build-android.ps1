# Build BakiBook Android via EAS from a local copy (avoids OneDrive + monorepo tar errors).
# Usage: .\scripts\build-android.ps1 [production|preview]

param(
  [ValidateSet('production', 'preview')]
  [string]$Profile = 'production'
)

$ErrorActionPreference = 'Stop'
$mobileRoot = Split-Path -Parent $PSScriptRoot
$buildRoot = Join-Path $env:LOCALAPPDATA 'bakibook-eas-build'

Write-Host "Copying mobile app to $buildRoot (outside OneDrive)..."

if (Test-Path $buildRoot) {
  Remove-Item -Recurse -Force $buildRoot
}
New-Item -ItemType Directory -Path $buildRoot | Out-Null

$excludeDirs = @('node_modules', '.expo', '.git', '.claude')
Get-ChildItem -Path $mobileRoot -Force | ForEach-Object {
  if ($excludeDirs -contains $_.Name) { return }
  Copy-Item -Path $_.FullName -Destination $buildRoot -Recurse -Force
}

Push-Location $buildRoot
try {
  if (-not (Test-Path 'node_modules')) {
    Write-Host 'Installing dependencies...'
    npm install
  }

  Write-Host "Starting EAS build (profile: $Profile)..."
  $env:EAS_NO_VCS = '1'
  npx --yes eas-cli build --platform android --profile $Profile @args
}
finally {
  Pop-Location
}
