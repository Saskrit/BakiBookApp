# Gradle 9 + React Native: bump foojay-resolver-convention (0.5.0 breaks with IBM_SEMERU removed).
$ErrorActionPreference = 'SilentlyContinue'
$file = Join-Path $PSScriptRoot '..\node_modules\@react-native\gradle-plugin\settings.gradle.kts'
if (-not (Test-Path $file)) { exit 0 }
$content = Get-Content $file -Raw
if ($content -match 'foojay-resolver-convention"\)\.version\("0\.5\.0"\)') {
  $content = $content -replace 'foojay-resolver-convention"\)\.version\("0\.5\.0"\)', 'foojay-resolver-convention").version("1.0.0")'
  Set-Content -Path $file -Value $content -NoNewline
}
