# 🔐 Updated Admin Login Instructions

## ✅ Admin Credentials (Updated)

```
👤 Name:     Adminppk
📧 Email:    Adminppk@gmail.com
🔑 Password: p12142005
```

---

## 🚀 Login Script (Copy & Paste in Browser Console)

**Step 1:** Open your frontend in browser: `http://localhost:5173`

**Step 2:** Press **F12** to open Developer Tools

**Step 3:** Click **Console** tab

**Step 4:** Paste this code and press Enter:

```javascript
fetch("http://localhost:5000/api/auth/admin/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include",
  body: JSON.stringify({
    email: "Adminppk@gmail.com",
    password: "p12142005",
  }),
})
  .then((res) => res.json())
  .then((data) => {
    console.log("✅ Full Response:", data);
    if (data.success && data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
      alert(
        "✅ Welcome " + data.user.name + "! Redirecting to admin dashboard..."
      );
      window.location.href = "/admin";
    } else {
      console.error("❌ Login failed:", data);
      alert("❌ Login failed: " + (data.message || "Unknown error"));
    }
  })
  .catch((err) => {
    console.error("❌ Network Error:", err);
    alert("❌ Network error - Is backend running on port 5000?");
  });
```

---

## 🔧 What Was Fixed

1. ✅ **Added `select: false`** to password field in Admin model
2. ✅ **Fixed permissions field** - changed from `admin.permissions` to `admin.Permissions`
3. ✅ **Fixed response structure** - now returns both `user` and `data` fields
4. ✅ **Admin credentials updated** to your custom values

---

## ⚠️ Make Sure Backend is Running

Check if you see this in backend terminal:

```
Server is running on port 5000
Connected to MongoDB
```

If not, run:

```powershell
cd backend
npm run dev
```

---

## 🐛 If Still Getting Errors

1. **Check Backend Terminal** - Look for any error messages
2. **Check Browser Console** - Press F12 and see what error appears
3. **Verify Backend is Running** - Go to `http://localhost:5000/` - should show "Hello from the backend!"

---

## 📞 After Successful Login

You'll automatically be redirected to: `http://localhost:5173/admin`

You should see:

- 📊 Admin Dashboard
- 👥 User Management
- 📝 Admin Logs
- 📈 Statistics

---

**Ready to try? Run the login script above!** 🎉
