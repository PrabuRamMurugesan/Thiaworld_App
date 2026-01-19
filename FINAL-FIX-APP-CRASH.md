# Final Fix for App Crash (Code 1006)

## 🔴 **The Problem:**

Connection closes immediately with code 1006, which means JavaScript crashes during initialization.

## ✅ **Most Likely Causes:**

1. **react-native-reanimated not properly installed**
2. **Missing native module linking**
3. **JavaScript error during component render**

---

## 🔧 **Step-by-Step Fix:**

### **Step 1: Reinstall react-native-reanimated**

```bash
# Stop Metro bundler (Ctrl+C)

# Reinstall the package
npm install react-native-reanimated --save

# Clear all caches
npm start -- --reset-cache
```

### **Step 2: Rebuild Android**

```bash
cd android
./gradlew clean
cd ..
npm run android
```

### **Step 3: If Still Crashing - Temporarily Disable Reanimated**

Edit `babel.config.js`:

```javascript
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Temporarily comment out if causing issues
    // 'react-native-reanimated/plugin',
  ],
};
```

Then restart Metro and rebuild.

---

## 🎯 **Alternative: Use Simple Version First**

If NavigationContainer keeps crashing, use the simple version to test:

```javascript
// App.js - Simple version (WORKS)
import React from "react";
import SignInScreen from "./src/screens/SignInScreen";

export default function App() {
  return <SignInScreen />;
}
```

Once this works, gradually add NavigationContainer back.

---

## 📋 **Check Metro Console**

Look for red error messages in the Metro bundler console. Common errors:
- "Cannot find module..."
- "undefined is not a function"
- "Cannot read property..."

---

## 🔍 **Debug Steps:**

1. **Check Metro console** for JavaScript errors
2. **Run logcat** to see native errors:
   ```powershell
   .\check-logs.ps1
   ```
3. **Test with simple App.js** first
4. **Gradually add features** back

---

## 💡 **Quick Test:**

Try this minimal App.js to see if basic React Native works:

```javascript
import React from "react";
import { View, Text } from "react-native";

export default function App() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Test App</Text>
    </View>
  );
}
```

If this works, the issue is with NavigationContainer or one of the screens.
