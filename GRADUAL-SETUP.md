# Gradual Setup Guide - Add Features Step by Step

## ✅ **Current Status:**
- ✅ Minimal App.js works (just SignInScreen)
- ✅ React Native setup is correct
- ✅ SignInScreen is working

---

## 🎯 **Next Steps: Add Features Gradually**

### **Phase 1: Add NavigationContainer (Test This First)**

Replace your `App.js` with this:

```javascript
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ErrorBoundary from "./src/components/ErrorBoundary";

import SignInScreen from "./src/screens/SignInScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ErrorBoundary>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="SignIn"
          screenOptions={{ headerShown: false }}>
          <Stack.Screen name="SignIn" component={SignInScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ErrorBoundary>
  );
}
```

**Test:** If this works, NavigationContainer is fine. If it crashes, the issue is with NavigationContainer setup.

---

### **Phase 2: Add IntroScreen (After Phase 1 works)**

```javascript
import IntroScreen from "./src/screens/IntroScreen";

// Add to Stack.Navigator:
<Stack.Navigator 
  initialRouteName="Intro"  // Start with Intro
  screenOptions={{ headerShown: false }}>
  <Stack.Screen name="Intro" component={IntroScreen} />
  <Stack.Screen name="SignIn" component={SignInScreen} />
</Stack.Navigator>
```

**Test:** If this crashes, the issue is with IntroScreen.

---

### **Phase 3: Add SignUpScreen (After Phase 2 works)**

```javascript
import SignUpScreen from "./src/screens/SignUp";

// Add to Stack.Navigator:
<Stack.Screen name="SignUp" component={SignUpScreen} />
```

**Test:** If this crashes, the issue is with SignUpScreen.

---

### **Phase 4: Re-enable Reanimated (After all screens work)**

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

## 🔍 **If Phase 1 (NavigationContainer) Crashes:**

The issue might be with gesture-handler. Check `index.js`:

```javascript
// Make sure this is at the very top:
import 'react-native-gesture-handler';
```

---

## 🔍 **If Phase 2 (IntroScreen) Crashes:**

Check IntroScreen.js:
- Make sure image uses `require()` not `import`
- Check if navigation.navigate() is called correctly

---

## 🔍 **If Phase 3 (SignUpScreen) Crashes:**

Check SignUp.js:
- Make sure image uses `require()` not `import`
- Check for any syntax errors

---

## 📋 **Testing Checklist:**

- [ ] Phase 1: NavigationContainer with SignInScreen
- [ ] Phase 2: Add IntroScreen
- [ ] Phase 3: Add SignUpScreen
- [ ] Phase 4: Re-enable reanimated plugin
- [ ] Phase 5: Add other screens gradually

---

## 💡 **Pro Tip:**

Test each phase before moving to the next. This helps identify exactly which component causes the crash.
