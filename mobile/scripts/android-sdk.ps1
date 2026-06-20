# Shared Android SDK / emulator helpers for BakiBook scripts.

function Initialize-BakiBookTooling {
  if ($env:NODE_OPTIONS -notlike '*--no-deprecation*') {
    $env:NODE_OPTIONS = if ($env:NODE_OPTIONS) { "$env:NODE_OPTIONS --no-deprecation" } else { '--no-deprecation' }
  }
}

function Invoke-NpxQuiet {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$NpxArgs)
  $prev = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  try {
    & npx @NpxArgs
  } finally {
    $ErrorActionPreference = $prev
  }
}

Initialize-BakiBookTooling

function Get-AndroidSdkPath {
  if ($env:ANDROID_HOME -and (Test-Path $env:ANDROID_HOME)) {
    return $env:ANDROID_HOME
  }
  if ($env:ANDROID_SDK_ROOT -and (Test-Path $env:ANDROID_SDK_ROOT)) {
    return $env:ANDROID_SDK_ROOT
  }
  $default = Join-Path $env:LOCALAPPDATA 'Android\Sdk'
  if (Test-Path $default) {
    return $default
  }
  throw 'Android SDK not found. Install Android Studio and set ANDROID_HOME.'
}

function Initialize-AndroidSdkEnv {
  $sdk = Get-AndroidSdkPath
  $env:ANDROID_HOME = $sdk
  $env:ANDROID_SDK_ROOT = $sdk
  if ($env:Path -notlike "*$sdk\platform-tools*") {
    $env:Path = "$sdk\platform-tools;$sdk\emulator;" + $env:Path
  }
  return @{
    Sdk = $sdk
    Adb = Join-Path $sdk 'platform-tools\adb.exe'
    Emulator = Join-Path $sdk 'emulator\emulator.exe'
  }
}

function Test-EmulatorDeviceReady {
  param([string]$Adb)
  $devices = & $Adb devices 2>&1 | Select-String '\tdevice$'
  if (-not $devices) { return $false }
  $booted = & $Adb shell getprop sys.boot_completed 2>$null
  return ($booted -match '1')
}

function Stop-StaleEmulators {
  Get-Process -Name 'qemu-system-x86_64', 'emulator' -ErrorAction SilentlyContinue | ForEach-Object {
    try {
      Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    } catch {}
  }
  Start-Sleep -Seconds 2
}

function Start-BakiBookEmulator {
  param(
    [string]$EmulatorExe,
    [string]$Adb,
    [string]$PreferredAvd = ''
  )

  if (Test-EmulatorDeviceReady -Adb $Adb) {
    Write-Host 'Emulator already running.'
    return
  }

  if (-not (Test-Path $EmulatorExe)) {
    throw "emulator.exe not found at $EmulatorExe"
  }

  $avds = @(& $EmulatorExe -list-avds 2>$null | ForEach-Object { $_.ToString().Trim() } | Where-Object { $_ })
  if (-not $avds.Count) {
    throw 'No AVD found. Create one in Android Studio > Device Manager.'
  }

  $avd = $avds[0]
  if ($PreferredAvd -and ($avds -contains $PreferredAvd)) {
    $avd = $PreferredAvd
  } elseif ($PreferredAvd) {
    Write-Host "AVD '$PreferredAvd' not found. Using '$avd' instead."
  }

  Write-Host "Starting emulator: $avd"
  Stop-StaleEmulators

  $logDir = Join-Path $env:LOCALAPPDATA 'bakibook-emulator-logs'
  New-Item -ItemType Directory -Path $logDir -Force | Out-Null
  $logFile = Join-Path $logDir "emulator-$avd.log"

  # Cold boot + software GPU - most reliable on Windows (fixes exit code 1)
  $emuArgs = @(
    '-avd', $avd,
    '-no-snapshot-load',
    '-gpu', 'swiftshader_indirect',
    '-no-audio',
    '-no-boot-anim'
  )

  Start-Process -FilePath $EmulatorExe -ArgumentList $emuArgs -WindowStyle Normal -RedirectStandardOutput $logFile -RedirectStandardError $logFile

  Write-Host 'Waiting for emulator to boot (up to 4 min)...'
  & $Adb wait-for-device
  $deadline = (Get-Date).AddMinutes(4)
  do {
    Start-Sleep -Seconds 3
    if (Test-EmulatorDeviceReady -Adb $Adb) { break }
  } while ((Get-Date) -lt $deadline)

  if (-not (Test-EmulatorDeviceReady -Adb $Adb)) {
    throw "Emulator failed to boot. See log: $logFile"
  }

  Write-Host 'Emulator ready.'
}

function Install-ApkOnDevice {
  param(
    [string]$Adb,
    [string]$ApkPath,
    [string]$PackageName = 'com.bakibook.app'
  )

  if (-not (Test-Path $ApkPath)) {
    throw "APK not found: $ApkPath"
  }

  Write-Host "Installing $ApkPath ..."
  & $Adb uninstall $PackageName 2>$null | Out-Null
  & $Adb install -r $ApkPath
  if ($LASTEXITCODE -ne 0) {
    throw 'adb install failed'
  }

  Write-Host 'Launching BakiBook...'
  & $Adb shell monkey -p $PackageName -c android.intent.category.LAUNCHER 1 | Out-Null
  Write-Host 'BakiBook is running on the emulator.'
}

function Get-LatestFinishedBuildId {
  param(
    [string]$Profile,
    [string]$MobileRoot
  )

  Push-Location $MobileRoot
  try {
    $prev = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
      $json = & npx --yes eas-cli build:list `
        --platform android `
        --build-profile $Profile `
        --status finished `
        --limit 1 `
        --json `
        --non-interactive 2>&1 | Out-String
    } finally {
      $ErrorActionPreference = $prev
    }

    if (-not $json) { return $null }
    $builds = $json | ConvertFrom-Json
    $latest = if ($builds -is [array]) { $builds[0] } else { $builds }
    return $latest.id
  } finally {
    Pop-Location
  }
}

function Download-EasApk {
  param(
    [string]$BuildId,
    [string]$MobileRoot,
    [string]$OutApk
  )

  $outDir = Split-Path $OutApk -Parent
  New-Item -ItemType Directory -Path $outDir -Force | Out-Null

  Push-Location $MobileRoot
  try {
    Invoke-NpxQuiet --yes eas-cli build:download --build-id $BuildId --platform android -o $OutApk
    if ($LASTEXITCODE -ne 0) {
      throw "eas build:download failed (exit $LASTEXITCODE)"
    }
  } finally {
    Pop-Location
  }

  if (-not (Test-Path $OutApk)) {
    throw "APK download failed: $OutApk"
  }
}
