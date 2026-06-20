# Download latest EAS APK and install + launch on emulator automatically.
# Usage: .\scripts\install-eas-apk.ps1 [preview|apk]

param(
  [ValidateSet('preview', 'apk')]
  [string]$Profile = 'preview',
  [string]$BuildId = '',
  [string]$AvdName = 'Medium_Phone'
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'android-sdk.ps1')

$mobileRoot = (Resolve-Path (Split-Path -Parent $PSScriptRoot)).Path
$outApk = Join-Path $mobileRoot 'dist\BakiBook.apk'

if (-not $BuildId) {
  $BuildId = Get-LatestFinishedBuildId -Profile $Profile -MobileRoot $mobileRoot
}
if (-not $BuildId) {
  throw "No finished '$Profile' build found. Run: npm run build:android:preview"
}

Download-EasApk -BuildId $BuildId -MobileRoot $mobileRoot -OutApk $outApk
$tools = Initialize-AndroidSdkEnv
Start-BakiBookEmulator -EmulatorExe $tools.Emulator -Adb $tools.Adb -PreferredAvd $AvdName
Install-ApkOnDevice -Adb $tools.Adb -ApkPath $outApk
