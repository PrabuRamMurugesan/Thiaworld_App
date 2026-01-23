// Auth API Service for React Native
import axios from 'axios';

const API_BASE = 'https://thiaworld.bbscart.com/api';

/**
 * Send forgot password OTP to email
 * @param {Object} data - { email: string }
 * @returns {Promise}
 */
export const forgotPassword = async (data) => {
  try {
    const response = await axios.post(`${API_BASE}/auth/forgot-password`, data);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Verify OTP for password reset
 * @param {Object} data - { email: string, otp: string }
 * @returns {Promise}
 */
export const verifyOTP = async (data) => {
  try {
    const response = await axios.post(`${API_BASE}/auth/verify-otp`, data);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Reset password after OTP verification
 * @param {Object} data - { email: string, otp: string, newPassword: string }
 * @returns {Promise}
 */
export const resetPassword = async (data) => {
  try {
    const response = await axios.post(`${API_BASE}/auth/reset-password`, data);
    return response;
  } catch (error) {
    throw error;
  }
};
