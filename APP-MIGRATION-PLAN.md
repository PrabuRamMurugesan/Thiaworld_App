# App.js Migration Plan - Adding All Screens Safely

## ⚠️ **Critical Changes Needed**

### **Problem: Previous App.js Uses Native Navigators**
- ❌ `createNativeStackNavigator` - Requires native screens (can crash)
- ✅ `createDrawerNavigator` - Should work (uses gesture-handler)

### **Solution: Convert to JavaScript-Only Stack Navigator**
- ✅ Change `createNativeStackNavigator` → `createStackNavigator`
- ✅ Keep `createDrawerNavigator` (should work)
- ✅ Add CartProvider and WishlistProvider wrappers
- ✅ Set `initialRouteName="Welcome"` for auth flow

---

## ✅ **Safe Migration Steps**

### **1. Change Stack Navigator**
```javascript
// ❌ OLD (can crash)
import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();

// ✅ NEW (safe)
import { createStackNavigator } from '@react-navigation/stack';
const Stack = createStackNavigator();
```

### **2. Keep Drawer Navigator**
```javascript
// ✅ This should work fine
import { createDrawerNavigator } from '@react-navigation/drawer';
const Drawer = createDrawerNavigator();
```

### **3. Add Context Providers**
```javascript
// ✅ Wrap with providers
<WishlistProvider>
  <CartProvider>
    <NavigationContainer>
      {/* navigators */}
    </NavigationContainer>
  </CartProvider>
</WishlistProvider>
```

### **4. Set Initial Route**
```javascript
// ✅ Set initial route for auth flow
<Stack.Navigator initialRouteName="Welcome">
  <Stack.Screen name="Welcome" component={AuthStack} />
  {/* other screens */}
</Stack.Navigator>
```

---

## 📋 **What Will Work**

✅ All screens can be added safely
✅ Drawer navigator will work (gesture-handler installed)
✅ Stack navigator will work (JavaScript-only)
✅ Context providers will work
✅ Navigation between screens will work

---

## ⚠️ **Potential Issues**

### **1. Drawer Navigator**
- Uses `react-native-gesture-handler` ✅ (installed)
- Uses `react-native-screens` ✅ (installed)
- Should work without reanimated ✅

### **2. Screen Components**
- All screens checked - no reanimated usage ✅
- All screens use standard React Native components ✅

### **3. Navigation**
- Stack navigation will work ✅
- Drawer navigation should work ✅
- Context providers will work ✅

---

## 🎯 **Confirmation**

**YES, you can add all screens safely IF:**
1. ✅ Convert `createNativeStackNavigator` → `createStackNavigator`
2. ✅ Keep `createDrawerNavigator` (should work)
3. ✅ Add context providers
4. ✅ Set initialRouteName

**The app should NOT crash if these changes are made.**
