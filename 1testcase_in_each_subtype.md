# Selected Test Cases - One from Each Subtype

**Date:** October 28, 2025  
**Project:** Health-Connect MERN Application  
**Total Selected Test Cases:** 7 (2 Black-Box + 5 White-Box)  
**Purpose:** Example test cases with detailed testing instructions

---

## Table of Contents

1. [Black-Box Test Cases (2)](#black-box-test-cases)
   - [TC-BB-ECP-001: Equivalence Class Partitioning](#tc-bb-ecp-001-equivalence-class-partitioning)
   - [TC-BB-BVA-001: Boundary Value Analysis](#tc-bb-bva-001-boundary-value-analysis)
2. [White-Box Test Cases (5)](#white-box-test-cases)
   - [TC-WB-SC-001: Statement Coverage](#tc-wb-sc-001-statement-coverage)
   - [TC-WB-BC-001: Branch Coverage](#tc-wb-bc-001-branch-coverage)
   - [TC-WB-MC-001: Multiple Condition Coverage](#tc-wb-mc-001-multiple-condition-coverage)
   - [TC-WB-PC-001: Path Coverage](#tc-wb-pc-001-path-coverage)
   - [TC-WB-DF-001: Data Flow-Based Testing](#tc-wb-df-001-data-flow-based-testing)

---

## BLACK-BOX TEST CASES

### TC-BB-ECP-001: Equivalence Class Partitioning

#### Test Case Details

| Field                | Value                                                                            |
| -------------------- | -------------------------------------------------------------------------------- |
| **Test_Case_ID**     | TC-BB-ECP-001                                                                    |
| **Technique**        | Equivalence Class Partitioning                                                   |
| **Module**           | Admin Authentication                                                             |
| **Input_Field**      | email, password                                                                  |
| **Boundary_Checked** | No                                                                               |
| **Test_Value**       | email: "admin@healthconnect.com", password: "#1ap@NITK"                          |
| **Expected_Result**  | Status 200, admin login successful, JWT token set in cookie, admin data returned |
| **Request_Method**   | POST                                                                             |
| **Request_URL**      | http://localhost:5000/api/auth/admin/login                                       |
| **Request_Body**     | `{"email": "admin@healthconnect.com", "password": "#1ap@NITK"}`                  |
| **DB_Preconditions** | Admin account exists with email "admin@healthconnect.com" and isActive=true      |

#### How to Test

**Step 1: Setup Database Preconditions**

```bash
# Navigate to backend folder
cd backend

# Create admin account (if not exists)
npm run create-admin
```

**Step 2: Start the Backend Server**

```bash
# In backend folder
npm run dev
```

Server should start on http://localhost:5000

**Step 3: Execute Test Using Postman**

1. Open Postman
2. Create a new POST request
3. URL: `http://localhost:5000/api/auth/admin/login`
4. Headers:
   - Content-Type: `application/json`
5. Body (raw JSON):

```json
{
  "email": "admin@healthconnect.com",
  "password": "#1ap@NITK"
}
```

6. Click "Send"

**Step 4: Execute Test Using cURL**

```bash
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@healthconnect.com", "password": "#1ap@NITK"}'
```

**PowerShell Version:**

```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/auth/admin/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email": "admin@healthconnect.com", "password": "#1ap@NITK"}'
```

**Step 5: Verify Expected Output**

✅ **Success Response (Status 200):**

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "System Administrator",
    "email": "admin@healthconnect.com",
    "role": "super_admin",
    "permissions": [
      "manage_users",
      "manage_doctors",
      "manage_patients",
      "view_reports"
    ],
    "avatar": "",
    "lastLogin": "2025-10-28T10:30:00.000Z"
  },
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "System Administrator",
    "email": "admin@healthconnect.com",
    "role": "super_admin",
    "permissions": [
      "manage_users",
      "manage_doctors",
      "manage_patients",
      "view_reports"
    ],
    "avatar": "",
    "lastLogin": "2025-10-28T10:30:00.000Z"
  },
  "loginInfo": {
    "previousLogin": "2025-10-27T09:15:00.000Z",
    "lastLogout": "2025-10-27T18:00:00.000Z"
  }
}
```

✅ **Cookie Set:**

- Cookie name: `token`
- HttpOnly: true
- Contains JWT token

**Related Files:**

- Controller: `backend/src/controllers/authController.js` (adminLogin function)
- Model: `backend/src/models/Admin.js`
- Route: `backend/src/routes/auth.js`
- Script: `backend/src/scripts/createTestAdmin.js`

---

### TC-BB-BVA-001: Boundary Value Analysis

#### Test Case Details

| Field                | Value                                                                                                     |
| -------------------- | --------------------------------------------------------------------------------------------------------- |
| **Test_Case_ID**     | TC-BB-BVA-001                                                                                             |
| **Technique**        | Boundary Value Analysis                                                                                   |
| **Module**           | OTP Verification                                                                                          |
| **Input_Field**      | otp                                                                                                       |
| **Boundary_Checked** | Yes - Minimum 6-digit OTP value                                                                           |
| **Test_Value**       | email: "patient@test.com", otp: "000000", role: "patient", purpose: "registration"                        |
| **Expected_Result**  | Status 400, OTP verification fails (invalid OTP - unless this is the actual OTP generated)                |
| **Request_Method**   | POST                                                                                                      |
| **Request_URL**      | http://localhost:5000/api/auth/verify-otp                                                                 |
| **Request_Body**     | `{"email": "patient@test.com", "otp": "000000", "role": "patient", "purpose": "registration"}`            |
| **DB_Preconditions** | OTP exists for email "patient@test.com" with purpose "registration", OTP value is different from "000000" |

#### How to Test

**Step 1: Setup Database Preconditions**
First, register a new patient to generate an OTP:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Patient",
    "email": "patient@test.com",
    "password": "TestPass123!",
    "role": "patient"
  }'
```

This will create an OTP in the database (likely NOT "000000").

**Step 2: Execute Test with Boundary Value**

```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@test.com",
    "otp": "000000",
    "role": "patient",
    "purpose": "registration"
  }'
```

**PowerShell Version:**

```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/auth/verify-otp" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email": "patient@test.com", "otp": "000000", "role": "patient", "purpose": "registration"}'
```

**Step 3: Verify Expected Output**

✅ **Expected Response (Status 400):**

```json
{
  "success": false,
  "message": "Invalid OTP code",
  "attemptsRemaining": 2
}
```

**Testing Variations:**
To test boundary values comprehensively, test with:

- "000000" (minimum boundary)
- "999999" (maximum boundary)
- "100000" (just above minimum)
- "-00001" (invalid - negative)
- "12345" (invalid - too short)
- "1234567" (invalid - too long)

**Related Files:**

- Controller: `backend/src/controllers/authController.js` (verifyOTP function)
- Model: `backend/src/models/OTP.js`
- Route: `backend/src/routes/auth.js`

---

## WHITE-BOX TEST CASES

### TC-WB-SC-001: Statement Coverage

#### Test Case Details

| Field                                 | Value                                                                                                                                                                                                                                         |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test_Case_ID**                      | TC-WB-SC-001                                                                                                                                                                                                                                  |
| **Technique**                         | Statement Coverage                                                                                                                                                                                                                            |
| **Module**                            | Authentication                                                                                                                                                                                                                                |
| **Function**                          | register() in authController.js                                                                                                                                                                                                               |
| **Inputs_or_Setup**                   | POST request with: name="Test User", email="new@test.com", password="Pass123!", role="patient"                                                                                                                                                |
| **Code*Lines_Executed*(Description)** | Lines creating user with `isEmailVerified: false`, OTP generation via `OTP.createOTP()`, email sending via `sendOTPEmail()`, logging via `logAuthEvent()`, response with `requiresVerification: true`                                         |
| **Expected_Output**                   | User created in DB with isEmailVerified=false, OTP record created, email sent, response: {"success": true, "message": "Registration successful! Please check your email...", "data": {"email": "new@test.com", "requiresVerification": true}} |
| **Request_Method**                    | POST                                                                                                                                                                                                                                          |
| **Request_URL**                       | http://localhost:5000/api/auth/register                                                                                                                                                                                                       |
| **Request_Body**                      | `{"name": "Test User", "email": "new@test.com", "password": "Pass123!", "role": "patient"}`                                                                                                                                                   |
| **DB_Preconditions**                  | No user exists with email "new@test.com"                                                                                                                                                                                                      |

#### How to Test

**Step 1: Create Automated Test File**

Create file: `backend/tests/TC-WB-SC-001.test.js`

```javascript
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import express from "express";
import authRoutes from "../src/routes/auth.js";
import Patient from "../src/models/Patient.js";
import OTP from "../src/models/OTP.js";

describe("TC-WB-SC-001: Statement Coverage - Registration", () => {
  let mongoServer;
  let app;

  beforeAll(async () => {
    // Setup in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Setup Express app
    app = express();
    app.use(express.json());
    app.use("/api/auth", authRoutes);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("should execute all registration statements including email verification, OTP generation, and logging", async () => {
    // Arrange
    const registrationData = {
      name: "Test User",
      email: "new@test.com",
      password: "Pass123!",
      role: "patient",
    };

    // Act
    const response = await request(app)
      .post("/api/auth/register")
      .send(registrationData)
      .expect(201);

    // Assert - Response structure
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain("Registration successful");
    expect(response.body.data.email).toBe("new@test.com");
    expect(response.body.data.requiresVerification).toBe(true);

    // Assert - User created in DB with isEmailVerified: false
    const user = await Patient.findOne({ email: "new@test.com" });
    expect(user).not.toBeNull();
    expect(user.name).toBe("Test User");
    expect(user.isEmailVerified).toBe(false);

    // Assert - OTP created in DB
    const otp = await OTP.findOne({
      email: "new@test.com",
      purpose: "registration",
    });
    expect(otp).not.toBeNull();
    expect(otp.otp).toMatch(/^\d{6}$/); // 6-digit OTP

    // Coverage achieved:
    // ✓ User creation statement
    // ✓ isEmailVerified: false assignment
    // ✓ OTP.createOTP() call
    // ✓ sendOTPEmail() call
    // ✓ logAuthEvent() call
    // ✓ Response with requiresVerification: true
  });
});
```

**Step 2: Run the Test**

```bash
cd backend
npm run test:once
```

**Step 3: Check Coverage**

```bash
npm run test:coverage
```

**Step 4: Manual Testing (Alternative)**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "new@test.com",
    "password": "Pass123!",
    "role": "patient"
  }'
```

**Step 5: Verify Database Changes**

```javascript
// Connect to MongoDB and check
use medical_app;

// Check user created with isEmailVerified: false
db.patients.findOne({ email: "new@test.com" });
// Expected: { ..., isEmailVerified: false, ... }

// Check OTP created
db.otps.findOne({ email: "new@test.com", purpose: "registration" });
// Expected: { email: "new@test.com", otp: "123456", purpose: "registration", ... }
```

**Expected Output:**

```json
{
  "success": true,
  "message": "Registration successful! Please check your email for the OTP to verify your account.",
  "data": {
    "email": "new@test.com",
    "role": "patient",
    "requiresVerification": true,
    "otp": "123456"
  }
}
```

**Related Files:**

- Test File: `backend/tests/TC-WB-SC-001.test.js`
- Controller: `backend/src/controllers/authController.js` (register function, lines ~58-160)
- Models: `backend/src/models/Patient.js`, `backend/src/models/OTP.js`

---

### TC-WB-BC-001: Branch Coverage

#### Test Case Details

| Field                                 | Value                                                                                                                                                                                                        |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Test_Case_ID**                      | TC-WB-BC-001                                                                                                                                                                                                 |
| **Technique**                         | Branch Coverage                                                                                                                                                                                              |
| **Module**                            | Authentication                                                                                                                                                                                               |
| **Function**                          | register() in authController.js                                                                                                                                                                              |
| **Inputs_or_Setup**                   | POST request with email that already exists in Doctor or Patient collection                                                                                                                                  |
| **Code*Lines_Executed*(Description)** | Lookup for existingDoctor and existingPatient, branch `if (existingDoctor \|\| existingPatient)` evaluates to TRUE, logAuthEvent with failureReason='Email already registered', early return with 400 status |
| **Expected_Output**                   | Status 400, {"success": false, "message": "User already exists with this email"}                                                                                                                             |
| **Request_Method**                    | POST                                                                                                                                                                                                         |
| **Request_URL**                       | http://localhost:5000/api/auth/register                                                                                                                                                                      |
| **Request_Body**                      | `{"name": "Duplicate User", "email": "existing@test.com", "password": "Pass123!", "role": "patient"}`                                                                                                        |
| **DB_Preconditions**                  | Patient or Doctor with email "existing@test.com" already exists                                                                                                                                              |

#### How to Test

**Step 1: Create Test File**

Create file: `backend/tests/TC-WB-BC-001.test.js`

```javascript
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import express from "express";
import authRoutes from "../src/routes/auth.js";
import Patient from "../src/models/Patient.js";

describe("TC-WB-BC-001: Branch Coverage - Email Already Exists", () => {
  let mongoServer;
  let app;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    app = express();
    app.use(express.json());
    app.use("/api/auth", authRoutes);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear database
    await Patient.deleteMany({});
  });

  it("should take TRUE branch when email already exists", async () => {
    // Arrange - Create existing patient
    const existingPatient = new Patient({
      name: "Existing User",
      email: "existing@test.com",
      password: "ExistingPass123!",
      isEmailVerified: true,
    });
    await existingPatient.save();

    // Act - Try to register with same email
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Duplicate User",
        email: "existing@test.com",
        password: "Pass123!",
        role: "patient",
      })
      .expect(400);

    // Assert - Branch TRUE executed
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("User already exists with this email");

    // Verify no duplicate created
    const count = await Patient.countDocuments({ email: "existing@test.com" });
    expect(count).toBe(1); // Still only 1

    // Coverage achieved:
    // ✓ existingDoctor lookup
    // ✓ existingPatient lookup
    // ✓ if (existingDoctor || existingPatient) → TRUE branch
    // ✓ logAuthEvent with failureReason
    // ✓ Early return with 400 status
  });

  it("should take FALSE branch when email does not exist", async () => {
    // Act - Register with new email
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "New User",
        email: "newuser@test.com",
        password: "Pass123!",
        role: "patient",
      })
      .expect(201);

    // Assert - Branch FALSE executed (continues to create user)
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain("Registration successful");

    // Coverage achieved:
    // ✓ if (existingDoctor || existingPatient) → FALSE branch
    // ✓ Continues to user creation
  });
});
```

**Step 2: Run Test**

```bash
npm run test:once -- TC-WB-BC-001
```

**Step 3: Manual Testing - TRUE Branch**

```bash
# First, create an existing user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "First User",
    "email": "existing@test.com",
    "password": "Pass123!",
    "role": "patient"
  }'

# Then try to register again with same email (TRUE branch)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Duplicate User",
    "email": "existing@test.com",
    "password": "Pass123!",
    "role": "patient"
  }'
```

**Expected Output (TRUE Branch):**

```json
{
  "success": false,
  "message": "User already exists with this email"
}
```

**Related Files:**

- Test File: `backend/tests/TC-WB-BC-001.test.js`
- Controller: `backend/src/controllers/authController.js` (register function, lines ~71-82)

---

### TC-WB-MC-001: Multiple Condition Coverage

#### Test Case Details

| Field                                 | Value                                                                                                                                                                                                                                        |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test_Case_ID**                      | TC-WB-MC-001                                                                                                                                                                                                                                 |
| **Technique**                         | Multiple Condition Coverage                                                                                                                                                                                                                  |
| **Module**                            | Authentication                                                                                                                                                                                                                               |
| **Function**                          | register() in authController.js                                                                                                                                                                                                              |
| **Inputs_or_Setup**                   | Valid registration data, but email service (sendOTPEmail) fails                                                                                                                                                                              |
| **Code*Lines_Executed*(Description)** | User created successfully, OTP generated, sendOTPEmail() called and returns {success: false}, condition `if (!emailResult.success)` evaluates TRUE, returns 201 with warning message and includes OTP in development mode                    |
| **Expected_Output**                   | Status 201, {"success": true, "message": "Registration successful. Email service temporarily unavailable. Please contact support for OTP.", "data": {"email": "test@test.com", "requiresVerification": true, "otp": "123456"}} (in dev mode) |
| **Request_Method**                    | POST                                                                                                                                                                                                                                         |
| **Request_URL**                       | http://localhost:5000/api/auth/register                                                                                                                                                                                                      |
| **Request_Body**                      | `{"name": "Test User", "email": "test@test.com", "password": "Pass123!", "role": "patient"}`                                                                                                                                                 |
| **DB_Preconditions**                  | No existing user, email service configured to fail (or SMTP unavailable)                                                                                                                                                                     |

#### How to Test

**Step 1: Simulate Email Service Failure**

Temporarily modify `.env` to use invalid SMTP settings:

```env
# backend/.env
EMAIL_HOST=invalid.smtp.server
EMAIL_PORT=587
EMAIL_USER=invalid@email.com
EMAIL_PASS=wrongpassword
NODE_ENV=development
```

**Step 2: Create Test File**

Create file: `backend/tests/TC-WB-MC-001.test.js`

```javascript
import { describe, it, expect, beforeAll, afterAll, jest } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import express from "express";
import authRoutes from "../src/routes/auth.js";
import * as emailService from "../src/services/emailService.js";

describe("TC-WB-MC-001: Multiple Condition Coverage - Email Service Failure", () => {
  let mongoServer;
  let app;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    app = express();
    app.use(express.json());
    app.use("/api/auth", authRoutes);

    // Mock email service to always fail
    jest.spyOn(emailService, "sendOTPEmail").mockResolvedValue({
      success: false,
      error: "SMTP connection failed",
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    jest.restoreAllMocks();
  });

  it("should handle email service failure gracefully", async () => {
    // Act
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "test@test.com",
        password: "Pass123!",
        role: "patient",
      })
      .expect(201); // Still 201 even though email failed

    // Assert - Multiple conditions checked
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain(
      "Email service temporarily unavailable"
    );
    expect(response.body.data.requiresVerification).toBe(true);

    // In development mode, OTP should be included
    if (process.env.NODE_ENV === "development") {
      expect(response.body.data.otp).toBeDefined();
      expect(response.body.data.otp).toMatch(/^\d{6}$/);
    }

    // Coverage achieved:
    // ✓ User creation succeeds
    // ✓ OTP generation succeeds
    // ✓ sendOTPEmail() called
    // ✓ emailResult.success === false (condition TRUE)
    // ✓ if (!emailResult.success) → TRUE branch
    // ✓ Warning message returned
    // ✓ OTP included in dev mode
  });
});
```

**Step 3: Run Test**

```bash
npm run test:once -- TC-WB-MC-001
```

**Step 4: Manual Testing**

```bash
# Make sure .env has invalid SMTP settings or disconnect network
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@test.com",
    "password": "Pass123!",
    "role": "patient"
  }'
```

**Expected Output (Email Service Failed):**

```json
{
  "success": true,
  "message": "Registration successful. Email service temporarily unavailable. Please contact support for OTP.",
  "data": {
    "email": "test@test.com",
    "role": "patient",
    "requiresVerification": true,
    "otp": "234567"
  }
}
```

**Condition Coverage Matrix:**
| Condition | Value | Branch Taken |
|-----------|-------|--------------|
| User created | TRUE | Continue |
| OTP generated | TRUE | Continue |
| emailResult.success | FALSE | Enter if block |
| NODE_ENV === 'development' | TRUE | Include OTP |

**Related Files:**

- Test File: `backend/tests/TC-WB-MC-001.test.js`
- Controller: `backend/src/controllers/authController.js` (register function, lines ~115-127)
- Email Service: `backend/src/services/emailService.js`

---

### TC-WB-PC-001: Path Coverage

#### Test Case Details

| Field                                 | Value                                                                                                                                                                                                                                      |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Test_Case_ID**                      | TC-WB-PC-001                                                                                                                                                                                                                               |
| **Technique**                         | Path Coverage                                                                                                                                                                                                                              |
| **Module**                            | Authentication (Full Flow)                                                                                                                                                                                                                 |
| **Function**                          | register() → verifyOTP() (registration) → login() → verifyOTP() (login)                                                                                                                                                                    |
| **Inputs_or_Setup**                   | Step 1: Register new patient; Step 2: Verify registration OTP; Step 3: Login; Step 4: Verify login OTP                                                                                                                                     |
| **Code*Lines_Executed*(Description)** | Complete path: User creation → isEmailVerified=false → OTP sent → OTP verification → isEmailVerified=true → welcome email → login request → credentials valid → login OTP sent → login OTP verified → JWT token issued → lastLogin updated |
| **Expected_Output**                   | Final: Status 200, {"success": true, "message": "Login successful", user data, JWT cookie set}                                                                                                                                             |
| **Request_Method**                    | POST (multiple calls)                                                                                                                                                                                                                      |
| **Request_URL**                       | /api/auth/register → /api/auth/verify-otp → /api/auth/login → /api/auth/verify-otp                                                                                                                                                         |
| **Request_Body**                      | Multi-step (see description)                                                                                                                                                                                                               |
| **DB_Preconditions**                  | No existing user, clean state                                                                                                                                                                                                              |

#### How to Test

**Step 1: Create Integration Test File**

Create file: `backend/tests/TC-WB-PC-001.test.js`

```javascript
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "../src/routes/auth.js";
import Patient from "../src/models/Patient.js";
import OTP from "../src/models/OTP.js";

describe("TC-WB-PC-001: Path Coverage - Complete Authentication Flow", () => {
  let mongoServer;
  let app;
  let registrationOTP;
  let loginOTP;
  const testEmail = "pathtest@test.com";

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use("/api/auth", authRoutes);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("should execute complete path: register → verify → login → verify", async () => {
    // ========== PATH STEP 1: REGISTRATION ==========
    console.log("Step 1: Register new patient");
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Path Test User",
        email: testEmail,
        password: "PathTest123!",
        role: "patient",
      })
      .expect(201);

    expect(registerResponse.body.success).toBe(true);
    expect(registerResponse.body.data.requiresVerification).toBe(true);

    // Verify user created with isEmailVerified: false
    let user = await Patient.findOne({ email: testEmail });
    expect(user.isEmailVerified).toBe(false);

    // Get OTP from database
    let otpDoc = await OTP.findOne({
      email: testEmail,
      purpose: "registration",
    });
    registrationOTP = otpDoc.otp;
    console.log(`Registration OTP: ${registrationOTP}`);

    // ========== PATH STEP 2: VERIFY REGISTRATION OTP ==========
    console.log("Step 2: Verify registration OTP");
    const verifyRegResponse = await request(app)
      .post("/api/auth/verify-otp")
      .send({
        email: testEmail,
        otp: registrationOTP,
        role: "patient",
        purpose: "registration",
      })
      .expect(200);

    expect(verifyRegResponse.body.success).toBe(true);
    expect(verifyRegResponse.body.message).toContain(
      "Email verified successfully"
    );

    // Verify isEmailVerified set to true
    user = await Patient.findOne({ email: testEmail });
    expect(user.isEmailVerified).toBe(true);
    expect(user.emailVerifiedAt).toBeDefined();

    // ========== PATH STEP 3: LOGIN ==========
    console.log("Step 3: Login with credentials");
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: testEmail,
        password: "PathTest123!",
        role: "patient",
      })
      .expect(200);

    expect(loginResponse.body.success).toBe(true);
    expect(loginResponse.body.message).toContain("OTP sent");
    expect(loginResponse.body.requiresOTP).toBe(true);

    // Get login OTP
    otpDoc = await OTP.findOne({
      email: testEmail,
      purpose: "login",
    });
    loginOTP = otpDoc.otp;
    console.log(`Login OTP: ${loginOTP}`);

    // ========== PATH STEP 4: VERIFY LOGIN OTP ==========
    console.log("Step 4: Verify login OTP");
    const verifyLoginResponse = await request(app)
      .post("/api/auth/verify-otp")
      .send({
        email: testEmail,
        otp: loginOTP,
        role: "patient",
        purpose: "login",
      })
      .expect(200);

    expect(verifyLoginResponse.body.success).toBe(true);
    expect(verifyLoginResponse.body.message).toBe("Login successful");
    expect(verifyLoginResponse.body.data).toBeDefined();
    expect(verifyLoginResponse.body.loginInfo).toBeDefined();

    // Verify JWT cookie set
    const cookies = verifyLoginResponse.headers["set-cookie"];
    expect(cookies).toBeDefined();
    const tokenCookie = cookies.find((c) => c.startsWith("token="));
    expect(tokenCookie).toBeDefined();

    // Verify lastLogin updated
    user = await Patient.findOne({ email: testEmail });
    expect(user.lastLogin).toBeDefined();

    // ========== COMPLETE PATH COVERAGE ACHIEVED ==========
    console.log("✓ Complete path executed successfully");
    console.log("Path nodes covered:");
    console.log("  1. User creation (isEmailVerified: false)");
    console.log("  2. Registration OTP sent");
    console.log("  3. OTP verification (registration)");
    console.log("  4. isEmailVerified set to true");
    console.log("  5. Welcome email sent");
    console.log("  6. Login request");
    console.log("  7. Credentials validated");
    console.log("  8. Login OTP sent");
    console.log("  9. Login OTP verified");
    console.log(" 10. JWT token issued");
    console.log(" 11. lastLogin timestamp updated");
  });
});
```

**Step 2: Run Test**

```bash
npm run test:once -- TC-WB-PC-001
```

**Step 3: Manual Testing (Sequential Steps)**

```bash
# Step 1: Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Path Test User",
    "email": "pathtest@test.com",
    "password": "PathTest123!",
    "role": "patient"
  }'
# Note the OTP from response (in dev mode) or check database

# Step 2: Verify Registration OTP
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pathtest@test.com",
    "otp": "123456",
    "role": "patient",
    "purpose": "registration"
  }'

# Step 3: Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pathtest@test.com",
    "password": "PathTest123!",
    "role": "patient"
  }'
# Note the OTP from response

# Step 4: Verify Login OTP
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "pathtest@test.com",
    "otp": "654321",
    "role": "patient",
    "purpose": "login"
  }'
```

**Path Diagram:**

```
START
  ↓
[Register] → User Created (isEmailVerified=false)
  ↓
[OTP Generated & Sent]
  ↓
[Verify Registration OTP] → isEmailVerified=true
  ↓
[Welcome Email Sent]
  ↓
[Login Request] → Credentials Valid
  ↓
[Login OTP Generated & Sent]
  ↓
[Verify Login OTP] → JWT Token Issued
  ↓
[lastLogin Updated]
  ↓
END (User Authenticated)
```

**Related Files:**

- Test File: `backend/tests/TC-WB-PC-001.test.js`
- Controllers: `backend/src/controllers/authController.js` (register, verifyOTP, login)
- Models: `backend/src/models/Patient.js`, `backend/src/models/OTP.js`

---

### TC-WB-DF-001: Data Flow-Based Testing

#### Test Case Details

| Field                                 | Value                                                                                                                                                                                                                       |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test_Case_ID**                      | TC-WB-DF-001                                                                                                                                                                                                                |
| **Technique**                         | Data Flow-Based Testing                                                                                                                                                                                                     |
| **Module**                            | Admin Model                                                                                                                                                                                                                 |
| **Function**                          | Admin.create() → pre('save') → comparePassword()                                                                                                                                                                            |
| **Inputs_or_Setup**                   | Create admin with plaintext password, then login with same password                                                                                                                                                         |
| **Code*Lines_Executed*(Description)** | DU chain: password variable defined at Admin.create({password: "plaintext"}) → DEFINITION in pre-save hook: `this.password = hashedPassword` → USE in comparePassword: `bcryptjs.compare(candidatepassword, this.password)` |
| **Expected_Output**                   | Password hashed correctly, comparePassword returns true for correct plaintext, login succeeds                                                                                                                               |
| **Request_Method**                    | POST                                                                                                                                                                                                                        |
| **Request_URL**                       | http://localhost:5000/api/auth/admin/login                                                                                                                                                                                  |
| **Request_Body**                      | `{"email": "admin@healthconnect.com", "password": "#1ap@NITK"}`                                                                                                                                                             |
| **DB_Preconditions**                  | Admin created with password field                                                                                                                                                                                           |

#### How to Test

**Step 1: Understand the Data Flow**

```
Data Flow Diagram:

DEFINITION POINTS:
[D1] Admin.create({ password: "#1ap@NITK" })
      ↓
[D2] pre('save') middleware: this.password = bcryptjs.hash("#1ap@NITK", 12)
      ↓ (stored in DB as hash)

USE POINTS:
[U1] adminLogin(): admin.comparePassword(candidatePassword)
      ↓
[U2] bcryptjs.compare(candidatePassword, this.password)
      ↓
[RESULT] Returns true/false

DU-Chain: D1 → D2 → U1 → U2
```

**Step 2: Create Test File**

Create file: `backend/tests/TC-WB-DF-001.test.js`

```javascript
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import express from "express";
import bcryptjs from "bcryptjs";
import Admin from "../src/models/Admin.js";
import authRoutes from "../src/routes/auth.js";

describe("TC-WB-DF-001: Data Flow - Password Hash Chain", () => {
  let mongoServer;
  let app;
  const plainPassword = "#1ap@NITK";
  const adminEmail = "dataflow@test.com";

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    app = express();
    app.use(express.json());
    app.use("/api/auth", authRoutes);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("should trace password data flow from definition to comparison", async () => {
    // ========== DEFINITION POINT D1 ==========
    console.log("D1: Create admin with plaintext password");
    const admin = new Admin({
      name: "Data Flow Admin",
      email: adminEmail,
      password: plainPassword, // DEFINITION D1
      role: "admin",
      isActive: true,
    });

    // Before save - password is plaintext
    expect(admin.password).toBe(plainPassword);
    console.log(`Password before save: ${admin.password}`);

    // ========== DEFINITION POINT D2 ==========
    console.log("D2: Save admin (triggers pre-save hook)");
    await admin.save(); // Triggers pre('save') middleware

    // After save - password should be hashed
    const savedAdmin = await Admin.findOne({ email: adminEmail }).select(
      "+password"
    );
    expect(savedAdmin.password).not.toBe(plainPassword);
    expect(savedAdmin.password).toMatch(/^\$2[aby]\$\d{2}\$/); // bcryptjs format
    console.log(
      `Password after save (hashed): ${savedAdmin.password.substring(0, 20)}...`
    );

    // Verify hash was created with correct rounds
    const rounds = bcryptjs.getRounds(savedAdmin.password);
    expect(rounds).toBe(12);
    console.log(`Hash rounds: ${rounds}`);

    // ========== USE POINT U1 & U2 ==========
    console.log("U1 & U2: Login using comparePassword method");

    // Test with CORRECT password (should return true)
    const isCorrect = await savedAdmin.comparePassword(plainPassword);
    expect(isCorrect).toBe(true);
    console.log(`comparePassword(correct): ${isCorrect}`);

    // Test with WRONG password (should return false)
    const isWrong = await savedAdmin.comparePassword("WrongPassword");
    expect(isWrong).toBe(false);
    console.log(`comparePassword(wrong): ${isWrong}`);

    // ========== INTEGRATION TEST: Login Endpoint ==========
    console.log("Integration: Test login endpoint with data flow");
    const loginResponse = await request(app)
      .post("/api/auth/admin/login")
      .send({
        email: adminEmail,
        password: plainPassword,
      })
      .expect(200);

    expect(loginResponse.body.success).toBe(true);
    expect(loginResponse.body.message).toBe("Login successful");
    expect(loginResponse.body.user.email).toBe(adminEmail);

    // ========== DATA FLOW COVERAGE ACHIEVED ==========
    console.log("\n✓ Complete DU-chain traced:");
    console.log('  D1: password = "#1ap@NITK" (plaintext)');
    console.log("  D2: this.password = hash(plaintext, 12)");
    console.log("  U1: comparePassword(candidatePassword)");
    console.log("  U2: bcryptjs.compare(candidate, this.password)");
    console.log("  ✓ DU-chain: D1 → D2 → U1 → U2 verified");
  });

  it("should verify password is never stored in plaintext", async () => {
    // Create another admin
    const admin2 = await Admin.create({
      name: "Security Test",
      email: "security@test.com",
      password: "PlainTextPassword",
      role: "admin",
      isActive: true,
    });

    // Fetch from DB with password field
    const fromDB = await Admin.findById(admin2._id).select("+password");

    // Password should be hashed, never plaintext
    expect(fromDB.password).not.toBe("PlainTextPassword");
    expect(fromDB.password.length).toBeGreaterThan(50); // Hash is long

    console.log("✓ Password security verified: never stored as plaintext");
  });
});
```

**Step 3: Run Test**

```bash
npm run test:once -- TC-WB-DF-001
```

**Step 4: Manual Data Flow Verification**

```javascript
// In MongoDB shell or Compass:
use medical_app;

// 1. Create admin (D1 - Definition)
db.admins.insertOne({
  name: "Manual Test Admin",
  email: "manual@test.com",
  password: "PlaintextPassword123",
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});
// Note: Direct DB insert bypasses pre-save hook!
// Password will be stored as plaintext (BAD!)

// 2. Create admin via application (D2 - Hash Definition)
// Use npm run create-admin or API endpoint
// Password will be hashed by pre-save middleware (GOOD!)

// 3. Check stored password format
db.admins.findOne({ email: "admin@healthconnect.com" });
// password field should start with $2a$12$ (bcryptjs hash)

// 4. Test comparePassword (U1, U2 - Usage)
// Login via API - internally calls comparePassword method
```

**Step 5: Trace Data Flow with Logging**

Add temporary logs to `backend/src/models/Admin.js`:

```javascript
// In pre('save') middleware
adminSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    console.log("[D1] Original password:", this.password); // DEFINITION D1
    const hashedPassword = await bcryptjs.hash(this.password, 12);
    console.log(
      "[D2] Hashed password:",
      hashedPassword.substring(0, 20) + "..."
    ); // DEFINITION D2
    this.password = hashedPassword;
  }
  next();
});

// In comparePassword method
adminSchema.methods.comparePassword = async function (candidatepassword) {
  console.log("[U1] Comparing candidate with stored hash"); // USE U1
  const result = await bcryptjs.compare(candidatepassword, this.password); // USE U2
  console.log("[U2] Comparison result:", result);
  return result;
};
```

**Data Flow Variables Table:**

| Variable             | Definition Point | Use Point         | Value at Definition | Value at Use    |
| -------------------- | ---------------- | ----------------- | ------------------- | --------------- |
| password (plaintext) | Admin.create()   | pre('save')       | "#1ap@NITK"         | "#1ap@NITK"     |
| this.password (hash) | pre('save')      | comparePassword() | "$2a$12$abc..."     | "$2a$12$abc..." |
| candidatePassword    | Login request    | comparePassword() | "#1ap@NITK"         | "#1ap@NITK"     |

**Expected Test Output:**

```
D1: Create admin with plaintext password
Password before save: #1ap@NITK

D2: Save admin (triggers pre-save hook)
Password after save (hashed): $2a$12$vF3kL9mN2p...
Hash rounds: 12

U1 & U2: Login using comparePassword method
comparePassword(correct): true
comparePassword(wrong): false

Integration: Test login endpoint with data flow
✓ Login successful

✓ Complete DU-chain traced:
  D1: password = "#1ap@NITK" (plaintext)
  D2: this.password = hash(plaintext, 12)
  U1: comparePassword(candidatePassword)
  U2: bcryptjs.compare(candidate, this.password)
  ✓ DU-chain: D1 → D2 → U1 → U2 verified
```

**Related Files:**

- Test File: `backend/tests/TC-WB-DF-001.test.js`
- Model: `backend/src/models/Admin.js` (pre-save hook lines ~35-42, comparePassword method lines ~44-46)
- Controller: `backend/src/controllers/authController.js` (adminLogin function)

---

## Summary

### Test Execution Overview

| Test Case ID  | Technique                      | Execution Method      | Estimated Time |
| ------------- | ------------------------------ | --------------------- | -------------- |
| TC-BB-ECP-001 | Equivalence Class Partitioning | Manual (Postman/cURL) | 2 minutes      |
| TC-BB-BVA-001 | Boundary Value Analysis        | Manual (cURL)         | 3 minutes      |
| TC-WB-SC-001  | Statement Coverage             | Automated (Jest)      | 5 minutes      |
| TC-WB-BC-001  | Branch Coverage                | Automated (Jest)      | 5 minutes      |
| TC-WB-MC-001  | Multiple Condition Coverage    | Automated (Jest)      | 5 minutes      |
| TC-WB-PC-001  | Path Coverage                  | Automated (Jest)      | 8 minutes      |
| TC-WB-DF-001  | Data Flow-Based Testing        | Automated (Jest)      | 7 minutes      |

### Quick Start Commands

```bash
# Setup
cd backend
npm install

# Create admin account
npm run create-admin

# Run all white-box tests
npm run test:once

# Run specific test
npm run test:once -- TC-WB-SC-001

# Run with coverage
npm run test:coverage

# Start server for manual testing
npm run dev
```

### Tools Required

- **Node.js** (v16+)
- **MongoDB** (local or Atlas)
- **Postman** or **cURL** (for manual tests)
- **Jest & Supertest** (for automated tests)

### Key Learning Points

1. **Black-Box Testing**: Focuses on inputs/outputs without code knowledge
2. **White-Box Testing**: Requires understanding of internal code structure
3. **Coverage Metrics**: Statement, Branch, Condition, Path, Data Flow
4. **Test Automation**: Use Jest for repeatable, fast test execution
5. **Integration Testing**: Test complete user flows end-to-end

---

**End of Document**
