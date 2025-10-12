# Admin Functions Reference

**Health-Connect Admin Dashboard**  
**Last Updated:** October 10, 2025  
**Admin:** Adminppk@gmail.com / p12142005

---

## Core Functions (Implemented)

### 1. Authentication & Access Control
**File:** `backend/src/controllers/authController.js`  
**Function:** `adminLogin()` (Lines ~340-380)

**Features:**
- Email/password validation with bcrypt (12 salt rounds)
- JWT token (7-day expiration, HTTP-only cookie)
- Role-based access (admin/super_admin)
- Last login tracking

**API:** `POST /api/auth/admin/login`  
**Request:** `{ email, password }`  
**Response:** `{ success, user: {name, email, role, permissions} }`

---

### 2. Dashboard Statistics
**File:** `backend/src/controllers/adminController.js`  
**Function:** `getDashboardStats()` (Lines ~40-90)

**Metrics:**
- Total/Active users, Pending verifications
- Doctor/Patient counts, Verified doctors
- Recent appointments, System activity

**API:** `GET /api/admin/dashboard/stats`

---

### 3. User Management
**File:** `backend/src/controllers/adminController.js`  
**Function:** `getAllUsers()` (Lines ~90-145)

**Filters:**
- User Type: All/Doctor/Patient
- Status: Active/Suspended
- Verification: Pending/Verified/Rejected
- Search: Name/Email/Phone
- Pagination: Page & limit

**API:** `GET /api/admin/users`  
**Query:** `?page=1&limit=10&userType=doctor&status=active&search=john`

---

### 4. Doctor Verification
**File:** `backend/src/controllers/adminController.js`  
**Function:** `verifyUser()` (Lines ~215-275)

**Actions:**
- Approve (verified)
- Reject (with reason)
- Mark under review

**API:** `POST /api/admin/users/:userId/verify`  
**Body:** `{ verificationStatus, rejectionReason, userType }`

---

### 5. User Status Control
**File:** `backend/src/controllers/adminController.js`  
**Function:** `toggleUserStatus()` (Lines ~290-350)

**Actions:**
- Suspend (requires reason)
- Activate

**Effects:** Login blocked, appointments cancelled (doctors), sessions invalidated

**API:** `POST /api/admin/users/:userId/toggle-status`  
**Body:** `{ action: 'suspend'|'activate', reason, userType }`

---

### 6. Role Management (Super Admin Only)
**File:** `backend/src/controllers/adminController.js`  
**Function:** `updateUserRole()` (Lines ~360-410)

**Roles:**
- super_admin: Full access
- admin: Standard access

**API:** `POST /api/admin/users/:userId/role`  
**Body:** `{ role, permissions[] }`

---

### 7. Activity Logging
**File:** `backend/src/controllers/adminController.js`  
**Function:** `getAdminLogs()` (Lines ~420-470)

**Logged:** Login/logout, verification, suspension, role changes, exports, config changes

**API:** `GET /api/admin/logs`  
**Query:** `?page=1&adminId=xxx&actionType=suspension&startDate=xxx`

---

## Architecture

### Backend
```
backend/src/
├── controllers/
│   ├── adminController.js (8 functions)
│   └── authController.js (adminLogin)
├── models/
│   ├── Admin.js (schema + comparePassword)
│   ├── Doctor.js
│   └── Patient.js
├── middleware/
│   └── auth.js (protectRoute, adminOnly)
└── routes/
    └── admin.js
```

### Frontend
```
frontend/src/
├── services/
│   ├── admin.service.ts (6 methods)
│   └── auth.service.ts (adminLogin)
├── pages/
│   └── AdminDashboard.tsx
└── components/
    └── UserActionModal.tsx
```

---

## API Endpoints Quick Reference

| Function | Method | Endpoint | Auth |
|----------|--------|----------|------|
| Admin Login | POST | `/api/auth/admin/login` | No |
| Dashboard Stats | GET | `/api/admin/dashboard/stats` | Admin |
| Get Users | GET | `/api/admin/users` | Admin |
| Verify User | POST | `/api/admin/users/:userId/verify` | Admin |
| Toggle Status | POST | `/api/admin/users/:userId/toggle-status` | Admin |
| Update Role | POST | `/api/admin/users/:userId/role` | Super Admin |
| Get Logs | GET | `/api/admin/logs` | Admin |

---

## Testing Checklist

**Authentication:** ✅ Login works, ✅ Invalid rejected, ✅ Token expires, ✅ Protected routes  
**User Management:** ✅ View all, ✅ Filter types, ✅ Search, ✅ Pagination  
**Verification:** ✅ Approve, ✅ Reject, ✅ Pending queue  
**Status Control:** ✅ Suspend, ✅ Activate, ✅ Login blocked  
**Role Management:** ✅ Change roles, ✅ Permissions work, ✅ Cannot self-downgrade  
**Logging:** ✅ Actions logged, ✅ Filterable, ✅ IP tracked

---

**Related:** `ADMIN_LOGIN_UPDATED.md`, `ADMIN_IMPLEMENTATION_GUIDE.md`
