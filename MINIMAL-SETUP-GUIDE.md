# Minimal Setup Guide - Get App Running First

## 🎯 **Strategy: Start Minimal, Add Features Gradually**

To get the app running, we'll temporarily disable problematic packages, then add them back one by one.

---

## ✅ **Step 1: Disable react-native-reanimated (Temporary)**

### **Option A: Comment Out Babel Plugin (Easiest)**

Edit `babel.config.js`:

```javascript
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Temporarily disabled to get app running
    // 'react-native-reanimated/plugin',
  ],
};
```

### **Option B: Remove Package (If Option A doesn't work)**

```bash
npm uninstall react-native-reanimated
```

**Note:** You can reinstall later with `npm install react-native-reanimated --save`

---

## ✅ **Step 2: Use Minimal App.js**

Replace `App.js` with this minimal version:

```javascript
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ErrorBoundary from "./src/components/ErrorBoundary";

import IntroScreen from "./src/screens/IntroScreen";
import SignInScreen from "./src/screens/SignInScreen";
import SignUpScreen from "./src/screens/SignUp";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ErrorBoundary>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Intro"
          screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Intro" component={IntroScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ErrorBoundary>
  );
}
```

---

## ✅ **Step 3: Clear Everything and Rebuild**

```bash
# 1. Stop Metro bundler (Ctrl+C)

# 2. Clear Metro cache
npm start -- --reset-cache

# 3. In another terminal, clean Android build
cd android
./gradlew clean
cd ..

# 4. Rebuild
npm run android
```

---

## 🔄 **Step 4: Once App Runs, Re-enable Features Gradually**

### **Re-enable Reanimated (if needed):**

1. Uncomment in `babel.config.js`:
   ```javascript
   plugins: ['react-native-reanimated/plugin'],
   ```

2. Reinstall if removed:
   ```bash
   npm install react-native-reanimated --save
   ```

3. Rebuild:
   ```bash
   npm start -- --reset-cache
   npm run android
   ```

---

## 📋 **Packages That Can Cause Issues (Disable if Needed):**

1. **react-native-reanimated** - Most common crash cause
2. **react-native-razorpay** - Payment gateway (not needed for basic auth)
3. **react-native-worklets** - Related to reanimated

---

## 🎯 **Minimal Working Setup:**

**babel.config.js:**
```javascript
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [], // Empty for now
};
```

**App.js:**
```javascript
import React from "react";
import SignInScreen from "./src/screens/SignInScreen";

export default function App() {
  return <SignInScreen />;
}
```

This should work 100% - no navigation, no reanimated, just the screen.

---

## ✅ **Testing Order:**

1. ✅ Test with minimal App.js (just SignInScreen)
2. ✅ Add NavigationContainer
3. ✅ Add IntroScreen
4. ✅ Add SignUpScreen
5. ✅ Re-enable reanimated plugin
6. ✅ Add other screens gradually

---

## 🚨 **If Still Crashing:**

Check Metro console for the exact error message. Common issues:
- Missing imports
- Syntax errors
- Component initialization errors
