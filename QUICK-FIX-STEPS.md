# Quick Fix Steps for NavigationContainer Crash

## 🔴 **Current Situation:**

- ✅ **Simple version works:** `return <SignInScreen />;`
- ❌ **NavigationContainer version crashes:** Missing `react-native-reanimated/plugin`

---

## ✅ **Solution: Reinstall react-native-reanimated**

The package is in your `package.json` but might not be properly installed in `node_modules`.

### **Step 1: Stop Metro Bundler**
Press `Ctrl+C` in the terminal where Metro is running.

### **Step 2: Reinstall the Package**
```bash
npm install react-native-reanimated --save
```

### **Step 3: Clear Metro Cache**
```bash
npm start -- --reset-cache
```

### **Step 4: Rebuild (in new terminal)**
```bash
npm run android
```

---

## 🔄 **Alternative: If Reinstall Doesn't Work**

### **Full Clean Reinstall:**
```bash
# Delete node_modules
Remove-Item -Recurse -Force node_modules

# Delete package-lock.json (optional)
Remove-Item package-lock.json

# Reinstall everything
npm install

# Clear Metro cache
npm start -- --reset-cache
```

---

## 📝 **Why This Happens:**

1. **NavigationContainer** requires `react-native-reanimated` for animations
2. The **Babel plugin** must be loaded to transform reanimated code
3. If `node_modules` is incomplete, the plugin file is missing
4. **Simple version** doesn't need reanimated, so it works

---

## 🎯 **After Fixing:**

Once `react-native-reanimated` is properly installed, your NavigationContainer version will work:

```javascript
<NavigationContainer>
  <Stack.Navigator>
    <Stack.Screen name="SignIn" component={SignInScreen} />
  </Stack.Navigator>
</NavigationContainer>
```

---

## 💡 **Temporary Workaround:**

If you want to test without fixing reanimated right now, you can temporarily comment out the plugin in `babel.config.js`:

```javascript
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // 'react-native-reanimated/plugin', // Temporarily disabled
  ],
};
```

But this will break animations in NavigationContainer, so only use for testing.
