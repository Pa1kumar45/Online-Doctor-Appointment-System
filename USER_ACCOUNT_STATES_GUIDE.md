# User Account States & Rejection Blocking - Implementation Summary

**Date:** October 11, 2025

---

## 1. Account States in Health-Connect

### **Active**

- User can login and use all features.
- Field: `isActive: true`
- Applies to: Doctors, Patients, Admins

### **Inactive / Suspended**

- User cannot login; all actions blocked.
- Field: `isActive: false`
- Set by admin action (suspend).
- Appointments are cancelled (if implemented).
- Profile hidden from search.
- Data is preserved.
- Code: See `backend/src/controllers/adminController.js` (toggleUserStatus), `backend/src/middleware/auth.js` (protect middleware)

### **Verification States**

- `verificationStatus: 'pending' | 'verified' | 'rejected' | 'under_review'`
- Applies mainly to doctors.
- Only 'verified' doctors get full access.
- Code: See `backend/src/controllers/adminController.js` (verifyUser)

### **Rejected**

- User's verification is rejected by admin.
- Field: `verificationStatus: 'rejected'`, `rejectionReason` (string)
- **Now blocks login** (see below).
- Code: See `backend/src/models/Doctor.js`, `backend/src/models/Patient.js`, `backend/src/middleware/auth.js`

---

## 2. Rejection Blocking Implementation

### **Backend**

- **Auth Middleware:**
  - File: `backend/src/middleware/auth.js`
  - Checks `isActive` and `verificationStatus`.
  - If `verificationStatus === 'rejected'`, blocks login and returns 403 with reason.
- **Models:**
  - Files: `backend/src/models/Doctor.js`, `backend/src/models/Patient.js`
  - Added `rejectionReason` and `suspensionReason` fields.
- **Admin Controller:**
  - File: `backend/src/controllers/adminController.js`
  - `verifyUser` saves rejection reason and sets `isActive: false` on rejection.
  - `toggleUserStatus` saves suspension reason and cancels appointments (if implemented).

### **Frontend**

- **Blocked Account Modal:**
  - File: `frontend/src/components/AccountBlockedModal.tsx`
  - Shows reason for rejection or suspension on login attempt.
- **App Context:**
  - File: `frontend/src/context/AppContext.tsx`
  - Handles blocked account state and triggers modal.
- **Login Page:**
  - File: `frontend/src/pages/Login.tsx`
  - Displays modal if login is blocked due to rejection or suspension.

---

## 3. User Experience

- **Suspended or rejected users cannot login.**
- **Popup modal** shows admin's reason for rejection/suspension.
- **Support contact info** is provided in modal.
- **Reactivation** restores full access (admin action).
- **All admin actions are logged.**

---

## 4. Admin Actions Reference

| Action   | Effect on User       | Code Reference                                     |
| -------- | -------------------- | -------------------------------------------------- |
| Verify   | Sets verified status | `adminController.js` (verifyUser)                  |
| Reject   | Blocks login, reason | `adminController.js` (verifyUser), `auth.js`       |
| Suspend  | Blocks login, reason | `adminController.js` (toggleUserStatus), `auth.js` |
| Activate | Restores access      | `adminController.js` (toggleUserStatus)            |

---

## 5. Summary Table

| State     | Can Login? | Can Book? | Profile Visible? | Code Reference                  |
| --------- | ---------- | --------- | ---------------- | ------------------------------- |
| Active    | Yes        | Yes       | Yes              | `auth.js`, `adminController.js` |
| Suspended | No         | No        | No               | `auth.js`, `adminController.js` |
| Rejected  | No         | No        | No               | `auth.js`, `adminController.js` |
| Pending   | Yes\*      | Limited   | Limited          | `auth.js`, `adminController.js` |

\*Pending users may have limited access until verified.

---

**For details, see:**

- Backend: `backend/src/middleware/auth.js`, `backend/src/controllers/adminController.js`, `backend/src/models/Doctor.js`, `backend/src/models/Patient.js`
- Frontend: `frontend/src/components/AccountBlockedModal.tsx`, `frontend/src/context/AppContext.tsx`, `frontend/src/pages/Login.tsx`

---

**Status:** All account state logic and rejection blocking are now implemented and documented.
