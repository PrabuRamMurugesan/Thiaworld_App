# NavigationContainer Crash Fix

## Problem
App crashes with `SIGABRT` when NavigationContainer renders. This is a native crash, not a JavaScript error.

## Root Cause
The crash happens because `react-native-screens` may need explicit initialization in React Native 0.80.2.

## Solution Options

### Option 1: Enable Screens Manually (Try This First)
Add to `MainActivity.kt`:

```kotlin
import com.swmansion.rnscreens.RNScreensPackage

override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    // Enable screens
    com.swmansion.rnscreens.RNScreensPackage.enableScreens()
}
```

### Option 2: Use Stack Navigator Without Native Screens
Temporarily use a JavaScript-only navigator to test if the issue is with native screens.

### Option 3: Check Native Module Linking
Verify that all native modules are properly linked in `android/app/build.gradle`.

## Current Status
- ✅ Minimal App: Works
- ❌ NavigationContainer: Crashes with SIGABRT
- 🔄 Testing: SafeAreaProvider wrapper added

## Next Steps
1. Try enabling screens manually in MainActivity
2. If that doesn't work, try a JavaScript-only navigation approach
3. Check for version compatibility issues
