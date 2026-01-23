// OTP Service for BSNL Bulk SMS API
import AsyncStorage from '@react-native-async-storage/async-storage';

// BSNL Bulk SMS API Configuration
// ⚠️ SECURITY WARNING: Storing API credentials in frontend is NOT secure for production!
// For production, use a backend API endpoint instead (see useBackendAPI option below)

const BSNL_SMS_CONFIG = {
  baseUrl: 'https://bulksms.bsnl.in:5010',
  username: 'bbspon', // Replace with your BSNL username
  password: '1947@peaCOCK', // Replace with your BSNL password
  senderId: 'THIAWD', // Your registered sender ID (max 6 characters)
};

// Option: Use your backend API instead (RECOMMENDED for production)
// Set this to true and configure your backend endpoint
const useBackendAPI = false; // Set to true to use backend API
const BACKEND_API_URL = 'https://thiaworld.bbscart.com/api/auth/send-otp'; // Your backend endpoint

// Storage keys
const OTP_STORAGE_KEY = 'THIAWORLD_OTP_DATA';

/**
 * Generate a random 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Store OTP data temporarily
 */
const storeOTPData = async (phone, otp, expiresAt) => {
  try {
    const otpData = {
      phone,
      otp,
      expiresAt,
      attempts: 0,
    };
    await AsyncStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otpData));
  } catch (error) {
    console.error('Error storing OTP:', error);
  }
};

/**
 * Get stored OTP data
 */
const getStoredOTPData = async () => {
  try {
    const data = await AsyncStorage.getItem(OTP_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error retrieving OTP:', error);
    return null;
  }
};

/**
 * Clear stored OTP data
 */
const clearOTPData = async () => {
  try {
    await AsyncStorage.removeItem(OTP_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing OTP:', error);
  }
};

/**
 * Send OTP via BSNL Bulk SMS API
 * @param {string} phoneNumber - 10-digit phone number
 * @returns {Promise<{success: boolean, message: string, otp?: string}>}
 */
export const sendOTP = async (phoneNumber) => {
  try {
    // Validate phone number
    if (!phoneNumber || phoneNumber.length !== 10 || !/^\d{10}$/.test(phoneNumber)) {
      return {
        success: false,
        message: 'Please enter a valid 10-digit phone number',
      };
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // OTP expires in 5 minutes

    // Store OTP locally for verification
    await storeOTPData(phoneNumber, otp, expiresAt);

    // Option 1: Use backend API (RECOMMENDED for production)
    if (useBackendAPI) {
      try {
        const token = await AsyncStorage.getItem('THIAWORLD_TOKEN');
        const response = await fetch(BACKEND_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({ phone: phoneNumber }),
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
          return {
            success: true,
            message: 'OTP sent successfully to your registered number',
            otp: __DEV__ ? otp : undefined, // Only show in dev mode
          };
        } else {
          return {
            success: false,
            message: data.message || 'Failed to send OTP via backend',
          };
        }
      } catch (backendError) {
        console.error('Backend API error:', backendError);
        // Fall through to direct BSNL API call
      }
    }

    // Option 2: Direct BSNL API call (for development/testing only)

    // Prepare SMS message
    const message = `Your Thiaworld OTP is ${otp}. Valid for 5 minutes. Do not share this OTP with anyone.`;

    // BSNL Bulk SMS API endpoint
    // Note: The exact endpoint structure may vary. Common patterns:
    // - /api/sendSMS
    // - /sendSMS
    // - /sms/send
    const apiUrl = `${BSNL_SMS_CONFIG.baseUrl}/api/sendSMS`;

    // Prepare request payload
    // Adjust these fields based on BSNL API documentation
    const payload = {
      username: BSNL_SMS_CONFIG.username,
      password: BSNL_SMS_CONFIG.password,
      senderid: BSNL_SMS_CONFIG.senderId,
      message: message,
      numbers: phoneNumber,
      // Additional parameters that might be required:
      // route: 'TRANS', // Transactional route
      // flash: 'N', // Flash SMS (Y/N)
      // unicode: 'N', // Unicode support (Y/N)
    };

    console.log('📤 Sending OTP via BSNL SMS API:', {
      phone: phoneNumber,
      endpoint: apiUrl,
    });

    // Try multiple API formats - BSNL APIs often use GET with query params
    let response;
    let responseText;
    let responseData;

    // Method 1: Try GET request with query parameters (common for BSNL)
    try {
      const queryParams = new URLSearchParams({
        username: BSNL_SMS_CONFIG.username,
        password: BSNL_SMS_CONFIG.password,
        senderid: BSNL_SMS_CONFIG.senderId,
        message: message,
        numbers: phoneNumber,
      });

      const getUrl = `${BSNL_SMS_CONFIG.baseUrl}/api/sendSMS?${queryParams.toString()}`;
      console.log('📤 Trying GET request:', getUrl);

      response = await fetch(getUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      responseText = await response.text();
      console.log('📥 Raw Response Text:', responseText);
      console.log('📥 Response Status:', response.status);
      console.log('📥 Response Headers:', Object.fromEntries(response.headers.entries()));

      // Try to parse as JSON
      if (responseText && responseText.trim()) {
        try {
          responseData = JSON.parse(responseText);
        } catch (parseError) {
          // If not JSON, check if it's a success message
          if (responseText.toLowerCase().includes('success') || responseText.toLowerCase().includes('sent')) {
            responseData = { status: 'success', message: responseText };
          } else {
            responseData = { status: 'error', message: responseText };
          }
        }
      } else {
        // Empty response - might still be success
        responseData = { status: 'unknown', message: 'Empty response from server' };
      }
    } catch (getError) {
      console.log('⚠️ GET request failed, trying POST:', getError.message);

      // Method 2: Try POST with JSON
      try {
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        responseText = await response.text();
        console.log('📥 POST Raw Response Text:', responseText);

        if (responseText && responseText.trim()) {
          try {
            responseData = JSON.parse(responseText);
          } catch (parseError) {
            if (responseText.toLowerCase().includes('success') || responseText.toLowerCase().includes('sent')) {
              responseData = { status: 'success', message: responseText };
            } else {
              responseData = { status: 'error', message: responseText };
            }
          }
        } else {
          responseData = { status: 'unknown', message: 'Empty response from server' };
        }
      } catch (postError) {
        console.log('⚠️ POST request also failed:', postError.message);
        throw postError;
      }
    }

    console.log('📥 Parsed Response Data:', responseData);

    // Handle different response structures
    // BSNL API might return various formats
    const isSuccess = 
      response.ok &&
      (
        responseData?.status === 'success' ||
        responseData?.status === 'Success' ||
        responseData?.code === '200' ||
        responseData?.messageId ||
        responseData?.message?.toLowerCase().includes('success') ||
        responseData?.message?.toLowerCase().includes('sent') ||
        responseText?.toLowerCase().includes('success') ||
        responseText?.toLowerCase().includes('sent') ||
        (response.status >= 200 && response.status < 300 && !responseData?.status)
      );

    if (isSuccess) {
      return {
        success: true,
        message: 'OTP sent successfully to your registered number',
        otp: otp, // Only for development/testing - remove in production
      };
    } else {
      const errorMessage = 
        responseData?.message || 
        responseData?.error || 
        responseText || 
        `API returned status ${response.status}. Please check your BSNL API credentials and account balance.`;
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  } catch (error) {
    console.error('❌ Error sending OTP:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    
    // For development: Still generate OTP locally if API fails
    // ⚠️ REMOVE THIS IN PRODUCTION - Use backend instead
    const storedData = await getStoredOTPData();
    if (storedData && storedData.phone === phoneNumber) {
      console.warn('⚠️ API failed, using locally generated OTP for development');
      return {
        success: true,
        message: 'OTP generated locally (API unavailable). Check console for OTP.',
        otp: storedData.otp, // For development/testing only
      };
    }

    return {
      success: false,
      message: `Failed to send OTP: ${error.message || 'Network error'}. Please check your internet connection and BSNL API credentials.`,
    };
  }
};

/**
 * Verify OTP
 * @param {string} phoneNumber - Phone number used for OTP
 * @param {string} enteredOTP - OTP entered by user
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const verifyOTP = async (phoneNumber, enteredOTP) => {
  try {
    // Validate inputs
    if (!phoneNumber || !enteredOTP) {
      return {
        success: false,
        message: 'Please enter OTP',
      };
    }

    if (enteredOTP.length !== 6 || !/^\d{6}$/.test(enteredOTP)) {
      return {
        success: false,
        message: 'Please enter a valid 6-digit OTP',
      };
    }

    // Get stored OTP data
    const storedData = await getStoredOTPData();

    if (!storedData) {
      return {
        success: false,
        message: 'OTP expired or not found. Please request a new OTP.',
      };
    }

    // Check if phone number matches
    if (storedData.phone !== phoneNumber) {
      return {
        success: false,
        message: 'Phone number mismatch. Please request a new OTP.',
      };
    }

    // Check if OTP has expired
    if (Date.now() > storedData.expiresAt) {
      await clearOTPData();
      return {
        success: false,
        message: 'OTP has expired. Please request a new OTP.',
      };
    }

    // Check attempt limit (max 5 attempts)
    if (storedData.attempts >= 5) {
      await clearOTPData();
      return {
        success: false,
        message: 'Maximum attempts exceeded. Please request a new OTP.',
      };
    }

    // Verify OTP
    if (storedData.otp === enteredOTP) {
      // OTP verified successfully
      await clearOTPData();
      return {
        success: true,
        message: 'OTP verified successfully',
      };
    } else {
      // Increment attempt count
      storedData.attempts += 1;
      await storeOTPData(storedData.phone, storedData.otp, storedData.expiresAt);

      const remainingAttempts = 5 - storedData.attempts;
      return {
        success: false,
        message: `Invalid OTP. ${remainingAttempts} attempt(s) remaining.`,
      };
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return {
      success: false,
      message: 'Error verifying OTP. Please try again.',
    };
  }
};

/**
 * Resend OTP
 * @param {string} phoneNumber - Phone number
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const resendOTP = async (phoneNumber) => {
  // Clear existing OTP data
  await clearOTPData();
  // Send new OTP
  return await sendOTP(phoneNumber);
};

/**
 * Check if OTP exists and is valid for a phone number
 * @param {string} phoneNumber - Phone number
 * @returns {Promise<boolean>}
 */
export const hasValidOTP = async (phoneNumber) => {
  const storedData = await getStoredOTPData();
  if (!storedData || storedData.phone !== phoneNumber) {
    return false;
  }
  return Date.now() < storedData.expiresAt;
};
