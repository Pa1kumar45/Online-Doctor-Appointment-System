# Multi-Device Session Management - Implementation Complete

## 🎯 Overview

A comprehensive multi-device session management system has been successfully implemented for the Online Doctor Appointment System. This system tracks all user sessions across devices, allows users to view and manage their active sessions, and provides automatic cleanup of expired sessions.

---

## ✅ Implementation Status: **COMPLETE**

### Components Implemented

#### 1. **Session Model** (`backend/src/models/Session.js`)
- ✅ Complete schema with userId, userType, token, deviceInfo, ipAddress, lastActivity, expiresAt
- ✅ Compound indexes for efficient querying
- ✅ Static methods for session management
- ✅ Instance methods for session validation

#### 2. **Device Detection Utilities** (`backend/src/lib/utils.js`)
- ✅ `parseUserAgent()` - Extracts browser, OS, and device type
- ✅ Updated `generateToken()` - Creates session records automatically
- ✅ Session tracking integrated into token generation

#### 3. **Session Controller** (`backend/src/controllers/sessionController.js`)
- ✅ Get all active sessions
- ✅ Get current session info
- ✅ Revoke specific session
- ✅ Revoke all sessions except current

#### 4. **Session Routes** (`backend/src/routes/sessions.js`)
- ✅ All CRUD endpoints for session management
- ✅ Protected with authentication middleware

#### 5. **Session Cleanup** (`backend/src/lib/sessionCleanup.js`)
- ✅ Automatic cleanup of expired sessions (hourly)
- ✅ Daily deletion of old inactive sessions
- ✅ Started automatically with server

#### 6. **Middleware Updates** (`backend/src/middleware/auth.js`)
- ✅ Session validation in auth middleware
- ✅ Automatic session activity tracking
- ✅ Session expiry detection

#### 7. **Logout Enhancement** (`backend/src/controllers/authController.js`)
- ✅ Revokes session on logout
- ✅ Clears session from database

---

## 📊 Database Schema

### Session Collection

```javascript
{
  _id: ObjectId,                     // Unique session ID
  userId: ObjectId,                  // References Doctor/Patient/Admin
  userType: String,                  // 'Doctor', 'Patient', 'Admin'
  token: String,                     // JWT token (unique)
  deviceInfo: {
    browser: String,                 // e.g., 'Chrome', 'Firefox'
    os: String,                      // e.g., 'Windows 10', 'macOS', 'Android'
    device: String                   // e.g., 'Desktop', 'Mobile', 'Tablet'
  },
  ipAddress: String,                 // Client IP address
  lastActivity: Date,                // Last request timestamp
  expiresAt: Date,                   // Session expiration date
  isActive: Boolean,                 // Session status
  createdAt: Date,                   // Auto-generated
  updatedAt: Date                    // Auto-generated
}
```

### Indexes

1. `{ userId: 1 }` - User lookup
2. `{ token: 1 }` - Token validation (unique)
3. `{ lastActivity: 1 }` - Activity tracking
4. `{ expiresAt: 1 }` - Expiry cleanup
5. `{ isActive: 1 }` - Status filtering
6. `{ userId: 1, isActive: 1, expiresAt: 1 }` - Compound for user sessions
7. `{ expiresAt: 1, isActive: 1 }` - Compound for cleanup

---

## 🔌 API Endpoints

### Base URL: `/api/auth/sessions`

All endpoints require **authentication** (valid JWT token).

---

### 1. Get All Active Sessions

**GET** `/api/auth/sessions`

Get all active sessions for the authenticated user.

#### Example Request

```bash
GET /api/auth/sessions
Cookie: token=<your_jwt_token>
```

#### Response

```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ec49f1b2c8b1f8e4e1a1",
      "deviceInfo": {
        "browser": "Chrome",
        "os": "Windows 10/11",
        "device": "Desktop"
      },
      "ipAddress": "192.168.1.100",
      "lastActivity": "2025-10-22T15:30:00.000Z",
      "createdAt": "2025-10-22T10:00:00.000Z",
      "expiresAt": "2025-10-29T10:00:00.000Z",
      "isCurrent": true,
      "duration": "5 hours ago"
    },
    {
      "_id": "60d5ec49f1b2c8b1f8e4e1a2",
      "deviceInfo": {
        "browser": "Safari",
        "os": "iOS",
        "device": "Mobile"
      },
      "ipAddress": "192.168.1.105",
      "lastActivity": "2025-10-21T20:15:00.000Z",
      "createdAt": "2025-10-21T18:00:00.000Z",
      "expiresAt": "2025-10-28T18:00:00.000Z",
      "isCurrent": false,
      "duration": "1 day ago"
    }
  ],
  "count": 2
}
```

---

### 2. Get Current Session

**GET** `/api/auth/sessions/current`

Get information about the current session.

#### Example Request

```bash
GET /api/auth/sessions/current
Cookie: token=<your_jwt_token>
```

#### Response

```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49f1b2c8b1f8e4e1a1",
    "deviceInfo": {
      "browser": "Chrome",
      "os": "Windows 10/11",
      "device": "Desktop"
    },
    "ipAddress": "192.168.1.100",
    "lastActivity": "2025-10-22T15:30:00.000Z",
    "createdAt": "2025-10-22T10:00:00.000Z",
    "expiresAt": "2025-10-29T10:00:00.000Z",
    "duration": "5 hours ago"
  }
}
```

---

### 3. Revoke Specific Session

**DELETE** `/api/auth/sessions/:sessionId`

Revoke a specific session (logout from that device).

Cannot revoke the current session - use logout endpoint instead.

#### URL Parameters

- `sessionId` - Session ID to revoke

#### Example Request

```bash
DELETE /api/auth/sessions/60d5ec49f1b2c8b1f8e4e1a2
Cookie: token=<your_jwt_token>
```

#### Response

```json
{
  "success": true,
  "message": "Session revoked successfully"
}
```

#### Error Responses

**Cannot revoke current session:**
```json
{
  "success": false,
  "message": "Cannot revoke current session. Please use logout instead."
}
```

**Session not found:**
```json
{
  "success": false,
  "message": "Session not found or already revoked"
}
```

---

### 4. Revoke All Other Sessions

**DELETE** `/api/auth/sessions/all`

Revoke all sessions except the current one (logout from all other devices).

#### Example Request

```bash
DELETE /api/auth/sessions/all
Cookie: token=<your_jwt_token>
```

#### Response

```json
{
  "success": true,
  "message": "Successfully revoked 3 session(s)",
  "revokedCount": 3
}
```

---

## 🔄 Session Lifecycle

### 1. Session Creation

Sessions are automatically created when users login:

```javascript
// During login (after OTP verification)
POST /api/auth/verify-otp
{
  "email": "user@example.com",
  "otp": "123456",
  "role": "patient",
  "purpose": "login"
}

// Session is created automatically with:
// - JWT token
// - Device info (browser, OS, device type)
// - IP address
// - Expiration date (7 days)
```

### 2. Session Validation

Every authenticated request validates the session:

```javascript
// Middleware checks:
// 1. JWT token is valid
// 2. Session exists in database
// 3. Session is active
// 4. Session hasn't expired
// 5. Updates lastActivity timestamp
```

### 3. Session Activity Tracking

Session activity is automatically updated:

```javascript
// On every authenticated request:
// - lastActivity timestamp is updated
// - Allows users to see recent activity
// - Helps identify inactive sessions
```

### 4. Session Revocation

Sessions can be revoked in multiple ways:

```javascript
// 1. User logs out (current session)
POST /api/auth/logout

// 2. User revokes specific session (remote device)
DELETE /api/auth/sessions/:sessionId

// 3. User revokes all other sessions
DELETE /api/auth/sessions/all

// 4. Automatic expiration (7 days)
// Handled by cleanup scheduler
```

### 5. Session Cleanup

Automatic cleanup runs periodically:

```javascript
// Hourly cleanup (marks expired as inactive)
// Runs every 60 minutes

// Daily deletion (removes old inactive sessions)
// Runs at midnight
// Deletes sessions inactive for 30+ days
```

---

## 🛡️ Security Features

### 1. Token-Session Binding

- Each JWT token is bound to a specific session
- Token can't be used after session is revoked
- Prevents token theft across devices

### 2. Remote Session Control

- Users can see all active sessions
- Can revoke suspicious sessions remotely
- "Logout everywhere" functionality

### 3. Device Fingerprinting

- Browser and OS detection
- Device type identification
- Helps users identify their devices

### 4. IP Address Tracking

- Logs IP address for each session
- Helps detect unusual access patterns
- Useful for security audits

### 5. Activity Monitoring

- Last activity timestamp
- Session duration tracking
- Identify inactive sessions

### 6. Automatic Expiration

- Sessions expire after 7 days
- Can't be used after expiration
- Automatic cleanup prevents database bloat

---

## 📈 Performance Optimizations

### Database Indexes

Seven indexes ensure fast queries:
- User session lookups: `O(log n)`
- Token validation: `O(log n)` with unique constraint
- Expiry cleanup: Efficient with compound index

### Activity Updates

- Non-blocking async updates
- Don't slow down request processing
- Error handling prevents cascade failures

### Cleanup Scheduler

- Runs hourly for expired sessions
- Daily cleanup for old records
- Prevents database size growth

---

## 🧪 Testing Guide

### Test Session Creation

1. **Login and check session created:**
   ```bash
   # Login
   POST /api/auth/login
   {
     "email": "user@example.com",
     "password": "password",
     "role": "patient"
   }
   
   # Verify OTP
   POST /api/auth/verify-otp
   {
     "email": "user@example.com",
     "otp": "123456",
     "role": "patient",
     "purpose": "login"
   }
   
   # Check sessions
   GET /api/auth/sessions
   ```

2. **Expected Result:**
   - Session created with device info
   - isCurrent: true for this session

### Test Multiple Device Sessions

1. **Login from different devices:**
   - Login from Chrome (Desktop)
   - Login from Safari (Mobile)
   - Login from Firefox (Tablet)

2. **View all sessions:**
   ```bash
   GET /api/auth/sessions
   ```

3. **Expected Result:**
   - All 3 sessions listed
   - Different device info for each
   - Different IP addresses

### Test Session Revocation

1. **Revoke specific session:**
   ```bash
   DELETE /api/auth/sessions/<session_id>
   ```

2. **Try to use revoked session:**
   - Use the revoked token
   - Should get 401 Unauthorized

3. **Expected Result:**
   - Session successfully revoked
   - Old token no longer works

### Test Logout

1. **Logout:**
   ```bash
   POST /api/auth/logout
   ```

2. **Check session:**
   ```bash
   GET /api/auth/sessions
   ```

3. **Expected Result:**
   - 401 Unauthorized (no valid session)

### Test Automatic Cleanup

1. **Wait for cleanup cycle (or trigger manually):**
   ```javascript
   // In backend console
   const Session = require('./models/Session');
   Session.cleanupExpired();
   ```

2. **Check database:**
   - Expired sessions marked as inactive

---

## 📝 Example Use Cases

### Use Case 1: Security Alert - Unknown Device

**Scenario:** User receives notification of login from unknown location

**Action:**
```bash
# 1. Check all active sessions
GET /api/auth/sessions

# 2. Identify suspicious session
# Look for unfamiliar IP or device

# 3. Revoke suspicious session
DELETE /api/auth/sessions/<suspicious_session_id>

# 4. Change password
PUT /api/auth/change-password
{
  "currentPassword": "oldpass",
  "newPassword": "newpass"
}

# 5. Logout from all other devices
DELETE /api/auth/sessions/all
```

### Use Case 2: Lost Device

**Scenario:** User lost their phone/laptop

**Action:**
```bash
# 1. Login from different device

# 2. View all sessions
GET /api/auth/sessions

# 3. Logout from all other devices (including lost device)
DELETE /api/auth/sessions/all
```

### Use Case 3: Session Management

**Scenario:** User wants to manage their active sessions

**Action:**
```bash
# 1. View all active sessions
GET /api/auth/sessions

# Response shows:
# - Desktop (current) - Active 5 minutes ago
# - Mobile - Active 2 days ago
# - Tablet - Active 1 week ago

# 2. Revoke old tablet session
DELETE /api/auth/sessions/<tablet_session_id>
```

---

## 🔧 Troubleshooting

### Sessions Not Being Created

**Problem:** Login works but no session in database

**Solutions:**
1. Check if `req` parameter is passed to `generateToken()`:
   ```javascript
   await generateToken(userId, role, res, req); // ✓ Correct
   generateToken(userId, role, res); // ✗ Missing req
   ```

2. Check console for session creation logs:
   ```
   ✓ Session created for Patient <userId>
   ```

3. Verify Session model is imported in utils.js

### Session Validation Failing

**Problem:** Getting "Session expired or invalid" error

**Solutions:**
1. Check if session exists in database:
   ```javascript
   db.sessions.findOne({ token: "<your_token>" })
   ```

2. Verify session hasn't expired:
   ```javascript
   { expiresAt: { $gt: new Date() } }
   ```

3. Check if session is active:
   ```javascript
   { isActive: true }
   ```

### Cleanup Not Running

**Problem:** Expired sessions not being cleaned up

**Solutions:**
1. Check if cleanup scheduler started:
   ```
   ⏰ Session cleanup scheduled every 60 minutes
   ```

2. Manually trigger cleanup:
   ```javascript
   const Session = require('./models/Session');
   await Session.cleanupExpired();
   ```

3. Check for errors in server logs

### Can't Revoke Session

**Problem:** Session revocation returns 404

**Solutions:**
1. Verify session ID is correct
2. Check if session belongs to current user
3. Ensure session is still active
4. Can't revoke current session (use logout instead)

---

## 🚀 Future Enhancements

### Potential Additions

1. **Session Notifications**
   - Email on new device login
   - Push notifications for suspicious activity
   - Weekly session summary

2. **Advanced Device Tracking**
   - More detailed device fingerprinting
   - Location tracking (with consent)
   - Browser version tracking

3. **Session Limits**
   - Configurable max sessions per user
   - Auto-revoke oldest session when limit reached
   - Role-based session limits

4. **Session History**
   - Keep history of past sessions
   - Show login history
   - Audit trail for security

5. **Suspicious Activity Detection**
   - Multiple failed login attempts
   - Rapid location changes
   - Unusual access patterns
   - Automatic session revocation

---

## ✅ Implementation Checklist

- [x] Create Session model with schema
- [x] Add device detection utilities
- [x] Update generateToken to create sessions
- [x] Create session controller with CRUD operations
- [x] Create session routes
- [x] Add session cleanup scheduler
- [x] Update auth middleware for session validation
- [x] Update logout to revoke sessions
- [x] Add comprehensive documentation
- [x] Test session creation
- [x] Test session listing
- [x] Test session revocation
- [x] Test automatic cleanup

---

## 📚 Related Documentation

- [Authentication System](./USER_AUTHENTICATION_IMPLEMENTATION_STATUS.md)
- [Auth Logging System](./AUTH_LOGGING_IMPLEMENTATION.md)
- [Admin System](./ADMIN_SYSTEM_COMPLETE.md)
- [Project README](./PROJECT_README.md)

---

**Last Updated:** October 22, 2025  
**Status:** ✅ **COMPLETE AND READY FOR USE**
