# BSNL Bulk SMS OTP Integration Guide

This guide will help you configure the BSNL Bulk SMS API for OTP authentication in your Thiaworld app.

## 📋 Prerequisites

1. **BSNL Bulk SMS Account**: You need to have an active BSNL Bulk SMS account
   - Visit: https://bulksms.bsnl.in/
   - Register for an account if you don't have one
   - Get your API credentials (username, password, sender ID)

2. **Sender ID**: Register a sender ID (max 6 characters)
   - Example: "THIAWD" (for Thiaworld)
   - This will appear as the sender name in SMS messages

## 🔧 Configuration Steps

### Step 1: Update API Credentials

Open `src/services/otpService.js` and update the following configuration:

```javascript
const BSNL_SMS_CONFIG = {
  baseUrl: 'https://bulksms.bsnl.in:5010',
  username: 'YOUR_BSNL_USERNAME',      // Replace with your BSNL username
  password: 'YOUR_BSNL_PASSWORD',      // Replace with your BSNL password
  senderId: 'THIAWD',                   // Your registered sender ID (max 6 chars)
};
```

### Step 2: Verify API Endpoint

The BSNL Bulk SMS API endpoint might vary. Common endpoints include:
- `/api/sendSMS`
- `/sendSMS`
- `/sms/send`
- `/api/sms/send`

**Current configuration uses**: `/api/sendSMS`

If this doesn't work, check the BSNL API documentation and update the `apiUrl` in the `sendOTP` function:

```javascript
const apiUrl = `${BSNL_SMS_CONFIG.baseUrl}/api/sendSMS`; // Update this if needed
```

### Step 3: Adjust API Request Format

The request payload format might need adjustment based on BSNL's actual API requirements. Update the `payload` object in `sendOTP` function:

```javascript
const payload = {
  username: BSNL_SMS_CONFIG.username,
  password: BSNL_SMS_CONFIG.password,
  senderid: BSNL_SMS_CONFIG.senderId,
  message: message,
  numbers: phoneNumber,
  // Add any additional required parameters:
  // route: 'TRANS',      // Transactional route
  // flash: 'N',          // Flash SMS (Y/N)
  // unicode: 'N',        // Unicode support (Y/N)
};
```

### Step 4: Handle API Response

The response handling might need adjustment based on BSNL's actual response format. Update the success check in `sendOTP`:

```javascript
// Adjust based on actual BSNL API response format
if (
  responseData.status === 'success' ||
  responseData.code === '200' ||
  responseData.messageId
) {
  // Success
}
```

## 🧪 Testing

### Development Mode

In development mode (`__DEV__`), the OTP will be logged to the console for testing purposes:

```javascript
if (__DEV__ && result.otp) {
  console.log('🔐 OTP for testing:', result.otp);
}
```

**⚠️ Important**: Remove this in production builds!

### Testing Flow

1. Enter a 10-digit phone number
2. Click "Send OTP"
3. Check the console for the OTP (in dev mode)
4. Enter the OTP in the verification field
5. Click "Verify OTP"
6. Once verified, you can sign in with OTP (no password required)

## 📱 Features Implemented

✅ **OTP Generation**: 6-digit random OTP  
✅ **OTP Sending**: Via BSNL Bulk SMS API  
✅ **OTP Verification**: Local verification with expiry check  
✅ **OTP Expiry**: 5 minutes validity  
✅ **Resend OTP**: With 60-second cooldown  
✅ **Attempt Limiting**: Maximum 5 verification attempts  
✅ **OTP-based Login**: Login without password after OTP verification  
✅ **Password Fallback**: Traditional password login still available  

## 🔒 Security Features

1. **OTP Expiry**: OTPs expire after 5 minutes
2. **Attempt Limiting**: Maximum 5 verification attempts per OTP
3. **Phone Number Validation**: Ensures 10-digit Indian phone numbers
4. **Secure Storage**: OTP data stored temporarily in AsyncStorage
5. **Auto Cleanup**: OTP data cleared after verification or expiry

## 🐛 Troubleshooting

### Issue: OTP not being sent

**Possible Causes:**
1. Invalid API credentials
2. Incorrect API endpoint
3. Network connectivity issues
4. API request format mismatch

**Solutions:**
1. Verify your BSNL credentials are correct
2. Check the BSNL API documentation for the correct endpoint
3. Check network connectivity
4. Review the API request format in `otpService.js`
5. Check console logs for detailed error messages

### Issue: API returns error

**Check:**
1. API response format in console logs
2. BSNL API documentation for required parameters
3. Sender ID registration status
4. Account balance/credits in BSNL portal

### Issue: OTP received but verification fails

**Check:**
1. OTP entered correctly (6 digits)
2. OTP hasn't expired (5 minutes)
3. Phone number matches the one used for sending
4. Not exceeded 5 verification attempts

## 📚 BSNL API Documentation

For detailed API documentation, refer to:
- BSNL Bulk SMS Portal: https://bulksms.bsnl.in/
- API Documentation: Check your BSNL account dashboard

## 🔄 Alternative SMS Providers

If BSNL API doesn't work, you can easily switch to other providers:

1. **Twilio**: Popular SMS API provider
2. **MSG91**: Indian SMS provider
3. **TextLocal**: Indian SMS provider
4. **Fast2SMS**: Indian SMS provider

To switch providers, update the `sendOTP` function in `otpService.js` with the new provider's API format.

## 📝 Notes

- The OTP service stores OTPs locally for verification. For production, consider implementing server-side OTP verification.
- The current implementation allows OTP-based login without password. Ensure your backend API supports this.
- Remove development OTP logging before production deployment.

## ✅ Next Steps

1. ✅ Configure BSNL API credentials
2. ✅ Test OTP sending
3. ✅ Test OTP verification
4. ✅ Test OTP-based login
5. ✅ Remove development logging
6. ✅ Update backend API to support OTP login (if needed)

---

**Need Help?** Check the console logs for detailed error messages and API responses.
