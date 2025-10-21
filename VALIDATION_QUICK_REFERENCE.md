# Input Validation Quick Reference

## 🎯 Password Requirements
```
✅ Minimum 8 characters
✅ At least 1 UPPERCASE letter (A-Z)
✅ At least 1 lowercase letter (a-z)
✅ At least 1 number (0-9)
✅ At least 1 special character (!@#$%^&*()_+-=[]{}|;:,.<>?)

Valid Examples:
- StrongPass123!
- SecureP@ssw0rd
- MyP@ssw0rd2024

Invalid Examples:
- weak (too short, missing requirements)
- Password123 (no special character)
- password123! (no uppercase)
- PASSWORD123! (no lowercase)
```

## 📧 Email Requirements
```
✅ Valid email format (user@domain.ext)
✅ No consecutive dots (..)
✅ Cannot start/end with dots
✅ Proper domain structure

Valid Examples:
- john.doe@example.com
- sarah@hospital.org
- test.user@company.co.in

Invalid Examples:
- invalid
- john..doe@example.com
- .john@example.com
- john@.com
```

## 📱 Phone Number Requirements
```
✅ Exactly 10 digits
✅ Must start with 6-9 (Indian mobile)
✅ Optional country code (+91 or 91)

Valid Examples:
- 9876543210
- +91 9876543210
- 91-9876-543210
- +919876543210

Invalid Examples:
- 123 (too short)
- 12345 (too short)
- 5876543210 (doesn't start with 6-9)
```

## 👤 Name Requirements
```
✅ Only letters, spaces, hyphens (-), apostrophes (')
✅ Minimum 2 characters
✅ Maximum 50 characters
✅ Cannot start/end with space/hyphen/apostrophe

Valid Examples:
- John Doe
- Mary-Jane
- O'Connor
- Dr. Sarah
- Jean-Pierre D'Arcy

Invalid Examples:
- John123 (contains numbers)
- J (too short)
- @#$% (special characters)
- -John (starts with hyphen)
```

## 🩸 Blood Group Options
```
A+, A-, B+, B-, AB+, AB-, O+, O-
```

## 👨‍⚕️ Doctor Registration Requirements
```
✅ All common fields (name, email, password, role)
✅ specialization (required, 2-100 chars)
✅ experience (required, number 0-60)
✅ qualification (required, 2-200 chars)
✅ contactNumber (optional, 10-digit mobile)

Example:
{
  "name": "Dr. Sarah O'Connor",
  "email": "sarah@hospital.com",
  "password": "SecurePass456!",
  "role": "doctor",
  "specialization": "Cardiology",
  "qualification": "MBBS, MD",
  "experience": 10,
  "contactNumber": "9123456789"
}
```

## 🧑‍⚕️ Patient Registration Requirements
```
✅ All common fields (name, email, password, role)
✅ contactNumber (optional, 10-digit mobile)
✅ dateOfBirth (optional, YYYY-MM-DD, age 0-150)
✅ gender (optional, male/female/other)
✅ bloodGroup (optional, A+/A-/B+/B-/AB+/AB-/O+/O-)

Example:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "StrongPass123!",
  "role": "patient",
  "contactNumber": "9876543210",
  "gender": "male",
  "bloodGroup": "O+",
  "dateOfBirth": "1990-05-15"
}
```

## 🔐 Login Requirements
```
✅ email (required, valid email format)
✅ password (required, any string)
✅ role (required, 'doctor' or 'patient')

Example:
{
  "email": "john@example.com",
  "password": "StrongPass123!",
  "role": "patient"
}
```

## ⚠️ Common Validation Errors

| Error Message | What It Means | Fix |
|--------------|---------------|-----|
| "Password must be at least 8 characters long" | Password too short | Use 8+ characters |
| "Password must contain at least one uppercase letter" | Missing uppercase | Add A-Z |
| "Password must contain at least one special character" | Missing special char | Add !@#$%^&* |
| "Name can only contain letters, spaces, hyphens, and apostrophes" | Invalid characters in name | Remove numbers/symbols |
| "Please provide a valid email address" | Invalid email format | Use user@domain.com |
| "Phone number must be a valid 10-digit Indian mobile number" | Invalid phone | Use 10 digits starting with 6-9 |
| "Specialization is required for doctors" | Missing required field | Add specialization |
| "Experience cannot be negative" | Invalid experience value | Use positive number |

## 📝 Error Response Format
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "password",
      "message": "Password must be at least 8 characters long",
      "value": "weak"
    },
    {
      "field": "name",
      "message": "Name can only contain letters, spaces, hyphens, and apostrophes",
      "value": "John123"
    }
  ]
}
```

## 🧪 Testing with Postman/Thunder Client

### Valid Patient Registration:
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "StrongPass123!",
  "role": "patient",
  "contactNumber": "9876543210",
  "gender": "male",
  "bloodGroup": "O+"
}
```

### Valid Doctor Registration:
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Dr. Sarah Smith",
  "email": "sarah.smith@hospital.com",
  "password": "SecurePass456!",
  "role": "doctor",
  "specialization": "Cardiology",
  "qualification": "MBBS, MD",
  "experience": 10,
  "contactNumber": "9123456789"
}
```

### Test Weak Password:
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "weak",
  "role": "patient"
}

Expected Response: 400 Bad Request
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "password",
      "message": "Password must be at least 8 characters long",
      "value": "weak"
    }
  ]
}
```

## 📚 Validation Middleware Available

```javascript
// In your routes file
import {
  validateRegister,        // For user registration
  validateLogin,           // For user login
  validateAdminLogin,      // For admin login
  validateOTP,             // For OTP verification (future)
  validateResendOTP,       // For resending OTP (future)
  validatePasswordResetRequest,  // For password reset request (future)
  validatePasswordReset,   // For password reset confirmation (future)
  validateProfileUpdate,   // For profile updates (future)
  validateChangePassword   // For changing password (future)
} from '../middleware/validation.js';

// Usage
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
```

---

**Quick Tip:** The validation happens **automatically** before your controller code runs. If validation fails, the user gets a `400 Bad Request` with detailed error messages. Your controller only runs if all validation passes! ✅
