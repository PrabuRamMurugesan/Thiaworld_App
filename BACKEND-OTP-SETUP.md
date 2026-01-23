# Backend OTP Integration Guide

## ⚠️ Important: Backend is REQUIRED for Production

**Current Implementation**: The OTP service is calling BSNL API directly from the frontend, which has security issues:

1. **API Credentials Exposed**: BSNL username/password are visible in client code
2. **No Server-Side Validation**: OTP generation happens on client
3. **Security Risk**: Anyone can see your API credentials

## ✅ Recommended: Use Backend API

### Why Backend is Needed:

1. **Security**: Keep BSNL credentials on server (never expose to client)
2. **Validation**: Server validates phone numbers and rate limits
3. **Audit Trail**: Track OTP requests and verifications
4. **Better Error Handling**: Centralized error management
5. **Scalability**: Handle multiple SMS providers/fallbacks

## 🔧 Backend Implementation Steps

### Step 1: Create Backend Endpoint

Create an endpoint in your backend (e.g., `/api/auth/send-otp`):

```javascript
// Backend: POST /api/auth/send-otp
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    
    // Validate phone number
    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number'
      });
    }
    
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    
    // Store OTP in database (with phone, otp, expiresAt)
    await db.otps.create({
      phone,
      otp,
      expiresAt,
      attempts: 0
    });
    
    // Send SMS via BSNL API (credentials stored on server)
    const smsResult = await sendBSNLSMS({
      username: process.env.BSNL_USERNAME,
      password: process.env.BSNL_PASSWORD,
      senderId: process.env.BSNL_SENDER_ID,
      message: `Your Thiaworld OTP is ${otp}. Valid for 5 minutes.`,
      numbers: phone
    });
    
    if (smsResult.success) {
      res.json({
        success: true,
        message: 'OTP sent successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP'
      });
    }
  } catch (error) {
    console.error('OTP send error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});
```

### Step 2: Create OTP Verification Endpoint

```javascript
// Backend: POST /api/auth/verify-otp
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    
    // Find OTP record
    const otpRecord = await db.otps.findOne({
      where: { phone, otp }
    });
    
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }
    
    // Check expiry
    if (Date.now() > otpRecord.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired'
      });
    }
    
    // Check attempts
    if (otpRecord.attempts >= 5) {
      return res.status(400).json({
        success: false,
        message: 'Maximum attempts exceeded'
      });
    }
    
    // Verify OTP
    if (otpRecord.otp === otp) {
      // Mark as verified
      await db.otps.update(
        { verified: true },
        { where: { phone, otp } }
      );
      
      res.json({
        success: true,
        message: 'OTP verified successfully'
      });
    } else {
      // Increment attempts
      await db.otps.increment('attempts', {
        where: { phone, otp: otpRecord.otp }
      });
      
      res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }
  } catch (error) {
    console.error('OTP verify error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});
```

### Step 3: Update Frontend to Use Backend

In `src/services/otpService.js`, set:

```javascript
const useBackendAPI = true; // Enable backend API
const BACKEND_API_URL = 'https://thiaworld.bbscart.com/api/auth/send-otp';
```

### Step 4: Environment Variables (Backend)

Store BSNL credentials securely:

```env
BSNL_USERNAME=your_username
BSNL_PASSWORD=your_password
BSNL_SENDER_ID=THIAWD
BSNL_API_URL=https://bulksms.bsnl.in:5010
```

## 🔄 Current Status

**Current Implementation**: Direct BSNL API call from frontend
- ✅ Works for development/testing
- ❌ NOT secure for production
- ❌ API credentials exposed

**Recommended**: Backend API integration
- ✅ Secure (credentials on server)
- ✅ Better error handling
- ✅ Scalable and maintainable
- ⚠️ Requires backend development

## 📝 Next Steps

1. **For Development**: Current implementation works (with exposed credentials)
2. **For Production**: 
   - Implement backend endpoints
   - Move BSNL credentials to environment variables
   - Update frontend to use `useBackendAPI = true`
   - Remove direct BSNL API calls from frontend

## 🐛 Troubleshooting

### Issue: OTP not received

**Check:**
1. Backend logs for API errors
2. BSNL account balance
3. Phone number format
4. SMS delivery status in BSNL dashboard

### Issue: API credentials error

**Solution**: Move credentials to backend environment variables

---

**Note**: The current frontend implementation includes a fallback that generates OTP locally if the API fails. This is for development only and should be removed in production.
