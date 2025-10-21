# Password Reset System - Implementation Guide

## Overview

This system implements **secure password reset functionality** for all user types (Doctors, Patients, and Admins). Users can reset forgotten passwords via email using time-limited secure tokens.

---

## Key Features

- ✅ **Email-Based Reset**: Secure reset links sent to verified email
- ✅ **Token Security**: Cryptographically secure tokens (hashed storage)
- ✅ **Time-Limited**: Tokens expire after 1 hour
- ✅ **Password Change Tracking**: Records when passwords are changed
- ✅ **Email Notifications**: Confirmation emails after password changes
- ✅ **Current Password Verification**: Required for authenticated password changes
- ✅ **Professional Email Templates**: HTML formatted with security warnings

---

## Password Reset Flows

### Flow 1: Forgot Password (Unauthenticated)

```
1. User clicks "Forgot Password" on login page
   ↓
2. User enters email and role
   POST /api/auth/forgot-password
   ↓
3. System validates email exists
   ↓
4. System generates secure reset token (32 bytes crypto random)
   ↓
5. System hashes token (SHA-256) and stores in database
   ↓
6. System sends email with reset link containing plain token
   ↓
7. User receives email with reset link
   (Link format: http://localhost:3000/reset-password/{token})
   ↓
8. User clicks link and enters new password
   POST /api/auth/reset-password/:token
   ↓
9. System validates token (hash comparison)
   ↓
10. System checks token expiration (< 1 hour old)
   ↓
11. System updates password (hashed by pre-save middleware)
   ↓
12. System clears reset token from database
   ↓
13. System records password change timestamp
   ↓
14. System sends confirmation email
   ↓
15. User can now login with new password
```

### Flow 2: Change Password (Authenticated)

```
1. Logged-in user goes to account settings
   ↓
2. User enters current password + new password
   PUT /api/auth/change-password (requires JWT)
   ↓
3. System verifies current password is correct
   ↓
4. System validates new password is different from current
   ↓
5. System updates password (hashed by pre-save middleware)
   ↓
6. System records password change timestamp
   ↓
7. System sends confirmation email
   ↓
8. Password changed successfully
```

---

## API Endpoints

### 1. Forgot Password (Request Reset)
**Endpoint:** `POST /api/auth/forgot-password`  
**Access:** Public

**Request Body:**
```json
{
  "email": "doctor@example.com",
  "role": "doctor"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset link sent to your email. Please check your inbox.",
  "email": "doctor@example.com"
}
```

**Error Responses:**
- **400 Bad Request:** Invalid email format or role
- **500 Server Error:** Email service error

**Notes:**
- Returns success even if email doesn't exist (security: don't reveal if email is registered)
- Token is valid for 1 hour
- Previous reset tokens are invalidated when new one is generated

---

### 2. Reset Password (With Token)
**Endpoint:** `POST /api/auth/reset-password/:token`  
**Access:** Public

**Request Body:**
```json
{
  "password": "NewSecurePassword123!",
  "confirmPassword": "NewSecurePassword123!",
  "role": "doctor"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful! You can now login with your new password."
}
```

**Error Responses:**
- **400 Bad Request:**
  - Invalid or expired token
  - Password doesn't meet strength requirements
  - Passwords don't match
- **500 Server Error:** Database update error

---

### 3. Change Password (Authenticated)
**Endpoint:** `PUT /api/auth/change-password`  
**Access:** Private (requires JWT token)

**Request Headers:**
```
Cookie: jwt=<your-jwt-token>
```

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewSecurePassword123!",
  "confirmPassword": "NewSecurePassword123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Responses:**
- **400 Bad Request:**
  - Current password is incorrect
  - New password is same as current password
  - Password doesn't meet strength requirements
  - Passwords don't match
- **401 Unauthorized:** No valid JWT token
- **404 Not Found:** User not found
- **500 Server Error:** Database update error

---

## Database Schema Updates

### Doctor Model (Doctor.js)
```javascript
{
  // Existing fields...
  
  // Password reset functionality
  passwordResetToken: {
    type: String // SHA-256 hashed reset token
  },
  passwordResetExpires: {
    type: Date // Expiration timestamp (1 hour from generation)
  },
  passwordChangedAt: {
    type: Date // Last password change timestamp
  }
}
```

### Patient Model (Patient.js)
```javascript
{
  // Existing fields...
  
  // Password reset functionality
  passwordResetToken: {
    type: String // SHA-256 hashed reset token
  },
  passwordResetExpires: {
    type: Date // Expiration timestamp (1 hour from generation)
  },
  passwordChangedAt: {
    type: Date // Last password change timestamp
  }
}
```

### Admin Model (Admin.js)
```javascript
{
  // Existing fields...
  
  // Password reset functionality
  passwordResetToken: {
    type: String // SHA-256 hashed reset token
  },
  passwordResetExpires: {
    type: Date // Expiration timestamp (1 hour from generation)
  },
  passwordChangedAt: {
    type: Date // Last password change timestamp
  }
}
```

---

## Email Templates

### Password Reset Email

**Subject:** Password Reset Request - Doctor Appointment System

**Content:**
```
Hi [Name],

We received a request to reset your password for your [Role] account.

[Reset My Password Button] → Links to: {FRONTEND_URL}/reset-password/{token}

⏰ This link will expire in 1 hour

⚠️ Security Notice:
• If you didn't request this password reset, please ignore this email
• Your current password will remain unchanged
• Never share this link with anyone
• We'll never ask for your password via email

If you're having trouble clicking the button, copy and paste this link:
{FRONTEND_URL}/reset-password/{token}
```

### Password Changed Confirmation Email

**Subject:** Password Changed - Doctor Appointment System

**Content:**
```
Hi [Name],

✅ Your password has been changed successfully!

Your account password was changed on {timestamp}.
You can now log in with your new password.

⚠️ Didn't make this change?
If you did NOT change your password, please contact our support team immediately.
Your account security may be compromised.
```

---

## Security Features

### 1. Token Security
- **Generation**: Cryptographically secure random bytes (32 bytes)
- **Storage**: SHA-256 hashed (never store plain tokens)
- **Comparison**: Secure hash comparison (prevents timing attacks)
- **Expiration**: Auto-expires after 1 hour
- **One-Time Use**: Token cleared after successful reset

### 2. Password Strength Requirements
Via validation middleware:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (!@#$%^&*)

### 3. Prevention Measures
- **Brute Force**: Rate limiting recommended (implement with express-rate-limit)
- **Enumeration**: Generic error messages (don't reveal if email exists)
- **Token Reuse**: Tokens invalidated after use
- **Expired Tokens**: Checked on every reset attempt

### 4. Audit Trail
- `passwordChangedAt` field tracks all password changes
- Can be used to:
  - Detect unauthorized changes
  - Force re-authentication after password change
  - Compliance reporting

---

## Testing with Postman

### Test 1: Forgot Password (Request Reset)

```
POST http://localhost:5000/api/auth/forgot-password
Content-Type: application/json

{
  "email": "test.doctor@example.com",
  "role": "doctor"
}
```

**Expected:**
- 200 status code
- Check email inbox for reset link
- Token in URL: `/reset-password/{token}`

---

### Test 2: Reset Password (With Token)

```
POST http://localhost:5000/api/auth/reset-password/{token-from-email}
Content-Type: application/json

{
  "password": "NewPassword123!",
  "confirmPassword": "NewPassword123!",
  "role": "doctor"
}
```

**Expected:**
- 200 status code
- Success message
- Confirmation email sent
- Can now login with new password

---

### Test 3: Reset with Expired Token

**Wait 1 hour after requesting reset, then:**
```
POST http://localhost:5000/api/auth/reset-password/{old-token}
Content-Type: application/json

{
  "password": "NewPassword123!",
  "confirmPassword": "NewPassword123!",
  "role": "doctor"
}
```

**Expected:**
- 400 error
- Message: "Invalid or expired reset token"

---

### Test 4: Change Password (Authenticated)

**First, login to get JWT cookie, then:**
```
PUT http://localhost:5000/api/auth/change-password
Content-Type: application/json
Cookie: jwt=<your-jwt-token>

{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

**Expected:**
- 200 status code
- Success message
- Confirmation email sent

---

### Test 5: Change Password with Wrong Current Password

```
PUT http://localhost:5000/api/auth/change-password
Content-Type: application/json
Cookie: jwt=<your-jwt-token>

{
  "currentPassword": "WrongPassword",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

**Expected:**
- 400 error
- Message: "Current password is incorrect"

---

### Test 6: Change Password - New Same as Current

```
PUT http://localhost:5000/api/auth/change-password
Content-Type: application/json
Cookie: jwt=<your-jwt-token>

{
  "currentPassword": "CurrentPassword123!",
  "newPassword": "CurrentPassword123!",
  "confirmPassword": "CurrentPassword123!"
}
```

**Expected:**
- 400 error
- Message: "New password must be different from current password"

---

## Frontend Implementation Checklist

### Pages to Create

#### 1. Forgot Password Page
**Route:** `/forgot-password`

**UI Components:**
```tsx
- Email input field
- Role selector (Doctor/Patient/Admin)
- Submit button
- Back to login link
- Success message display
- Error message display
```

**Functionality:**
- Form submission to POST /api/auth/forgot-password
- Email format validation
- Success message: "Reset link sent to your email"
- Error handling

---

#### 2. Reset Password Page
**Route:** `/reset-password/:token`

**UI Components:**
```tsx
- New password input (with show/hide toggle)
- Confirm password input
- Password strength meter
- Role selector (Doctor/Patient/Admin)
- Submit button
- Password requirements checklist:
  ☐ At least 8 characters
  ☐ One uppercase letter
  ☐ One lowercase letter
  ☐ One number
  ☐ One special character
```

**Functionality:**
- Extract token from URL params
- Form submission to POST /api/auth/reset-password/:token
- Real-time password strength checking
- Password match validation
- Success redirect to login
- Error handling (expired token, weak password, etc.)

---

#### 3. Change Password Component
**Location:** Settings/Profile page

**UI Components:**
```tsx
- Current password input
- New password input (with show/hide toggle)
- Confirm new password input
- Password strength meter
- Submit button
- Success/error messages
```

**Functionality:**
- Form submission to PUT /api/auth/change-password
- Current password verification
- Password strength checking
- Success notification
- Error handling

---

## Environment Variables Required

Add to `.env`:
```env
# Email Service (already configured for OTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Frontend URL for reset links
FRONTEND_URL=http://localhost:3000

# JWT Secret (already configured)
JWT_SECRET=your-secret-key
```

---

## Error Handling

### Common Error Scenarios

| Scenario | HTTP Code | Message | User Action |
|----------|-----------|---------|-------------|
| Email not found | 400 | If an account exists with this email, a reset link has been sent | Check email or try different email |
| Invalid token | 400 | Invalid or expired reset token | Request new reset link |
| Expired token | 400 | Invalid or expired reset token | Request new reset link |
| Weak password | 400 | Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character | Use stronger password |
| Passwords don't match | 400 | Passwords do not match | Re-enter passwords |
| Wrong current password | 400 | Current password is incorrect | Try again or use forgot password |
| Same new password | 400 | New password must be different from current password | Choose different password |
| Email service down | 500 | Failed to send reset email | Try again later |
| Not authenticated | 401 | Please login to change password | Login first |

---

## Production Deployment Checklist

Before going live:

- [ ] **Set FRONTEND_URL** in production .env to your actual frontend domain
- [ ] **Test Email Delivery** - Ensure emails reach inbox (not spam)
- [ ] **Implement Rate Limiting** - Limit forgot password requests (e.g., 3 per 15 minutes per IP)
- [ ] **Monitor Failed Attempts** - Log and alert on suspicious activity
- [ ] **SSL/HTTPS** - Ensure reset links use HTTPS in production
- [ ] **Token Security** - Verify tokens are properly hashed in database
- [ ] **Email Templates** - Test all email templates render correctly
- [ ] **Error Messages** - Ensure no sensitive information leaked in errors
- [ ] **Logging** - Log password reset attempts for security auditing
- [ ] **User Notification** - Consider notifying users of password reset requests even if email doesn't exist (security best practice)

---

## Troubleshooting

### Problem: Reset Email Not Received

**Possible Causes:**
1. Email in spam folder
2. Email service not configured
3. Invalid email address
4. Email service quota exceeded

**Solutions:**
1. Check spam/junk folder
2. Verify EMAIL_USER and EMAIL_PASSWORD in .env
3. Test email service with `verifyEmailService()` function
4. Check Gmail sending limits

---

### Problem: "Invalid or expired token"

**Possible Causes:**
1. Token already used
2. More than 1 hour passed
3. Token copied incorrectly from email
4. New reset requested (invalidates old token)

**Solutions:**
1. Request new reset link
2. Copy complete token from email
3. Check URL is complete

---

### Problem: Password won't update

**Possible Causes:**
1. Pre-save middleware not running
2. Database validation error
3. Password field not being selected

**Solutions:**
1. Check model pre-save hooks
2. Verify password meets all requirements
3. Ensure password field included in query

---

## Integration with Existing Systems

### Works With:
- ✅ OTP Authentication System
- ✅ JWT Session Management
- ✅ Email Service (nodemailer)
- ✅ Input Validation System
- ✅ All User Models (Doctor/Patient/Admin)

### Future Enhancements:
- [ ] Password history (prevent reuse of last N passwords)
- [ ] Force password reset after X days
- [ ] Security questions as additional verification
- [ ] SMS-based password reset option
- [ ] Multi-factor authentication for password changes
- [ ] Password breach checking (haveibeenpwned API)

---

## File Structure

```
backend/
├── src/
│   ├── models/
│   │   ├── Doctor.js              # Updated with password reset fields
│   │   ├── Patient.js             # Updated with password reset fields
│   │   └── Admin.js               # Updated with password reset fields
│   │
│   ├── services/
│   │   └── emailService.js        # Added sendPasswordResetEmail & sendPasswordChangedEmail
│   │
│   ├── controllers/
│   │   └── authController.js      # Added forgotPassword, resetPassword, changePassword
│   │
│   ├── middleware/
│   │   └── validation.js          # Added validateForgotPassword, validateResetPassword
│   │
│   └── routes/
│       └── auth.js                # Added /forgot-password, /reset-password/:token, /change-password
│
├── .env                           # FRONTEND_URL configuration
└── package.json                   # crypto module (built-in Node.js)

docs/
├── PASSWORD_RESET_GUIDE.md       # This file
└── OTP_IMPLEMENTATION_GUIDE.md   # Related OTP documentation
```

---

## Next Steps

1. ✅ **Backend Complete** - All endpoints implemented
2. ⏳ **Test with Postman** - Verify all flows work
3. ⏳ **Create Frontend Pages** - Build UI components
4. ⏳ **Integrate Email Service** - Ensure emails deliver properly
5. ⏳ **Add Rate Limiting** - Protect against abuse
6. ⏳ **Security Audit** - Review implementation
7. ⏳ **Production Testing** - Test in production environment

---

**Last Updated:** January 2024  
**Version:** 1.0.0  
**Status:** ✅ Backend Implementation Complete
