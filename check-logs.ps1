# React Native Log Checker Script
# This script helps you view Android logs for debugging

$adbPath = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"

if (Test-Path $adbPath) {
    Write-Host "Clearing old logs..." -ForegroundColor Yellow
    & $adbPath logcat -c
    
    Write-Host "`nStarting logcat (Press Ctrl+C to stop)..." -ForegroundColor Green
    Write-Host "Filtering for: Errors, ReactNative, ReactNativeJS`n" -ForegroundColor Cyan
    
    & $adbPath logcat *:E ReactNative:V ReactNativeJS:V
} else {
    Write-Host "ADB not found at: $adbPath" -ForegroundColor Red
    Write-Host "Please install Android SDK or update the path in this script." -ForegroundColor Yellow
}
