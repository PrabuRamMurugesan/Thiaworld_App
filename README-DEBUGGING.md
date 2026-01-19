# Debugging Guide - App Crash Issues

## Quick Commands

### View Android Logs
```powershell
# Option 1: Use the helper script
.\check-logs.ps1

# Option 2: Direct command
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" logcat *:E ReactNative:V ReactNativeJS:V

# Option 3: View all logs (more verbose)
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" logcat
```

### Add ADB to PATH (Optional - for easier access)
1. Open System Properties → Environment Variables
2. Edit "Path" under User variables
3. Add: `C:\Users\D\AppData\Local\Android\Sdk\platform-tools`
4. Restart terminal

## Common Issues Fixed

### ✅ Fixed Issues:
1. **Missing gesture-handler import** - Added at top of index.js
2. **Missing get-random-values** - Added for crypto operations
3. **WishlistContext API errors** - Added error handling
4. **CartContext storage errors** - Added try-catch blocks
5. **No error boundary** - Added ErrorBoundary component

### 🔍 What to Check if App Still Crashes:

1. **Check Metro Bundler Console**
   - Look for red error messages
   - Check if bundle loads successfully

2. **Check Android Logs**
   - Run `.\check-logs.ps1` or use adb command above
   - Look for "FATAL EXCEPTION" or "JavaScript error"

3. **Check Device/Emulator**
   - Ensure device is connected: `adb devices`
   - Check if app appears in installed apps

4. **Common Crash Causes:**
   - Native module not linked properly
   - Missing permissions in AndroidManifest.xml
   - JavaScript syntax error
   - Missing dependency

## Rebuild Steps

```bash
# 1. Clean build
cd android
./gradlew clean
cd ..

# 2. Clear Metro cache
npm start -- --reset-cache

# 3. In another terminal, rebuild
npm run android
```

## Error Boundary

The app now has an ErrorBoundary that will:
- Catch JavaScript errors
- Show a "Try Again" button instead of crashing
- Display error details in development mode

If you see the ErrorBoundary screen, check the console for the actual error message.
