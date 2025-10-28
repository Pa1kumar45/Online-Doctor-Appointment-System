# Data Flow-Based Testing - White-Box Test Cases

**Date:** October 28, 2025  
**Module:** Health-Connect MERN Application  
**Testing Type:** White-Box - Data Flow-Based Testing  
**Total Test Cases:** 5

---

## Overview

Data Flow-Based Testing focuses on tracing the flow of data variables through the system, from their definition points to their usage points. This technique identifies DU-chains (Definition-Use chains) to ensure data integrity throughout its lifecycle.

---

## TC-WB-DF-001: Data Flow - Password Definition to Hash to Comparison

| Field                                 | Value                                                                                                                                                                                                                       |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test_Case_ID**                      | TC-WB-DF-001                                                                                                                                                                                                                |
| **Technique**                         | Data Flow-Based Testing                                                                                                                                                                                                     |
| **Module**                            | Admin Model                                                                                                                                                                                                                 |
| **Function**                          | Admin.create() → pre('save') → comparePassword()                                                                                                                                                                            |
| **Inputs_or_Setup**                   | Create admin with plaintext password, then login with same password                                                                                                                                                         |
| **Code_Lines_Executed_(Description)** | DU chain: password variable defined at Admin.create({password: "plaintext"}) → DEFINITION in pre-save hook: `this.password = hashedPassword` → USE in comparePassword: `bcryptjs.compare(candidatepassword, this.password)` |
| **Expected_Output**                   | Password hashed correctly, comparePassword returns true for correct plaintext, login succeeds                                                                                                                               |
| **Request_Method**                    | POST                                                                                                                                                                                                                        |
| **Request_URL**                       | http://localhost:5000/api/auth/admin/login                                                                                                                                                                                  |
| **Request_Body**                      | `{"email": "admin@healthconnect.com", "password": "#1ap@NITK"}`                                                                                                                                                             |
| **DB_Preconditions**                  | Admin created with password field                                                                                                                                                                                           |

### Data Flow Diagram:
```
D1: password = "#1ap@NITK" (plaintext)
    ↓
D2: this.password = bcryptjs.hash(password, 12)
    ↓
U1: comparePassword(candidatePassword)
    ↓
U2: bcryptjs.compare(candidatePassword, this.password)
    ↓
Result: true/false
```

---

## TC-WB-DF-002: Data Flow - OTP Creation to Verification to Deletion

| Field                                 | Value                                                                                                                                                                                                                                                            |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test_Case_ID**                      | TC-WB-DF-002                                                                                                                                                                                                                                                     |
| **Technique**                         | Data Flow-Based Testing                                                                                                                                                                                                                                          |
| **Module**                            | OTP Management                                                                                                                                                                                                                                                   |
| **Function**                          | OTP.createOTP() → OTP.verifyOTP() → OTP.deleteOne()                                                                                                                                                                                                              |
| **Inputs_or_Setup**                   | Request OTP for login, then verify it                                                                                                                                                                                                                            |
| **Code_Lines_Executed_(Description)** | DU chain: otp variable DEFINED in createOTP: `otp = Math.floor(100000 + Math.random() * 900000).toString()` → USED in verifyOTP: `OTP.findOne({email, otp, purpose})` → USED in delete: `await OTP.deleteOne({ _id: otpDoc._id })` after successful verification |
| **Expected_Output**                   | OTP created in DB, verified successfully, then deleted after use; cannot be reused                                                                                                                                                                               |
| **Request_Method**                    | POST (two calls)                                                                                                                                                                                                                                                 |
| **Request_URL**                       | /api/auth/login → /api/auth/verify-otp                                                                                                                                                                                                                           |
| **Request_Body**                      | Step 1: `{"email": "doctor@test.com", "password": "Pass123!", "role": "doctor"}` / Step 2: `{"email": "doctor@test.com", "otp": "<generated>", "role": "doctor", "purpose": "login"}`                                                                            |
| **DB_Preconditions**                  | Doctor exists with verified email                                                                                                                                                                                                                                |

### Data Flow Diagram:
```
D1: otp = generateRandomSixDigit() → "123456"
    ↓
D2: OTP.create({email, otp, purpose, expiresAt})
    ↓
U1: OTP.findOne({email, otp, purpose, verified: false})
    ↓
U2: OTP verification success
    ↓
U3: OTP.deleteOne({_id: otpDoc._id})
    ↓
Result: OTP removed, cannot reuse
```

---

## TC-WB-DF-003: Data Flow - User Role Definition to Model Selection to Response Formatting

| Field                                 | Value                                                                                                                                                                                                                                          |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test_Case_ID**                      | TC-WB-DF-003                                                                                                                                                                                                                                   |
| **Technique**                         | Data Flow-Based Testing                                                                                                                                                                                                                        |
| **Module**                            | Authentication                                                                                                                                                                                                                                 |
| **Function**                          | register() in authController.js                                                                                                                                                                                                                |
| **Inputs_or_Setup**                   | Register with role="doctor"                                                                                                                                                                                                                    |
| **Code_Lines_Executed_(Description)** | DU chain: role variable DEFINED from req.body → USED in `getUserModel(role)` to select Doctor vs Patient model → USED in `formatUserResponse(user, role)` to include role-specific fields (specialization, experience) → USED in response JSON |
| **Expected_Output**                   | Doctor model used, registration successful, response includes doctor-specific fields if role="doctor"                                                                                                                                          |
| **Request_Method**                    | POST                                                                                                                                                                                                                                           |
| **Request_URL**                       | http://localhost:5000/api/auth/register                                                                                                                                                                                                        |
| **Request_Body**                      | `{"name": "Dr. Smith", "email": "drsmith@hospital.com", "password": "Pass123!", "role": "doctor", "specialization": "Cardiology", "experience": 5, "qualification": "MD"}`                                                                     |
| **DB_Preconditions**                  | No existing user with this email                                                                                                                                                                                                               |

### Data Flow Diagram:
```
D1: role = req.body.role → "doctor"
    ↓
U1: UserModel = getUserModel(role) → Doctor model
    ↓
U2: user = await UserModel.create({...})
    ↓
U3: response = formatUserResponse(user, role)
    ↓
U4: res.json({...response})
    ↓
Result: Doctor-specific fields included
```

---

## TC-WB-DF-004: Data Flow - Email Definition to OTP Lookup to Email Service

| Field                                 | Value                                                                                                                                                                                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test_Case_ID**                      | TC-WB-DF-004                                                                                                                                                                                                                                |
| **Technique**                         | Data Flow-Based Testing                                                                                                                                                                                                                     |
| **Module**                            | OTP Resend                                                                                                                                                                                                                                  |
| **Function**                          | resendOTP() in authController.js                                                                                                                                                                                                            |
| **Inputs_or_Setup**                   | Request OTP resend for existing user                                                                                                                                                                                                        |
| **Code_Lines_Executed_(Description)** | DU chain: email variable DEFINED from req.body → USED in `UserModel.findOne({ email })` → USED in `OTP.checkRateLimit(email, purpose)` → USED in `OTP.createOTP(email, role, purpose)` → USED in `sendOTPEmail({ email: user.email, ... })` |
| **Expected_Output**                   | Email used consistently throughout flow, OTP sent to correct email address                                                                                                                                                                  |
| **Request_Method**                    | POST                                                                                                                                                                                                                                        |
| **Request_URL**                       | http://localhost:5000/api/auth/resend-otp                                                                                                                                                                                                   |
| **Request_Body**                      | `{"email": "patient@test.com", "role": "patient", "purpose": "registration"}`                                                                                                                                                               |
| **DB_Preconditions**                  | Patient exists with email "patient@test.com", not rate limited                                                                                                                                                                              |

### Data Flow Diagram:
```
D1: email = req.body.email → "patient@test.com"
    ↓
U1: user = UserModel.findOne({ email })
    ↓
U2: rateLimitCheck = OTP.checkRateLimit(email, purpose)
    ↓
U3: otpData = OTP.createOTP(email, role, purpose)
    ↓
U4: sendOTPEmail({ email: user.email, otp: otpData.otp })
    ↓
Result: OTP sent to correct email
```

---

## TC-WB-DF-005: Data Flow - Session Token Definition to Cookie to Revocation

| Field                                 | Value                                                                                                                                                                                                                                                                                                |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test_Case_ID**                      | TC-WB-DF-005                                                                                                                                                                                                                                                                                         |
| **Technique**                         | Data Flow-Based Testing                                                                                                                                                                                                                                                                              |
| **Module**                            | Session Management                                                                                                                                                                                                                                                                                   |
| **Function**                          | generateToken() → logout()                                                                                                                                                                                                                                                                           |
| **Inputs_or_Setup**                   | Login successfully, then logout                                                                                                                                                                                                                                                                      |
| **Code_Lines_Executed_(Description)** | DU chain: token DEFINED in generateToken: `const token = jwt.sign(...)` → USED in Session.create({token, ...}) → USED in res.cookie('token', token) → USED in logout: `const { token } = req.cookies` → USED in `Session.updateOne({ token, isActive: true }, { isActive: false })` → Cookie cleared |
| **Expected_Output**                   | Token created, stored in DB session, set as cookie, successfully revoked on logout, cookie cleared                                                                                                                                                                                                   |
| **Request_Method**                    | POST (login then logout)                                                                                                                                                                                                                                                                             |
| **Request_URL**                       | /api/auth/verify-otp (login) → /api/auth/logout                                                                                                                                                                                                                                                      |
| **Request_Body**                      | Login OTP verification, then logout (no body)                                                                                                                                                                                                                                                        |
| **DB_Preconditions**                  | Successful login creates session with token                                                                                                                                                                                                                                                          |

### Data Flow Diagram:
```
D1: token = jwt.sign({userId, userRole}, SECRET, {expiresIn: '7d'})
    ↓
U1: Session.create({userId, userRole, token, isActive: true})
    ↓
U2: res.cookie('token', token, {httpOnly: true, secure: true})
    ↓
U3: const { token } = req.cookies (in logout)
    ↓
U4: Session.updateOne({token, isActive: true}, {isActive: false})
    ↓
U5: res.clearCookie('token')
    ↓
Result: Session revoked, cookie cleared
```

---

## Key Concepts in Data Flow Testing

### DU-Chain (Definition-Use Chain)
- **Definition (D):** Where a variable is assigned a value
- **Use (U):** Where the variable's value is referenced
- **DU-Chain:** The path from definition to use

### Testing Objectives
1. **Data Integrity:** Ensure data maintains correct values throughout flow
2. **Transformation Tracking:** Verify data transformations (e.g., plaintext → hash)
3. **Lifecycle Completion:** Confirm data lifecycle from creation to deletion
4. **Cross-Function Flow:** Track data across multiple functions/modules

### Coverage Achieved
- ✅ Password transformation (plaintext → hash → verification)
- ✅ OTP lifecycle (generation → verification → deletion)
- ✅ Role-based model selection (input → model → response)
- ✅ Email propagation (input → lookup → rate limit → email service)
- ✅ Token lifecycle (generation → storage → cookie → revocation)

---

## How to Test

### Manual Testing
```bash
# TC-WB-DF-001: Password Hash Flow
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@healthconnect.com", "password": "#1ap@NITK"}'

# TC-WB-DF-002: OTP Lifecycle
# Step 1: Generate OTP
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "doctor@test.com", "password": "Pass123!", "role": "doctor"}'

# Step 2: Verify OTP (use OTP from email/logs)
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "doctor@test.com", "otp": "123456", "role": "doctor", "purpose": "login"}'
```

### Automated Testing
```bash
cd backend
npm run test:once -- TC-WB-DF-001
npm run test:once -- TC-WB-DF-002
npm run test:once -- TC-WB-DF-003
npm run test:once -- TC-WB-DF-004
npm run test:once -- TC-WB-DF-005

# Run all Data Flow tests
npm run test:once -- TC-WB-DF

# With coverage
npm run test:coverage
```

---

## Test File Location

All automated test files are located in:
```
/backend/tests/
  ├── TC-WB-DF-001.test.js  ✅ Created
  ├── TC-WB-DF-002.test.js  (To be created)
  ├── TC-WB-DF-003.test.js  (To be created)
  ├── TC-WB-DF-004.test.js  (To be created)
  └── TC-WB-DF-005.test.js  (To be created)
```

---

## Summary

**Total Data Flow Test Cases:** 5  
**Automated Tests Created:** 1 (TC-WB-DF-001)  
**Coverage Focus:** Variable lifecycle from definition to usage  
**Key Data Flows Tested:**
- Password hashing pipeline
- OTP generation and verification
- Role-based routing
- Email propagation
- Session token management

---

**Note:** This document complements the `Complete_Test_Cases.md` file and provides detailed data flow diagrams for each test case. The Excel file `Health_Connect_Test_Cases.xlsx` includes all these test cases in the "White-Box Test Cases" sheet under section "E. Data Flow-Based Testing (5 Test Cases)".
