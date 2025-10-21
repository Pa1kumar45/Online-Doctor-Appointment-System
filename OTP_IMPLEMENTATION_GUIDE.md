# OTP Authentication System - Implementation Guide

## Overview

This system implements **mandatory OTP (One-Time Password) verification** for both registration and login. Direct login is no longer allowed - users must verify their identity via email OTP every time they authenticate.

## Key Features

- ✅ **Email Verification**: All users must verify their email with OTP
- ✅ **Two-Factor Authentication**: OTP required for every login
- ✅ **Rate Limiting**: 1 OTP per minute to prevent abuse
- ✅ **Expiry Management**: OTPs expire after 10 minutes
- ✅ **Attempt Limiting**: Maximum 3 verification attempts per OTP
- ✅ **Automatic Cleanup**: MongoDB TTL index removes expired OTPs
- ✅ **Professional Emails**: HTML templates with responsive design
- ✅ **Development Mode**: OTP included in API response for testing

---

## Authentication Flow

### Registration Flow

```
1. User submits registration form
   POST /api/auth/register
   ↓
2. System validates input (password strength, email format, etc.)
   ↓
3. System creates user account (isEmailVerified = false)
   ↓
4. System generates 6-digit OTP (valid for 10 minutes)
   ↓
5. System sends OTP to user's email
   ↓
6. User receives email with OTP code
   ↓
7. User submits OTP for verification
   POST /api/auth/verify-otp (purpose: 'registration')
   ↓
8. System verifies OTP
   ↓
9. System marks email as verified (isEmailVerified = true)
   ↓
10. System sends welcome email
   ↓
11. User can now login
```

### Login Flow

```
1. User submits login credentials (email, password, role)
   POST /api/auth/login
   ↓
2. System validates credentials
   ↓
3. System checks if email is verified
   ↓
4. System checks if account is active (not suspended)
   ↓
5. System generates 6-digit OTP (valid for 10 minutes)
   ↓
6. System sends OTP to user's email
   ↓
7. User receives email with OTP code
   ↓
8. User submits OTP for verification
   POST /api/auth/verify-otp (purpose: 'login')
   ↓
9. System verifies OTP
   ↓
10. System generates JWT token
   ↓
11. System sets token as httpOnly cookie
   ↓
12. User is logged in and can access protected routes
```

---

## API Endpoints

### 1. Register User (Step 1)
**Endpoint:** `POST /api/auth/register`  
**Access:** Public

**Request Body:**
```json
{
  "name": "Dr. John Smith",
  "email": "john.smith@example.com",
  "password": "SecurePass123!",
  "contactNumber": "9876543210",
  "role": "doctor",
  "specialization": "Cardiology",
  "qualification": "MBBS, MD",
  "experience": 10
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Registration successful! Please check your email for OTP verification.",
  "email": "john.smith@example.com",
  "requiresVerification": true,
  "otp": "123456",  // Only in development mode
  "devNote": "OTP included for development testing only"
}
```

**Error Responses:**
- **400 Bad Request:** Validation errors (weak password, invalid email, etc.)
- **409 Conflict:** Email already registered
- **500 Server Error:** Database or email service error

---

### 2. Verify OTP (Complete Registration or Login)
**Endpoint:** `POST /api/auth/verify-otp`  
**Access:** Public

**Request Body:**
```json
{
  "email": "john.smith@example.com",
  "otp": "123456",
  "role": "doctor",
  "purpose": "registration"  // or "login"
}
```

**Success Response - Registration (200):**
```json
{
  "success": true,
  "message": "Email verified successfully! You can now login.",
  "data": {
    "_id": "64f7a1b2c3d4e5f6g7h8i9j0",
    "name": "Dr. John Smith",
    "email": "john.smith@example.com",
    "contactNumber": "9876543210",
    "role": "doctor",
    "isEmailVerified": true,
    "emailVerifiedAt": "2024-01-15T10:30:00.000Z",
    "specialization": "Cardiology",
    "qualification": "MBBS, MD",
    "experience": 10,
    "isActive": true,
    "createdAt": "2024-01-15T10:25:00.000Z"
  }
}
```

**Success Response - Login (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "_id": "64f7a1b2c3d4e5f6g7h8i9j0",
    "name": "Dr. John Smith",
    "email": "john.smith@example.com",
    "role": "doctor",
    "isEmailVerified": true,
    // ... other user data
  }
}
```
*Note: JWT token set as httpOnly cookie*

**Error Responses:**
- **400 Bad Request:** Invalid OTP, expired OTP, maximum attempts exceeded
- **404 Not Found:** User not found
- **500 Server Error:** Database error

---

### 3. Login User (Step 1 - Send OTP)
**Endpoint:** `POST /api/auth/login`  
**Access:** Public

**Request Body:**
```json
{
  "email": "john.smith@example.com",
  "password": "SecurePass123!",
  "role": "doctor"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP sent to your email. Please verify to complete login.",
  "email": "john.smith@example.com",
  "requiresOTP": true,
  "otp": "654321",  // Only in development mode
  "devNote": "OTP included for development testing only"
}
```

**Error Responses:**
- **400 Bad Request:** 
  - Invalid credentials
  - Email not verified (user must verify registration OTP first)
- **403 Forbidden:** Account suspended
- **429 Too Many Requests:** Rate limit exceeded (wait before requesting new OTP)
- **500 Server Error:** Database or email service error

---

### 4. Resend OTP
**Endpoint:** `POST /api/auth/resend-otp`  
**Access:** Public

**Request Body:**
```json
{
  "email": "john.smith@example.com",
  "role": "doctor",
  "purpose": "registration"  // or "login"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "New OTP sent to your email",
  "email": "john.smith@example.com",
  "otp": "789012",  // Only in development mode
  "devNote": "OTP included for development testing only"
}
```

**Error Responses:**
- **404 Not Found:** User not found
- **429 Too Many Requests:** Rate limit exceeded (must wait 60 seconds)
- **500 Server Error:** Database or email service error

---

## OTP Specifications

| Property | Value | Description |
|----------|-------|-------------|
| **Length** | 6 digits | Numeric only (000000 - 999999) |
| **Expiry** | 10 minutes | Automatically deleted after expiry |
| **Attempts** | 3 maximum | OTP blocked after 3 failed attempts |
| **Rate Limit** | 60 seconds | Minimum time between OTP requests |
| **Purpose** | registration, login | Different OTPs for different purposes |
| **Storage** | MongoDB | TTL index for automatic cleanup |

---

## Email Configuration

### Required Environment Variables

Add these to your `.env` file:

```env
# Email Service Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-digit-app-password

# Application Configuration
NODE_ENV=development  # or 'production'
```

### Gmail Setup Steps

1. **Enable 2-Factor Authentication**
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it: "Doctor Appointment System"
   - Copy the 16-digit password

3. **Update .env File**
   ```env
   EMAIL_USER=youremail@gmail.com
   EMAIL_PASSWORD=abcd efgh ijkl mnop  # 16-digit app password
   ```

4. **Restart Server**
   ```bash
   npm run dev
   ```

**See `GMAIL_SETUP_GUIDE.md` for detailed instructions with screenshots.**

---

## Email Templates

### OTP Email (Registration)

**Subject:** Verify Your Email - Doctor Appointment System

```
Hi [Name],

Thank you for registering! Please verify your email address to complete your registration.

Your OTP code is: [123456]

This code will expire in 10 minutes.

For security reasons:
- Never share this code with anyone
- We will never ask for your password
- Contact support if you didn't request this

Best regards,
Doctor Appointment System Team
```

### OTP Email (Login)

**Subject:** Login Verification Code - Doctor Appointment System

```
Hi [Name],

Someone is trying to login to your account. If this is you, use the code below:

Your OTP code is: [654321]

This code will expire in 10 minutes.

If you didn't attempt to login, please ignore this email and contact support immediately.

Best regards,
Doctor Appointment System Team
```

### Welcome Email (After Registration Verification)

**Subject:** Welcome to Doctor Appointment System!

```
Hi [Name],

Welcome to Doctor Appointment System! Your email has been verified successfully.

As a [Doctor/Patient], you can now:
- [Role-specific features]
- Access your dashboard
- Manage your profile
- And more!

Get started: [Login Link]

Best regards,
Doctor Appointment System Team
```

---

## Database Schema

### OTP Collection

```javascript
{
  email: String,              // User's email address
  otp: String,                // 6-digit OTP code (hashed)
  role: String,               // 'doctor' or 'patient'
  purpose: String,            // 'registration', 'login', 'password-reset'
  verified: Boolean,          // Whether OTP has been verified
  attempts: Number,           // Number of verification attempts (max 3)
  expiresAt: Date,           // Expiry timestamp (10 minutes from creation)
  createdAt: Date            // Creation timestamp
}

// Indexes:
- { email: 1, purpose: 1, verified: 1 }  // Query optimization
- { expiresAt: 1 }, { expireAfterSeconds: 0 }  // TTL index for auto-cleanup
```

### Updated User Models (Doctor/Patient)

```javascript
{
  // ... existing fields
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerifiedAt: {
    type: Date,
    default: null
  }
}
```

---

## Security Features

### 1. Rate Limiting
- **1 OTP per minute** per email/purpose combination
- Prevents spam and brute force attacks
- Returns wait time in seconds if limit exceeded

### 2. Attempt Limiting
- **Maximum 3 verification attempts** per OTP
- After 3 failed attempts, OTP is invalidated
- User must request a new OTP

### 3. Expiry Management
- OTPs expire after **10 minutes**
- MongoDB TTL index automatically deletes expired OTPs
- Reduces database storage and prevents stale OTP usage

### 4. Password Security
- OTPs stored with bcrypt hashing
- Secure comparison prevents timing attacks
- No plaintext OTP storage

### 5. Email Security
- Verification prevents fake registrations
- Login OTP adds two-factor authentication
- Warning messages in emails about security

---

## Testing in Development Mode

### Using Postman

#### Test 1: Register New User

```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test Doctor",
  "email": "test.doctor@example.com",
  "password": "TestPass123!",
  "role": "doctor",
  "specialization": "General Medicine",
  "qualification": "MBBS",
  "experience": 5
}
```

**Response:** Check for OTP in response (development mode)

#### Test 2: Verify Registration OTP

```
POST http://localhost:5000/api/auth/verify-otp
Content-Type: application/json

{
  "email": "test.doctor@example.com",
  "otp": "123456",  // Use OTP from previous response
  "role": "doctor",
  "purpose": "registration"
}
```

**Response:** Email verified, user can now login

#### Test 3: Login (Step 1 - Send OTP)

```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test.doctor@example.com",
  "password": "TestPass123!",
  "role": "doctor"
}
```

**Response:** OTP sent to email (check response for OTP in dev mode)

#### Test 4: Verify Login OTP (Step 2 - Complete Login)

```
POST http://localhost:5000/api/auth/verify-otp
Content-Type: application/json

{
  "email": "test.doctor@example.com",
  "otp": "654321",  // Use OTP from login response
  "role": "doctor",
  "purpose": "login"
}
```

**Response:** JWT token set as cookie, user logged in

#### Test 5: Resend OTP

```
POST http://localhost:5000/api/auth/resend-otp
Content-Type: application/json

{
  "email": "test.doctor@example.com",
  "role": "doctor",
  "purpose": "login"
}
```

**Response:** New OTP sent

#### Test 6: Rate Limiting

Call resend-otp immediately after the previous request:

```
POST http://localhost:5000/api/auth/resend-otp
(same body as above)
```

**Expected:** 429 error with wait time

#### Test 7: Invalid OTP

```
POST http://localhost:5000/api/auth/verify-otp
Content-Type: application/json

{
  "email": "test.doctor@example.com",
  "otp": "000000",
  "role": "doctor",
  "purpose": "login"
}
```

**Expected:** 400 error with attempts remaining

---

## Error Handling

### Common Error Scenarios

| Scenario | HTTP Code | Message | Action |
|----------|-----------|---------|--------|
| Invalid OTP | 400 | Invalid or expired OTP | Request new OTP |
| OTP Expired | 400 | OTP has expired | Request new OTP |
| Max Attempts | 400 | Maximum attempts exceeded | Request new OTP |
| Rate Limit | 429 | Wait X seconds before requesting new OTP | Wait and retry |
| Email Not Verified | 400 | Email not verified. Please verify your email first. | Verify registration OTP |
| User Not Found | 404 | User not found | Check email/role |
| Account Suspended | 403 | Account suspended | Contact support |
| Email Service Error | 500 | Failed to send OTP email | Check email configuration |

---

## Production Deployment Checklist

### Before Going Live:

- [ ] **Set `NODE_ENV=production`** in .env
  - This removes OTP from API responses
  - Only sends OTP via email

- [ ] **Configure Email Service**
  - Update `EMAIL_USER` with production email
  - Update `EMAIL_PASSWORD` with production app password
  - Test email delivery

- [ ] **Security Configuration**
  - Ensure `JWT_SECRET` is strong and random
  - Set `COOKIE_EXPIRE` appropriately (default: 30 days)
  - Enable CORS for your frontend domain only

- [ ] **Database Configuration**
  - Verify MongoDB connection string
  - Ensure TTL indexes are created
  - Test database connectivity

- [ ] **Rate Limiting**
  - Consider implementing additional rate limiting at API gateway level
  - Monitor for abuse patterns

- [ ] **Monitoring**
  - Set up logging for OTP failures
  - Monitor email delivery success rates
  - Track OTP verification rates

- [ ] **Frontend Updates**
  - Update login flow to handle OTP step
  - Add OTP verification UI
  - Add resend OTP button
  - Show remaining attempts
  - Handle all error scenarios

---

## Troubleshooting

### Problem: Emails Not Sending

**Possible Causes:**
1. Invalid Gmail app password
2. 2FA not enabled on Gmail
3. Email service credentials not in .env
4. Gmail blocking less secure apps

**Solutions:**
1. Regenerate Gmail app password
2. Enable 2-Step Verification
3. Check .env file has correct EMAIL_USER and EMAIL_PASSWORD
4. Use app-specific password (not regular Gmail password)

### Problem: OTP Always Invalid

**Possible Causes:**
1. OTP expired (10-minute limit)
2. Wrong email or role
3. Wrong purpose (registration vs login)
4. OTP already used

**Solutions:**
1. Request new OTP
2. Verify email and role match registration
3. Use correct purpose in verify-otp request
4. Each OTP can only be used once

### Problem: Rate Limit Errors

**Cause:** Too many OTP requests in short time

**Solution:** Wait 60 seconds between requests

### Problem: User Can't Login After Registration

**Cause:** Email not verified

**Solution:** User must verify registration OTP first before they can login

---

## File Structure

```
backend/
├── src/
│   ├── models/
│   │   ├── OTP.js                    # OTP schema and methods
│   │   ├── Doctor.js                 # Updated with isEmailVerified
│   │   └── Patient.js                # Updated with isEmailVerified
│   │
│   ├── services/
│   │   └── emailService.js           # Nodemailer configuration & templates
│   │
│   ├── controllers/
│   │   └── authController.js         # Updated with OTP functions
│   │
│   ├── middleware/
│   │   └── validation.js             # OTP validation rules
│   │
│   └── routes/
│       └── auth.js                   # OTP endpoints
│
├── .env                              # Email configuration
└── package.json                      # nodemailer dependency

docs/
├── GMAIL_SETUP_GUIDE.md             # Detailed Gmail setup
└── OTP_IMPLEMENTATION_GUIDE.md      # This file
```

---

## Next Steps

1. **Configure Email Service**
   - Follow `GMAIL_SETUP_GUIDE.md`
   - Test email delivery

2. **Test Complete Flow**
   - Register new user
   - Verify registration OTP
   - Login with credentials
   - Verify login OTP
   - Access protected routes

3. **Update Frontend**
   - Add OTP input screen
   - Handle OTP verification
   - Add resend OTP button
   - Show error messages
   - Display remaining attempts

4. **Deploy to Production**
   - Set `NODE_ENV=production`
   - Use production email service
   - Monitor logs and errors

---

## Support

For issues or questions:
1. Check this guide and `GMAIL_SETUP_GUIDE.md`
2. Review error messages in API responses
3. Check server logs for detailed error information
4. Verify all environment variables are set correctly

---

**Last Updated:** January 2024  
**Version:** 1.0.0
