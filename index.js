/**
 * @format
 */

// CRITICAL: Import gesture handler FIRST before any other imports
import 'react-native-gesture-handler';

// Import get-random-values for crypto operations (required by some libraries)
import 'react-native-get-random-values';

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Log app registration
console.log('🚀 Registering app component:', appName);

// Remove CartProvider wrapper here since App.js already wraps with CartProvider and WishlistProvider
AppRegistry.registerComponent(appName, () => {
  console.log('✅ App component registered successfully');
  return App;
});
