import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Image,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

// ✅ FIX 1: Use require() instead of import for images (React Native requirement)
const THIAWORLDLOGO = require('../assets/thiaworldlogo.png');

const LOGIN_API_URL = 'https://thiaworld.bbscart.com/api/auth/login';

const SignInScreen = ({ navigation: propNavigation }) => {
  // ✅ Use navigation prop if provided, otherwise use hook
  const hookNavigation = useNavigation();
  const navigation = propNavigation || hookNavigation;

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSendOtp = () => {
    if (!phone || phone.length !== 10) {
      Alert.alert('Invalid Phone', 'Enter a valid 10-digit phone number.');
      return;
    }

    setOtpSent(true);
    Alert.alert('OTP Sent', 'An OTP has been sent to your registered number.');
  };

  const handleSignIn = async () => {
    if ((!email && !phone) || !password) {
      Alert.alert('Error', 'Please enter required fields.');
      return;
    }

    const payload = {
      password,
      createdFrom: 'thiaworld',
    };

    if (email) payload.email = email;
    if (phone) payload.phone = phone;

    try {
      setLoading(true);

      const response = await fetch(LOGIN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (!data.token) {
        throw new Error('Token not received from server');
      }

      // ✅ Save token & user for auto-login
      await AsyncStorage.setItem('THIAWORLD_TOKEN', data.token);
      await AsyncStorage.setItem(
        'THIAWORLD_USER',
        JSON.stringify(data.user || {})
      );

      Alert.alert('Welcome', 'Signed in successfully to Thiaworld Jewellery!');
      
      // ✅ Navigate to Home screen after successful login
      if (navigation && navigation.reset) {
        // Reset navigation stack and go to Home
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      } else if (navigation && navigation.navigate) {
        // Fallback: navigate to Home
        navigation.navigate('Home');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', error.message || 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
      {/* Header with Logo */}
      <View style={styles.header}>
        <Image source={THIAWORLDLOGO} style={styles.logo} />
        <Text style={styles.title}>Thiaworld Jewellery</Text>
        <Text style={styles.subtitle}>
          Sign in to explore collections, manage gold exchange, and more
        </Text>
      </View>

      {/* Email Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email (optional)</Text>
          <TextInput
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
      </View>

      <Text style={styles.orText}>OR</Text>

      {/* Phone Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone Number</Text>
          <TextInput
            placeholder="Enter your 10-digit number"
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
            keyboardType="phone-pad"
            maxLength={10}
            editable={!loading}
          />
      </View>

      {/* OTP Section */}
      {!otpSent ? (
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleSendOtp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Send OTP</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Verify OTP</Text>
            <TextInput
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChangeText={setOtp}
              style={styles.input}
              keyboardType="numeric"
              maxLength={6}
              editable={!loading}
            />
        </View>
      )}

      {/* Password Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            style={styles.passwordInput}
            secureTextEntry={!showPassword}
            editable={!loading}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
            disabled={loading}
          >
            <Text style={styles.eyeIconText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sign In Button */}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSignIn}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#222" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      {/* Footer - Navigation links (only work if navigation prop is provided) */}
      <Text style={styles.footerText}>
        Don't have an account?{' '}
        {navigation ? (
          <Text style={styles.link} onPress={() => navigation.navigate('SignUp')}>
            Sign Up
          </Text>
        ) : (
          <Text>Sign up to get started.</Text>
        )}
      </Text>
      <Text style={styles.footerText}>
        {navigation ? (
          <Text style={styles.link} onPress={() => navigation.navigate('ForgotPassword')}>
            Forgot Password?
          </Text>
        ) : (
          <Text>Forgot Password? Contact support.</Text>
        )}
      </Text>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFDF5',
  },
  scrollContent: {
    paddingBottom: 100,
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFDF5',
    paddingHorizontal: 25,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 25,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#B8860B',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: '#444',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#FAFAFA',
    padding: 14,
    borderRadius: 10,
    fontSize: 15,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    paddingRight: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    fontSize: 15,
  },
  eyeIcon: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeIconText: {
    fontSize: 20,
  },
  orText: {
    textAlign: 'center',
    color: '#888',
    marginVertical: 15,
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    borderRadius: 50,
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footerText: {
    textAlign: 'center',
    color: '#555',
    fontSize: 14,
    marginTop: 8,
  },
  link: {
    color: '#B8860B',
    fontWeight: 'bold',
  },
});

export default SignInScreen;
