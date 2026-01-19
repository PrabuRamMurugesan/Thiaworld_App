# Get App Running - Step by Step Guide

## 🎯 **Goal: Get the app running first, then add features**

---

## ✅ **Step 1: Disable react-native-reanimated (Temporary)**

I've already updated `babel.config.js` to disable the reanimated plugin.

**What changed:**
- Commented out `'react-native-reanimated/plugin'` in babel.config.js
- This prevents the "Cannot find module" error

---

## ✅ **Step 2: Use Simple App.js First**

**Current App.js should work, but if it still crashes, use this minimal version:**

```javascript
import React from "react";
import SignInScreen from "./src/screens/SignInScreen";

export default function App() {
  return <SignInScreen />;
}
```

**Test this first** - if this works, the issue is with NavigationContainer.

---

## ✅ **Step 3: Clear Everything**

```bash
# Stop Metro (Ctrl+C)

# Clear Metro cache
npm start -- --reset-cache

# Clean Android build
cd android
./gradlew clean
cd ..

# Rebuild
npm run android
```

---

## 🔄 **Step 4: Gradually Add Features**

### **Phase 1: Basic Navigation (After simple version works)**

```javascript
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SignInScreen from "./src/screens/SignInScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SignIn" component={SignInScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### **Phase 2: Add More Screens (After Phase 1 works)**

```javascript
import IntroScreen from "./src/screens/IntroScreen";
import SignUpScreen from "./src/screens/SignUp";

// Add to Stack.Navigator:
<Stack.Screen name="Intro" component={IntroScreen} />
<Stack.Screen name="SignUp" component={SignUpScreen} />
```

### **Phase 3: Re-enable Reanimated (After navigation works)**

1. Uncomment in `babel.config.js`:
   ```javascript
   plugins: ['react-native-reanimated/plugin'],
   ```

2. Rebuild:
   ```bash
   npm start -- --reset-cache
   npm run android
   ```

---

## 📋 **Packages You Can Temporarily Remove (if needed):**

If the app still crashes, you can temporarily remove these:

```bash
# Remove reanimated (if babel config change doesn't work)
npm uninstall react-native-reanimated

# Remove razorpay (not needed for basic auth)
npm uninstall react-native-razorpay

# Remove worklets (related to reanimated)
npm uninstall react-native-worklets
```

**To reinstall later:**
```bash
npm install react-native-reanimated react-native-razorpay react-native-worklets --save
```

---

## 🎯 **Recommended Testing Order:**

1. ✅ **Minimal App.js** (just SignInScreen) - Should work 100%
2. ✅ **Add NavigationContainer** - Test if navigation works
3. ✅ **Add IntroScreen** - Test navigation between screens
4. ✅ **Add SignUpScreen** - Test full auth flow
5. ✅ **Re-enable reanimated** - Add animations back
6. ✅ **Add other screens** - Gradually add features

---

## 🚨 **If Still Crashing:**

1. **Check Metro Console** - Look for red error messages
2. **Check Android Logs** - Run `.\check-logs.ps1`
3. **Try Minimal Test:**
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

If even this crashes, the issue is with React Native setup, not your code.

---

## ✅ **Current Status:**

- ✅ `babel.config.js` - Reanimated plugin disabled
- ✅ `App.js` - Has ErrorBoundary and NavigationContainer
- ✅ All screens registered correctly

**Next:** Clear cache and rebuild. The app should work now!
