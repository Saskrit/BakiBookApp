# Build a release APK locally (installable BakiBook.apk, no EAS).
# Usage: .\scripts\build-apk-local.ps1
# Output: android\app\build\outputs\apk\release\BakiBook.apk

$ErrorActionPreference = 'Stop'
$mobileRoot = (Resolve-Path (Split-Path -Parent $PSScriptRoot)).Path
$runScript = Join-Path $PSScriptRoot 'run-android.ps1'

function Resolve-JdkHome {
  param([string[]]$Candidates)
  foreach ($candidate in $Candidates) {
    if (-not $candidate) { continue }
    $javaExe = Join-Path $candidate 'bin\java.exe'
    if (Test-Path $javaExe) { return $candidate }
  }
  return $null
}

$jdk = Resolve-JdkHome @(
  $env:JAVA_HOME
  'C:\Program Files\Android\Android Studio\jbr'
  "${env:ProgramFiles(x86)}\Android\Android Studio\jbr"
  (Join-Path $env:LOCALAPPDATA 'Programs\Android Studio\jbr')
)

if (-not $jdk) {
  Write-Error 'JDK not found. Install Android Studio or set JAVA_HOME.'
}

$sdk = if ($env:ANDROID_HOME -and (Test-Path $env:ANDROID_HOME)) {
  $env:ANDROID_HOME
} else {
  Join-Path $env:LOCALAPPDATA 'Android\Sdk'
}

$env:JAVA_HOME = $jdk
$env:ANDROID_HOME = $sdk
$env:ANDROID_SDK_ROOT = $sdk
$env:GRADLE_USER_HOME = 'C:\bk-gradle'
if (-not (Test-Path $env:GRADLE_USER_HOME)) {
  New-Item -ItemType Directory -Path $env:GRADLE_USER_HOME -Force | Out-Null
}

Push-Location $mobileRoot
try {
  if (-not (Test-Path 'android')) {
    Write-Host 'Generating android/ (expo prebuild)...'
    npx expo prebuild --platform android --clean
    node ./scripts/patch-gradle.js
  }

  Write-Host 'Building release APK (assembleRelease)...'
  Push-Location android
  try {
    if ($IsWindows -or $env:OS -eq 'Windows_NT') {
      .\gradlew.bat assembleRelease --no-daemon
    } else {
      ./gradlew assembleRelease --no-daemon
    }
  } finally {
    Pop-Location
  }

  $apk = Join-Path $mobileRoot 'android\app\build\outputs\apk\release\BakiBook.apk'
  if (-not (Test-Path $apk)) {
    $fallback = Get-ChildItem -Path (Join-Path $mobileRoot 'android\app\build\outputs\apk\release') -Filter '*.apk' -ErrorAction SilentlyContinue |
      Select-Object -First 1
    if ($fallback) { $apk = $fallback.FullName }
  }

  if (Test-Path $apk) {
    Write-Host ''
    Write-Host "APK ready: $apk" -ForegroundColor Green
    Write-Host 'Copy to your phone and install, or: adb install -r "' + $apk + '"'
  } else {
    Write-Error 'APK not found under android\app\build\outputs\apk\release\'
  }
} finally {
  Pop-Location
}
