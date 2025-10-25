# Password Reset Lifetime Limit Implementation ✅

## Overview
Users can now only reset their password **ONE TIME** in their entire account lifetime using the "Forgot Password" feature. After using password reset once, they cannot use it again.

## Implementation Details

### 1. Database Schema Changes

Added two new fields to all user models (Patient, Doctor, Admin):

#### New Fields
```javascript
passwordResetCount: {
  type: Number,
  default: 0 // Track number of times password has been reset via forgot password
},
passwordResetUsedAt: {
  type: Date // Timestamp when password reset was last used
}
```

**Modified Files:**
- ✅ `backend/src/models/Patient.js`
- ✅ `backend/src/models/Doctor.js`
- ✅ `backend/src/models/Admin.js`

### 2. Forgot Password Check (Step 1)

**File:** `backend/src/controllers/authController.js`

**Function:** `forgotPassword()`

**New Logic:**
```javascript
// Check if user has already used password reset (LIFETIME LIMIT)
if (user.passwordResetCount && user.passwordResetCount >= 1) {
  return res.status(403).json({
    success: false,
    message: 'Your 1 attempt for password reset has been completed. You cannot reset your password again. Please contact support if you need assistance.',
    resetLimitReached: true,
    resetCount: user.passwordResetCount,
    lastResetDate: user.passwordResetUsedAt
  });
}
```

**Behavior:**
- ✅ Checks `passwordResetCount` before sending OTP
- ✅ If count >= 1, blocks the request
- ✅ Returns 403 Forbidden status
- ✅ Provides clear error message
- ✅ Logs the failed attempt with reason
- ✅ Includes reset count and last reset date in response

### 3. Reset Password Counter Increment (Step 2)

**File:** `backend/src/controllers/authController.js`

**Function:** `resetPassword()`

**New Logic:**
```javascript
// Increment password reset counter (LIFETIME TRACKING)
user.passwordResetCount = (user.passwordResetCount || 0) + 1;
user.passwordResetUsedAt = new Date();
```

**Behavior:**
- ✅ Increments counter when password is successfully reset
- ✅ Records timestamp of the reset
- ✅ Persisted to database
- ✅ Cannot be bypassed

### 4. Single-Use OTP Enforcement

**Existing Implementation (maintained):**
```javascript
// Find OTP that hasn't been used
const otpDoc = await OTP.findOne({
  email,
  otp,
  purpose: 'password-reset',
  verified: false  // Only unused OTPs
});

// Mark OTP as verified before password change
await otpDoc.markAsVerified();
```

## User Flow

### First Password Reset (Allowed) ✅

1. User clicks "Forgot Password"
2. Enters email and role
3. **Backend checks:** `passwordResetCount === 0` ✅ (Allowed)
4. OTP sent to email
5. User enters OTP and new password
6. Password reset successful
7. **Counter incremented:** `passwordResetCount = 1`
8. Timestamp recorded: `passwordResetUsedAt = NOW`

### Second Password Reset Attempt (Blocked) ❌

1. User clicks "Forgot Password" again
2. Enters email and role
3. **Backend checks:** `passwordResetCount === 1` ❌ (Blocked!)
4. **Response:**
   ```json
   {
     "success": false,
     "message": "Your 1 attempt for password reset has been completed. You cannot reset your password again. Please contact support if you need assistance.",
     "resetLimitReached": true,
     "resetCount": 1,
     "lastResetDate": "2025-10-25T12:34:56.789Z"
   }
   ```
5. No OTP sent
6. User must contact support

## API Response Format

### Forgot Password - Success (First Time)
```json
{
  "success": true,
  "message": "Password reset OTP sent to your email. Please check your inbox.",
  "email": "user@example.com"
}
```

### Forgot Password - Blocked (Limit Reached)
**Status Code:** 403 Forbidden
```json
{
  "success": false,
  "message": "Your 1 attempt for password reset has been completed. You cannot reset your password again. Please contact support if you need assistance.",
  "resetLimitReached": true,
  "resetCount": 1,
  "lastResetDate": "2025-10-25T12:34:56.789Z"
}
```

## Security Features

### 1. Lifetime Limit Enforcement
- ✅ Each user can only reset password **once** via forgot password
- ✅ Counter is permanent (cannot be reset without database access)
- ✅ Applies to all user types (Patient, Doctor, Admin)

### 2. OTP Single-Use
- ✅ Each OTP can only be used once
- ✅ OTP marked as verified before password change
- ✅ Prevents reuse even if multiple requests made

### 3. Audit Trail
- ✅ All attempts logged (success and failure)
- ✅ Tracks reset count and timestamps
- ✅ Records reason for failures
- ✅ Includes metadata (role, IP, etc.)

### 4. Change Password (Alternative)
- ✅ Users can still change password from their profile
- ✅ Requires current password verification
- ✅ No limit on profile password changes
- ✅ Does NOT increment `passwordResetCount`

## Important Notes

### Password Reset Counter
- **Only increments for "Forgot Password" flow**
- **NOT incremented for profile password changes**
- User can change password unlimited times from profile (with current password)

### Counter vs Profile Change
| Action | Requires Current Password | Increments Counter | Limit |
|--------|---------------------------|-------------------|-------|
| Forgot Password | ❌ No | ✅ Yes | 1 time lifetime |
| Profile Change Password | ✅ Yes | ❌ No | Unlimited |

### Resetting the Counter
The counter can only be reset by:
1. Database administrator directly modifying the document
2. Custom admin tool (not implemented)
3. Support team with database access

To reset manually:
```javascript
// MongoDB command
db.patients.updateOne(
  { email: "user@example.com" },
  { 
    $set: { 
      passwordResetCount: 0,
      passwordResetUsedAt: null
    }
  }
);
```

## Testing Scenarios

### Test Case 1: First Password Reset
**Steps:**
1. User requests password reset (forgot password)
2. Receives OTP
3. Resets password successfully

**Expected:**
- ✅ OTP sent
- ✅ Password changed
- ✅ `passwordResetCount = 1`
- ✅ `passwordResetUsedAt` recorded

### Test Case 2: Second Password Reset Attempt
**Steps:**
1. Same user requests password reset again
2. Tries to get OTP

**Expected:**
- ❌ Request blocked
- ❌ No OTP sent
- ❌ Error: "Your 1 attempt for password reset has been completed"
- ❌ Status: 403 Forbidden

### Test Case 3: Profile Password Change (After Reset)
**Steps:**
1. User already used forgot password once
2. Goes to profile page
3. Changes password from profile (with current password)

**Expected:**
- ✅ Password change successful
- ✅ `passwordResetCount` stays at 1 (not incremented)
- ✅ Can do this unlimited times

### Test Case 4: Multiple OTP Requests Before Reset
**Steps:**
1. User requests password reset OTP
2. Without using OTP, requests again
3. Uses the second OTP

**Expected:**
- ✅ First OTP deleted
- ✅ Second OTP sent
- ✅ Can complete reset with second OTP
- ✅ Counter increments only once

## Logging & Monitoring

### Failed Attempt Log
```javascript
{
  action: 'password_reset_request',
  email: 'user@example.com',
  success: false,
  failureReason: 'Password reset limit exceeded (lifetime limit: 1)',
  userId: 'user_id',
  userType: 'Patient',
  metadata: {
    role: 'patient',
    resetCount: 1,
    lastResetAt: '2025-10-25T12:34:56.789Z'
  }
}
```

### Successful Reset Log
```javascript
{
  action: 'password_reset_success',
  email: 'user@example.com',
  success: true,
  userId: 'user_id',
  userType: 'Patient',
  metadata: {
    role: 'patient'
  }
}
```

## Frontend Considerations

The frontend should handle the 403 response gracefully:

```typescript
// Example error handling
try {
  await authService.forgotPassword({ email, role });
} catch (error) {
  if (error.response?.status === 403 && error.response?.data?.resetLimitReached) {
    // Show special message for reset limit
    setError('You have already used your password reset attempt. Please contact support for assistance.');
  } else {
    setError(error.message);
  }
}
```

## Benefits

1. **Security**: Prevents abuse of password reset feature
2. **Account Protection**: Limits unauthorized reset attempts
3. **Clear Communication**: User knows they've used their one chance
4. **Alternative Available**: Users can still change password from profile
5. **Audit Trail**: Complete tracking of all reset attempts

## Migration Notes

For existing users in the database who don't have these fields:
- `passwordResetCount` defaults to 0 (they can still use password reset once)
- `passwordResetUsedAt` is null until first reset
- No migration script needed (fields auto-initialize)

---

**Implementation Date:** October 25, 2025  
**Status:** ✅ Production Ready  
**Feature:** Lifetime Password Reset Limit (1 time only)
