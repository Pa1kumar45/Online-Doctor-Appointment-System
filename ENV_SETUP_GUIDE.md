# Environment Setup Guide

## ✅ `.env` File Created!

I've created the `.env` file with default configuration. Here's what you need to do:

---

## 🗄️ MongoDB Setup

You have **two options** for MongoDB:

### Option 1: Local MongoDB (Recommended for Development)

**Check if MongoDB is installed:**
```powershell
mongod --version
```

**If not installed, download from:**
- https://www.mongodb.com/try/download/community

**Start MongoDB:**
```powershell
# Start MongoDB service
net start MongoDB

# Or run mongod directly
mongod
```

**Your connection string** (already in `.env`):
```
MONGODB_URI=mongodb://localhost:27017/healthconnect
```

### Option 2: MongoDB Atlas (Cloud - Free Tier Available)

1. **Create free account:** https://www.mongodb.com/cloud/atlas/register
2. **Create a cluster** (takes 3-5 minutes)
3. **Get connection string:**
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

4. **Update `.env` file:**
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/healthconnect
```

---

## 🔑 JWT Secret

**⚠️ IMPORTANT:** Change the JWT secret in `.env`:

```bash
# Generate a strong secret (PowerShell)
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

Then replace in `.env`:
```bash
JWT_SECRET=your-generated-secret-here
```

---

## 🌐 Frontend URL

If your frontend runs on a different port, update:
```bash
FRONTEND_URL=http://localhost:5173  # Vite default
# or
FRONTEND_URL=http://localhost:3000  # React default
```

---

## 📧 Email Configuration (For Future OTP/Password Reset)

When you implement OTP and password reset, you'll need:

### Gmail App Password Setup:
1. Enable 2-Factor Authentication on your Gmail
2. Go to: https://myaccount.google.com/apppasswords
3. Generate an "App Password"
4. Update `.env`:

```bash
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-digit-app-password
EMAIL_FROM=noreply@healthconnect.com
```

---

## 🚀 Quick Start

1. **Ensure MongoDB is running** (Option 1 or 2 above)

2. **Verify `.env` file exists:**
```powershell
ls backend/.env
```

3. **Restart the backend server:**
```powershell
cd backend
npm start
```

4. **You should see:**
```
Server is running on port 5000
MongoDB connected successfully
```

---

## ✅ Test MongoDB Connection

**Quick test:**
```powershell
# In backend directory
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('✅ MongoDB Connected')).catch(err => console.log('❌ Error:', err.message))"
```

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'dotenv'"
```powershell
npm install dotenv
```

### Error: "ECONNREFUSED mongodb://localhost:27017"
- MongoDB is not running
- Start MongoDB service (see Option 1 above)

### Error: "MongoNetworkError: failed to connect"
- Check MongoDB Atlas connection string
- Ensure IP is whitelisted (0.0.0.0/0 for development)
- Verify username/password

### Error: "Invalid JWT secret"
- Change JWT_SECRET in `.env` to a longer string (min 32 chars)

---

## 📁 Files Created

| File | Purpose |
|------|---------|
| `backend/.env` | **Your actual environment variables** (DO NOT commit to Git) |
| `backend/.env.example` | Template for other developers |
| `backend/.env.test` | Test environment (already existed) |

---

## 🔒 Security Note

**`.env` is already in `.gitignore`** - Your secrets won't be committed to Git! ✅

---

## ⚡ Next Steps After Setup

Once MongoDB is connected, you can:
1. ✅ Test validation (register/login endpoints)
2. ⏭️ Implement OTP system (Phase 1)
3. ⏭️ Set up email service
4. ⏭️ Build password reset flow

---

Need help with MongoDB setup? Let me know! 🚀
