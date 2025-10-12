# 🔐 How to Access and Use the Admin Page

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Starting the Application](#starting-the-application)
3. [Admin Login](#admin-login)
4. [Accessing Admin Dashboard](#accessing-admin-dashboard)
5. [Admin Features](#admin-features)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

✅ **Backend server must be running**
✅ **Frontend development server must be running**
✅ **Admin account created** (already done - see credentials below)

---

## Starting the Application
## Admin Login

### Method 1: Direct Admin Login (Recommended)

**Note:** Currently, there's a dedicated admin login endpoint, but the frontend Login page uses the regular user login. You have two options:

#### Option A: Login via API First (Create Admin Session)
1. **Open a REST client** (Postman, Thunder Client, or browser console)
2. **Send Login Request:**
   - **Method:** POST
   - **URL:** `http://localhost:5000/api/auth/admin/login`
   - **Headers:** `Content-Type: application/json`
   - **Body:**
   ```json
   {
     "email": "admin@healthconnect.com",
     "password": "Admin@123456"
   }
   ```
3. **Expected Response:**
   ```json
   {
     "success": true,
     "user": {
       "_id": "...",
       "name": "Super Admin",
       "email": "admin@healthconnect.com",
       "role": "super_admin",
       "permissions": [...]
     }
   }
   ```

#### Option B: Using Browser Console (Easier for Testing)

1. **Open your browser** and go to `http://localhost:5173`

2. **Open Developer Tools** (Press F12)

3. **Go to Console tab**

4. **Paste and run this code:**

```javascript
fetch("http://localhost:5000/api/auth/admin/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include",
  body: JSON.stringify({
    email: "admin@healthconnect.com",
    password: "Admin@123456",
  }),
})
  .then((res) => res.json())
  .then((data) => {
    console.log("Login Success:", data);
    if (data.success) {
      // Store user in localStorage
      localStorage.setItem("user", JSON.stringify(data.user));
      alert("Admin logged in! Refresh the page.");
      window.location.href = "/admin";
    }
  })
  .catch((err) => console.error("Login Error:", err));
```

5. **Refresh the page** after seeing "Login Success"

---

## Accessing Admin Dashboard

### Once Logged In:

1. **Navigate to Admin Page:**

   - Go to: `http://localhost:5173/admin`
   - Or click "Admin Dashboard" in the navigation (if available)

2. **You should see the Admin Dashboard with:**
   - User statistics
   - User management table
   - Admin action logs
   - System analytics

---

## Admin Features

### 📊 Dashboard Overview

The admin dashboard provides:

- **Total Users Count** - Total doctors and patients
- **Pending Verifications** - Users awaiting verification
- **Suspended Accounts** - Inactive users
- **Today's Appointments** - Current day bookings
- **Recent Activity** - Last 30 days registrations

---

### 👥 User Management

#### View All Users

- **Filter by:**
  - Role (Doctor/Patient)
  - Status (Active/Suspended)
  - Verification Status (Pending/Verified/Rejected)
  - Search by name, email, or phone

#### User Actions:

1. **Verify Users:**

   - Status: Pending → Verified/Rejected
   - Add verification reason
   - Email notification sent (if configured)

2. **Suspend/Activate Users:**

   - Toggle user account status
   - Add suspension reason
   - Auto-cancel future appointments for suspended users

3. **Update User Role:**
   - Change user permissions (Super Admin only)
   - Role migration tracking

---

### 📝 Admin Action Logs

View comprehensive audit trail:

- **Action Type:** user_verification, user_suspension, user_activation, role_change
- **Target User:** Who was affected
- **Previous/New Data:** What changed
- **Timestamp:** When it happened
- **IP Address:** Where it came from
- **Admin:** Who performed the action

---

### 🔍 Available API Endpoints

All endpoints require admin authentication (cookie-based):

```
GET  /api/admin/dashboard/stats       - Dashboard statistics
GET  /api/admin/users                 - List all users (with filters)
PUT  /api/admin/users/:id/verify      - Verify user account
PUT  /api/admin/users/:id/toggle-status - Suspend/activate user
PUT  /api/admin/users/:id/role        - Update user role (Super Admin)
GET  /api/admin/logs                  - Get admin action logs
```

---

## Troubleshooting

### ❌ Error: "Cannot access admin page"
**Solution:**

1. Check if you're logged in as admin
2. Verify localStorage has user data:
   ```javascript
   // In browser console
   console.log(localStorage.getItem("user"));
   ```
3. Make sure user.role is 'admin' or 'super_admin'
---

### ❌ Error: "Unauthorized" or Redirect to Login

**Solution:**

1. Admin session might have expired
2. Re-login using the browser console method above
3. Check if backend is running on port 5000
4. Verify cookies are enabled in browser

---

### ❌ Frontend shows blank page

**Solution:**

1. Check browser console for errors (F12)
2. Make sure both backend AND frontend are running
3. Clear browser cache and localStorage:
   ```javascript
   localStorage.clear();
   ```
4. Restart frontend server

---

### ❌ Cannot see admin navigation/menu

**Solution:**
The admin dashboard might not have a navigation link yet. Access directly via URL:

```
http://localhost:5173/admin
```

---

## 🔐 Admin Credentials

**DO NOT SHARE THESE CREDENTIALS IN PRODUCTION!**

```
📧 Email:    admin@healthconnect.com
🔐 Password: Admin@123456
👤 Role:     super_admin
```

**Permissions:**

- ✅ manage_users
- ✅ verify_users
- ✅ suspend_users
- ✅ view_analytics
- ✅ manage_admins
- ✅ system_settings

---

## 🚀 Quick Start (TL;DR)

# Browser Console (http://localhost:5173)
fetch('http://localhost:5000/api/auth/admin/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  credentials: 'include',
  body: JSON.stringify({
    email: 'admin@healthconnect.com',
    password: 'Admin@123456'
  })
}).then(res => res.json()).then(data => {
  localStorage.setItem('user', JSON.stringify(data.user));
  window.location.href = '/admin';
});
```

---

## 📸 What to Expect

### Admin Dashboard Should Show:

1. **Stats Cards** at top:

   - Total Doctors
   - Total Patients
   - Pending Verifications
   - Suspended Accounts

2. **User Management Table:**

   - List of all users
   - Filter controls
   - Action buttons (Verify, Suspend, etc.)

3. **Admin Logs:**
   - Recent admin actions
   - Pagination controls

---

## 🔒 Security Notes

1. **Never commit admin credentials** to version control
2. **Change default password** in production
3. **Use HTTPS** in production
4. **Enable rate limiting** on login endpoints
5. **Add two-factor authentication** for production use

---

## 📞 Need Help?

If you encounter issues:

1. Check backend terminal for errors
2. Check frontend terminal for build errors
3. Check browser console (F12) for frontend errors
4. Verify MongoDB connection is active
5. Ensure admin user exists in database

---

**Last Updated:** October 10, 2025  
**Version:** 1.0  
**Status:** ✅ Admin System Fully Functional
