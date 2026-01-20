module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // ✅ Reanimated plugin removed - package causing build issues
    // If you need reanimated later, install it and uncomment:
    // 'react-native-reanimated/plugin',
  ],
};
