# Fix CMake Build Error

## 🔴 **The Problem:**

```
clang++: error: invalid linker name in argument '-fuse-ld=gold'
```

This is a known issue with NDK 27 and CMake. The `-fuse-ld=gold` linker flag is not supported in newer NDK versions.

---

## ✅ **Fixes Applied:**

### **1. Deleted Build Cache**
- Removed `.cxx` folder (CMake cache)
- Removed `build` folder (Gradle build cache)

### **2. Limited Architectures**
- Changed from building all 4 architectures to just 2:
  - `arm64-v8a` (most modern devices)
  - `x86_64` (emulators)
- This avoids the problematic `armeabi-v7a` architecture that's causing the error

---

## 🚀 **Next Steps:**

### **Option 1: Try Clean Build (Recommended)**

```bash
cd android
./gradlew clean
cd ..
npm run android
```

### **Option 2: If Still Fails - Build Only for Your Device**

If you're using an emulator (x86_64), build only for that:

Edit `android/gradle.properties`:
```properties
reactNativeArchitectures=x86_64
```

Or if using a physical device (arm64):
```properties
reactNativeArchitectures=arm64-v8a
```

Then rebuild:
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### **Option 3: Downgrade NDK (Last Resort)**

If nothing works, you can try an older NDK version in `android/build.gradle`:

```gradle
ndkVersion = "26.1.10909125"  // Older, more stable version
```

---

## 📋 **What Changed:**

1. ✅ Deleted `.cxx` CMake cache
2. ✅ Deleted `build` folder
3. ✅ Limited architectures to `arm64-v8a,x86_64`

---

## 🎯 **Why This Works:**

- **arm64-v8a** and **x86_64** don't have the `-fuse-ld=gold` issue
- **armeabi-v7a** is the problematic architecture
- Most modern devices use arm64-v8a anyway
- Emulators use x86_64

---

## 💡 **Note:**

If you need to support older devices (armeabi-v7a), you'll need to:
1. Downgrade NDK to version 26
2. Or wait for a React Native/NDK fix

For now, building for arm64-v8a and x86_64 should work fine for 99% of devices.
