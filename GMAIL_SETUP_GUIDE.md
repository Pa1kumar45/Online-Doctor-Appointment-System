# 📧 Gmail Setup Guide for OTP Emails

## ⚡ Quick Setup (5 minutes)

To enable OTP emails, you need to configure Gmail with an App Password.

---

## 📋 Step-by-Step Instructions

### Step 1: Enable 2-Factor Authentication

1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** (left sidebar)
3. Under "How you sign in to Google", click **2-Step Verification**
4. Follow the prompts to enable 2FA (you'll need your phone)

### Step 2: Generate App Password

1. After enabling 2FA, go back to **Security**
2. Click **2-Step Verification**
3. Scroll down to **App passwords** (at the bottom)
4. Click **App passwords**
5. Select **App**: Choose "Mail"
6. Select **Device**: Choose "Other (Custom name)"
7. Enter name: `HealthConnect OTP`
8. Click **Generate**
9. **Copy the 16-character password** (you won't see it again!)

---

## 🔧 Update `.env` File

Open `backend/.env` and uncomment/update these lines:

```bash
# Email Service Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=HealthConnect <noreply@healthconnect.com>
```

### Example:
```bash
EMAIL_SERVICE=gmail
EMAIL_USER=udayram123@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=HealthConnect <noreply@healthconnect.com>
```

**Note:** Remove the spaces from the app password or keep them - both work!

---

## ✅ Test Email Configuration

After updating `.env`, restart your server and test:

### Method 1: Using the test endpoint (coming soon)
```http
GET http://localhost:5000/api/auth/test-email
```

### Method 2: Register a user
The system will automatically send an OTP email during registration.

---

## 🐛 Troubleshooting

### Error: "Invalid login"
- Double-check your EMAIL_USER (must be the full Gmail address)
- Verify the app password is correct (16 characters)
- Make sure 2FA is enabled on your Google account

### Error: "Less secure app access"
- This is NOT needed if you're using App Passwords
- App Passwords are the secure way to access Gmail

### Error: "Application-specific password required"
- You need to generate an App Password (see Step 2 above)
- Regular Gmail password won't work

### Emails going to Spam
- This is normal for newly configured email services
- Mark them as "Not Spam" in your inbox
- After a few emails, Gmail will learn they're legitimate

---

## 🔒 Security Best Practices

✅ **DO:**
- Use App Passwords (never your real Gmail password)
- Keep your `.env` file in `.gitignore`
- Use a dedicated email account for your application
- Regularly rotate app passwords

❌ **DON'T:**
- Share your `.env` file
- Commit `.env` to Git
- Use your personal Gmail account in production
- Share app passwords

---

## 🚀 Alternative: SendGrid (Production Recommended)

For production, consider using SendGrid instead of Gmail:

1. Sign up: https://sendgrid.com/ (Free tier: 100 emails/day)
2. Get API key
3. Update `.env`:

```bash
EMAIL_SERVICE=sendgrid
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=noreply@healthconnect.com
```

---

## 📧 Expected Email Flow

### Registration:
1. User registers → OTP generated
2. OTP sent to user's email
3. User enters OTP → Email verified
4. Welcome email sent

### Login:
1. User enters email/password → Credentials validated
2. OTP generated and sent to email
3. User enters OTP → Login successful
4. JWT token issued

---

## 📝 What the OTP Email Looks Like

### Subject:
`🔐 Your Login OTP - HealthConnect`

### Content:
```
Hello John Doe! 👋

Your OTP Code: 123456

⏰ This OTP will expire in 10 minutes
🔒 You have 3 attempts to enter the correct OTP

Security Notice:
• Never share this OTP with anyone
• HealthConnect will never ask for your OTP via phone
```

---

## ✅ Checklist

Before testing OTP flow:

- [ ] 2-Factor Authentication enabled on Gmail
- [ ] App Password generated
- [ ] `.env` file updated with EMAIL_USER
- [ ] `.env` file updated with EMAIL_PASSWORD
- [ ] Backend server restarted
- [ ] Test email with valid Gmail address

---

**Need help?** Check the console logs when server starts:
- ✅ "Email service configured successfully" - Good to go!
- ⚠️ "Email service not configured" - Check your `.env` file

---

*Last Updated: October 20, 2025*
