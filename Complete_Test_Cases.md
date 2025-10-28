# Complete Test Cases for Health-Connect Application

**Date:** October 28, 2025  
**Project:** Health-Connect MERN Application  
**Total Test Cases:** 35 (10 Black-Box + 25 White-Box)

---

## BLACK-BOX TEST CASES (10 Total)

### A. Equivalence Class Partitioning (5 Test Cases)

#### TC-BB-ECP-001: Admin Login with Valid Credentials (Valid Class)

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

---

#### TC-BB-ECP-002: Admin Login with Invalid Email (Invalid Class)

| Field                | Value                                                               |
| -------------------- | ------------------------------------------------------------------- |
| **Test_Case_ID**     | TC-BB-ECP-002                                                       |
| **Technique**        | Equivalence Class Partitioning                                      |
| **Module**           | Admin Authentication                                                |
| **Input_Field**      | email, password                                                     |
| **Boundary_Checked** | No                                                                  |
| **Test_Value**       | email: "nonexistent@admin.com", password: "SomePassword123"         |
| **Expected_Result**  | Status 401, error message: "Invalid credentials"                    |
| **Request_Method**   | POST                                                                |
| **Request_URL**      | http://localhost:5000/api/auth/admin/login                          |
| **Request_Body**     | `{"email": "nonexistent@admin.com", "password": "SomePassword123"}` |
| **DB_Preconditions** | No admin account exists with email "nonexistent@admin.com"          |

---

#### TC-BB-ECP-003: Doctor Registration with Valid Data (Valid Class)

| Field                | Value                                                                                                                                                                                          |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test_Case_ID**     | TC-BB-ECP-003                                                                                                                                                                                  |
| **Technique**        | Equivalence Class Partitioning                                                                                                                                                                 |
| **Module**           | Doctor Registration                                                                                                                                                                            |
| **Input_Field**      | name, email, password, role, specialization, experience, qualification                                                                                                                         |
| **Boundary_Checked** | No                                                                                                                                                                                             |
| **Test_Value**       | name: "Dr. Sarah Johnson", email: "sarah.j@hospital.com", password: "SecurePass123!", role: "doctor", specialization: "Cardiology", experience: 8, qualification: "MD, MBBS"                   |
| **Expected_Result**  | Status 201, registration successful, OTP sent to email, user created with isEmailVerified=false                                                                                                |
| **Request_Method**   | POST                                                                                                                                                                                           |
| **Request_URL**      | http://localhost:5000/api/auth/register                                                                                                                                                        |
| **Request_Body**     | `{"name": "Dr. Sarah Johnson", "email": "sarah.j@hospital.com", "password": "SecurePass123!", "role": "doctor", "specialization": "Cardiology", "experience": 8, "qualification": "MD, MBBS"}` |
| **DB_Preconditions** | No existing doctor or patient with email "sarah.j@hospital.com"                                                                                                                                |

---

#### TC-BB-ECP-004: Patient Registration with Invalid Role (Invalid Class)

| Field                | Value                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Test_Case_ID**     | TC-BB-ECP-004                                                                                                       |
| **Technique**        | Equivalence Class Partitioning                                                                                      |
| **Module**           | Patient Registration                                                                                                |
| **Input_Field**      | role                                                                                                                |
| **Boundary_Checked** | No                                                                                                                  |
| **Test_Value**       | name: "John Doe", email: "john.doe@email.com", password: "Pass1234!", role: "admin" (invalid role for registration) |
| **Expected_Result**  | Status 400, validation error for invalid role (only "doctor" or "patient" allowed in registration)                  |
| **Request_Method**   | POST                                                                                                                |
| **Request_URL**      | http://localhost:5000/api/auth/register                                                                             |
| **Request_Body**     | `{"name": "John Doe", "email": "john.doe@email.com", "password": "Pass1234!", "role": "admin"}`                     |
| **DB_Preconditions** | None                                                                                                                |

---

#### TC-BB-ECP-005: Appointment Booking with Valid Time Slot (Valid Class)

| Field                | Value                                                                                                                                                      |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test_Case_ID**     | TC-BB-ECP-005                                                                                                                                              |
| **Technique**        | Equivalence Class Partitioning                                                                                                                             |
| **Module**           | Appointment Management                                                                                                                                     |
| **Input_Field**      | doctorId, patientId, date, time, reason                                                                                                                    |
| **Boundary_Checked** | No                                                                                                                                                         |
| **Test_Value**       | doctorId: "507f1f77bcf86cd799439011", patientId: "507f1f77bcf86cd799439012", date: "2025-11-05", time: "10:00 AM", reason: "Regular checkup"               |
| **Expected_Result**  | Status 201, appointment created successfully, appointment ID returned                                                                                      |
| **Request_Method**   | POST                                                                                                                                                       |
| **Request_URL**      | http://localhost:5000/api/appointments                                                                                                                     |
| **Request_Body**     | `{"doctorId": "507f1f77bcf86cd799439011", "patientId": "507f1f77bcf86cd799439012", "date": "2025-11-05", "time": "10:00 AM", "reason": "Regular checkup"}` |
| **DB_Preconditions** | Doctor with ID exists and isActive=true, Patient with ID exists and isEmailVerified=true, Time slot is available                                           |

---

### B. Boundary Value Analysis (5 Test Cases)

#### TC-BB-BVA-001: OTP Verification with Minimum Boundary (000000)

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

---

#### TC-BB-BVA-002: OTP Verification with Maximum Boundary (999999)

| Field                | Value                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| **Test_Case_ID**     | TC-BB-BVA-002                                                                                     |
| **Technique**        | Boundary Value Analysis                                                                           |
| **Module**           | OTP Verification                                                                                  |
| **Input_Field**      | otp                                                                                               |
| **Boundary_Checked** | Yes - Maximum 6-digit OTP value                                                                   |
| **Test_Value**       | email: "doctor@test.com", otp: "999999", role: "doctor", purpose: "login"                         |
| **Expected_Result**  | Status 400, OTP verification fails (invalid OTP - unless this is the actual OTP generated)        |
| **Request_Method**   | POST                                                                                              |
| **Request_URL**      | http://localhost:5000/api/auth/verify-otp                                                         |
| **Request_Body**     | `{"email": "doctor@test.com", "otp": "999999", "role": "doctor", "purpose": "login"}`             |
| **DB_Preconditions** | OTP exists for email "doctor@test.com" with purpose "login", OTP value is different from "999999" |

---

#### TC-BB-BVA-003: Doctor Experience at Lower Boundary (0 years)

| Field                | Value                                                                                                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test_Case_ID**     | TC-BB-BVA-003                                                                                                                                                                               |
| **Technique**        | Boundary Value Analysis                                                                                                                                                                     |
| **Module**           | Doctor Registration                                                                                                                                                                         |
| **Input_Field**      | experience                                                                                                                                                                                  |
| **Boundary_Checked** | Yes - Minimum experience value (0)                                                                                                                                                          |
| **Test_Value**       | name: "Dr. Fresh Graduate", email: "newdoc@hospital.com", password: "Pass1234!", role: "doctor", specialization: "General Medicine", experience: 0, qualification: "MBBS"                   |
| **Expected_Result**  | Status 201, registration successful with experience=0, OTP sent                                                                                                                             |
| **Request_Method**   | POST                                                                                                                                                                                        |
| **Request_URL**      | http://localhost:5000/api/auth/register                                                                                                                                                     |
| **Request_Body**     | `{"name": "Dr. Fresh Graduate", "email": "newdoc@hospital.com", "password": "Pass1234!", "role": "doctor", "specialization": "General Medicine", "experience": 0, "qualification": "MBBS"}` |
| **DB_Preconditions** | No existing user with email "newdoc@hospital.com"                                                                                                                                           |

---

#### TC-BB-BVA-004: Doctor Experience at Upper Boundary (50 years)

| Field                | Value                                                       |
| -------------------- | ----------------------------------------------------------- |
| **Test_Case_ID**     | TC-BB-BVA-004                                               |
| **Technique**        | Boundary Value Analysis                                     |
| **Module**           | Doctor Profile Update                                       |
| **Input_Field**      | experience                                                  |
| **Boundary_Checked** | Yes - High experience value (50)                            |
| **Test_Value**       | experience: 50                                              |
| **Expected_Result**  | Status 200, profile updated successfully with experience=50 |
| **Request_Method**   | PUT                                                         |
| **Request_URL**      | http://localhost:5000/api/doctors/profile                   |
| **Request_Body**     | `{"experience": 50}`                                        |
| **DB_Preconditions** | Authenticated doctor user exists, valid JWT token in cookie |

---

#### TC-BB-BVA-005: Password Reset with OTP at Expiry Boundary (10 minutes)

| Field                | Value                                                                                                                                               |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test_Case_ID**     | TC-BB-BVA-005                                                                                                                                       |
| **Technique**        | Boundary Value Analysis                                                                                                                             |
| **Module**           | Password Reset                                                                                                                                      |
| **Input_Field**      | otp (time boundary)                                                                                                                                 |
| **Boundary_Checked** | Yes - OTP expiry time (10 minutes)                                                                                                                  |
| **Test_Value**       | email: "patient@test.com", otp: "123456" (created exactly 10 minutes ago), password: "NewPass123!", confirmPassword: "NewPass123!", role: "patient" |
| **Expected_Result**  | Status 400, OTP expired error message                                                                                                               |
| **Request_Method**   | POST                                                                                                                                                |
| **Request_URL**      | http://localhost:5000/api/auth/reset-password                                                                                                       |
| **Request_Body**     | `{"email": "patient@test.com", "otp": "123456", "password": "NewPass123!", "confirmPassword": "NewPass123!", "role": "patient"}`                    |
| **DB_Preconditions** | OTP exists with email "patient@test.com", expiresAt timestamp is exactly 10 minutes old                                                             |

---

## WHITE-BOX TEST CASES (25 Total)

### A. Statement Coverage (5 Test Cases)

#### TC-WB-SC-001: Execute Email Verification Statement in Registration

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

---

#### TC-WB-SC-002: Execute Password Hashing Statement in Admin Model

| Field                                 | Value                                                                                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test_Case_ID**                      | TC-WB-SC-002                                                                                                                                |
| **Technique**                         | Statement Coverage                                                                                                                          |
| **Module**                            | Admin Management                                                                                                                            |
| **Function**                          | pre('save') middleware in Admin.js                                                                                                          |
| **Inputs_or_Setup**                   | Create/update admin with password field modified                                                                                            |
| **Code*Lines_Executed*(Description)** | Pre-save hook checking `this.isModified('password')`, bcryptjs.hash() call with salt rounds=12, assignment `this.password = hashedPassword` |
| **Expected_Output**                   | Password stored in DB is hashed (not plaintext), hash starts with "$2a$12$" (bcryptjs format)                                               |
| **Request_Method**                    | POST                                                                                                                                        |
| **Request_URL**                       | http://localhost:5000/api/auth/admin/login (after admin creation)                                                                           |
| **Request_Body**                      | `{"email": "admin@healthconnect.com", "password": "#1ap@NITK"}`                                                                             |
| **DB_Preconditions**                  | Admin created via createTestAdmin.js script                                                                                                 |

---

#### TC-WB-SC-003: Execute Account Suspension Check Statement in Login

| Field                                 | Value                                                                                                                                                                      |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test_Case_ID**                      | TC-WB-SC-003                                                                                                                                                               |
| **Technique**                         | Statement Coverage                                                                                                                                                         |
| **Module**                            | Authentication                                                                                                                                                             |
| **Function**                          | login() in authController.js                                                                                                                                               |
| **Inputs_or_Setup**                   | POST request with credentials for a suspended user (isActive=false)                                                                                                        |
| **Code*Lines_Executed*(Description)** | User lookup, email verification check, statement `if (!user.isActive)`, logAuthEvent with failureReason='Account suspended', response with status 403 and suspensionReason |
| **Expected_Output**                   | Status 403, {"success": false, "message": "Account suspended", "suspended": true, "suspensionReason": "Your account has been suspended..."}                                |
| **Request_Method**                    | POST                                                                                                                                                                       |
| **Request_URL**                       | http://localhost:5000/api/auth/login                                                                                                                                       |
| **Request_Body**                      | `{"email": "suspended@test.com", "password": "Pass123!", "role": "doctor"}`                                                                                                |
| **DB_Preconditions**                  | Doctor with email "suspended@test.com" exists, isEmailVerified=true, isActive=false                                                                                        |

---

#### TC-WB-SC-004: Execute OTP Rate Limiting Statement in Login

| Field                                 | Value                                                                                                                                                         |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test_Case_ID**                      | TC-WB-SC-004                                                                                                                                                  |
| **Technique**                         | Statement Coverage                                                                                                                                            |
| **Module**                            | Authentication                                                                                                                                                |
| **Function**                          | login() in authController.js                                                                                                                                  |
| **Inputs_or_Setup**                   | Valid credentials, but multiple recent OTP requests already sent (rate limit exceeded)                                                                        |
| **Code*Lines_Executed*(Description)** | Credential validation passes, statement `OTP.checkRateLimit(email, 'login')`, condition `if (!rateLimitCheck.allowed)`, response with status 429 and waitTime |
| **Expected_Output**                   | Status 429, {"success": false, "message": "Please wait X seconds before requesting a new OTP", "waitTime": X}                                                 |
| **Request_Method**                    | POST                                                                                                                                                          |
| **Request_URL**                       | http://localhost:5000/api/auth/login                                                                                                                          |
| **Request_Body**                      | `{"email": "patient@test.com", "password": "CorrectPass123!", "role": "patient"}`                                                                             |
| **DB_Preconditions**                  | Patient exists with correct credentials, multiple OTP records exist within rate limit window                                                                  |

---

#### TC-WB-SC-005: Execute Last Login Timestamp Update Statement

| Field                                 | Value                                                                                                                                                                                                                 |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test_Case_ID**                      | TC-WB-SC-005                                                                                                                                                                                                          |
| **Technique**                         | Statement Coverage                                                                                                                                                                                                    |
| **Module**                            | Authentication                                                                                                                                                                                                        |
| **Function**                          | verifyOTP() for login in authController.js                                                                                                                                                                            |
| **Inputs_or_Setup**                   | Valid OTP for login purpose                                                                                                                                                                                           |
| **Code*Lines_Executed*(Description)** | OTP verification succeeds, purpose=='login' branch, statements: `previousLoginTime = user.lastLogin`, `user.lastLogin = new Date()`, `await user.save()`, `await generateToken()`, response includes loginInfo object |
| **Expected_Output**                   | User lastLogin field updated in DB, response includes {"loginInfo": {"previousLogin": <timestamp>, "lastLogout": <timestamp>}}                                                                                        |
| **Request_Method**                    | POST                                                                                                                                                                                                                  |
| **Request_URL**                       | http://localhost:5000/api/auth/verify-otp                                                                                                                                                                             |
| **Request_Body**                      | `{"email": "doctor@test.com", "otp": "123456", "role": "doctor", "purpose": "login"}`                                                                                                                                 |
| **DB_Preconditions**                  | Valid OTP exists for email "doctor@test.com" with purpose "login", doctor exists and isEmailVerified=true                                                                                                             |

---

### B. Branch Coverage (5 Test Cases)

#### TC-WB-BC-001: Branch Coverage for Email Already Exists in Registration

| Field                                 | Value                                                                                                 |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------- | --- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Test_Case_ID**                      | TC-WB-BC-001                                                                                          |
| **Technique**                         | Branch Coverage                                                                                       |
| **Module**                            | Authentication                                                                                        |
| **Function**                          | register() in authController.js                                                                       |
| **Inputs_or_Setup**                   | POST request with email that already exists in Doctor or Patient collection                           |
| **Code*Lines_Executed*(Description)** | Lookup for existingDoctor and existingPatient, branch `if (existingDoctor                             |     | existingPatient)` evaluates to TRUE, logAuthEvent with failureReason='Email already registered', early return with 400 status |
| **Expected_Output**                   | Status 400, {"success": false, "message": "User already exists with this email"}                      |
| **Request_Method**                    | POST                                                                                                  |
| **Request_URL**                       | http://localhost:5000/api/auth/register                                                               |
| **Request_Body**                      | `{"name": "Duplicate User", "email": "existing@test.com", "password": "Pass123!", "role": "patient"}` |
| **DB_Preconditions**                  | Patient or Doctor with email "existing@test.com" already exists                                       |

---

#### TC-WB-BC-002: Branch Coverage for Password Match Validation in comparePassword

| Field                                 | Value                                                                                                                                                     |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test_Case_ID**                      | TC-WB-BC-002                                                                                                                                              |
| **Technique**                         | Branch Coverage                                                                                                                                           |
| **Module**                            | Admin Authentication                                                                                                                                      |
| **Function**                          | comparePassword() method in Admin.js, called from adminLogin()                                                                                            |
| **Inputs_or_Setup**                   | Two scenarios: (1) Correct password (branch TRUE), (2) Incorrect password (branch FALSE)                                                                  |
| **Code*Lines_Executed*(Description)** | Method `comparePassword(candidatepassword)`, bcryptjs.compare() returns boolean, if TRUE: authentication succeeds, if FALSE: returns 401 error            |
| **Expected_Output**                   | Scenario 1 (correct): Status 200, login successful; Scenario 2 (incorrect): Status 401, "Invalid credentials"                                             |
| **Request_Method**                    | POST                                                                                                                                                      |
| **Request_URL**                       | http://localhost:5000/api/auth/admin/login                                                                                                                |
| **Request_Body**                      | Scenario 1: `{"email": "admin@healthconnect.com", "password": "#1ap@NITK"}` / Scenario 2: `{"email": "admin@healthconnect.com", "password": "WrongPass"}` |
| **DB_Preconditions**                  | Admin exists with email "admin@healthconnect.com" and correct hashed password                                                                             |

---

#### TC-WB-BC-003: Branch Coverage for OTP Purpose (Registration vs Login)

| Field                                 | Value                                                                                                                                                                                                                                 |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test_Case_ID**                      | TC-WB-BC-003                                                                                                                                                                                                                          |
| **Technique**                         | Branch Coverage                                                                                                                                                                                                                       |
| **Module**                            | OTP Verification                                                                                                                                                                                                                      |
| **Function**                          | verifyOTP() in authController.js                                                                                                                                                                                                      |
| **Inputs_or_Setup**                   | Two scenarios: (1) purpose="registration", (2) purpose="login"                                                                                                                                                                        |
| **Code*Lines_Executed*(Description)** | OTP verified successfully, branch `if (purpose === 'registration')`: sets isEmailVerified=true, sends welcome email, returns user data; branch `if (purpose === 'login')`: updates lastLogin, generates JWT token, returns login info |
| **Expected_Output**                   | Scenario 1 (registration): Email verified, welcome email sent, message "Email verified successfully! You can now login."; Scenario 2 (login): JWT cookie set, message "Login successful", loginInfo included                          |
| **Request_Method**                    | POST                                                                                                                                                                                                                                  |
| **Request_URL**                       | http://localhost:5000/api/auth/verify-otp                                                                                                                                                                                             |
| **Request_Body**                      | Scenario 1: `{"email": "new@test.com", "otp": "123456", "role": "patient", "purpose": "registration"}` / Scenario 2: `{"email": "verified@test.com", "otp": "654321", "role": "doctor", "purpose": "login"}`                          |
| **DB_Preconditions**                  | Scenario 1: Valid registration OTP exists, user isEmailVerified=false; Scenario 2: Valid login OTP exists, user isEmailVerified=true                                                                                                  |

---

#### TC-WB-BC-004: Branch Coverage for Admin Account Active Status

| Field                                 | Value                                                                                                                                                              |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Test_Case_ID**                      | TC-WB-BC-004                                                                                                                                                       |
| **Technique**                         | Branch Coverage                                                                                                                                                    |
| **Module**                            | Admin Authentication                                                                                                                                               |
| **Function**                          | adminLogin() in authController.js                                                                                                                                  |
| **Inputs_or_Setup**                   | Two scenarios: (1) isActive=true (branch TRUE), (2) isActive=false (branch FALSE)                                                                                  |
| **Code*Lines_Executed*(Description)** | Admin found, branch `if (!admin.isActive)`: if TRUE (inactive), return 403 with suspension message; if FALSE (active), proceed to password verification            |
| **Expected_Output**                   | Scenario 1 (active): Proceeds to password check; Scenario 2 (inactive): Status 403, {"success": false, "message": "Account is suspended. Please contact support."} |
| **Request_Method**                    | POST                                                                                                                                                               |
| **Request_URL**                       | http://localhost:5000/api/auth/admin/login                                                                                                                         |
| **Request_Body**                      | `{"email": "admin@healthconnect.com", "password": "#1ap@NITK"}`                                                                                                    |
| **DB_Preconditions**                  | Scenario 1: Admin isActive=true; Scenario 2: Admin isActive=false                                                                                                  |

---

#### TC-WB-BC-005: Branch Coverage for Email Verified Status in Login

| Field                                 | Value                                                                                                                                                                                                              |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Test_Case_ID**                      | TC-WB-BC-005                                                                                                                                                                                                       |
| **Technique**                         | Branch Coverage                                                                                                                                                                                                    |
| **Module**                            | Authentication                                                                                                                                                                                                     |
| **Function**                          | login() in authController.js                                                                                                                                                                                       |
| **Inputs_or_Setup**                   | Two scenarios: (1) isEmailVerified=true (branch FALSE, proceeds), (2) isEmailVerified=false (branch TRUE, blocks login)                                                                                            |
| **Code*Lines_Executed*(Description)** | User found, branch `if (!user.isEmailVerified)`: if TRUE, log failed login, return 400 with requiresVerification; if FALSE, proceed to isActive check                                                              |
| **Expected_Output**                   | Scenario 1 (verified): Proceeds to account status check; Scenario 2 (not verified): Status 400, {"success": false, "message": "Email not verified. Please verify your email first.", "requiresVerification": true} |
| **Request_Method**                    | POST                                                                                                                                                                                                               |
| **Request_URL**                       | http://localhost:5000/api/auth/login                                                                                                                                                                               |
| **Request_Body**                      | `{"email": "test@test.com", "password": "Pass123!", "role": "patient"}`                                                                                                                                            |
| **DB_Preconditions**                  | Scenario 1: Patient isEmailVerified=true; Scenario 2: Patient isEmailVerified=false                                                                                                                                |

---

### C. Multiple Condition Coverage (5 Test Cases)

#### TC-WB-MC-001: Multiple Condition - Email Service Failure During Registration

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

---

#### TC-WB-MC-002: Multiple Condition - Password Reset Limit Exceeded

| Field                                 | Value                                                                                                                                                                                                                |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test_Case_ID**                      | TC-WB-MC-002                                                                                                                                                                                                         |
| **Technique**                         | Multiple Condition Coverage                                                                                                                                                                                          |
| **Module**                            | Password Reset                                                                                                                                                                                                       |
| **Function**                          | forgotPassword() in authController.js                                                                                                                                                                                |
| **Inputs_or_Setup**                   | User who has already used password reset once (passwordResetCount >= 1)                                                                                                                                              |
| **Code*Lines_Executed*(Description)** | User found, conditions `if (user.passwordResetCount && user.passwordResetCount >= 1)` both TRUE, logAuthEvent with failureReason='Password reset limit exceeded', return 403 with resetLimitReached=true             |
| **Expected_Output**                   | Status 403, {"success": false, "message": "Your 1 attempt for password reset has been completed. You cannot reset your password again...", "resetLimitReached": true, "resetCount": 1, "lastResetDate": <timestamp>} |
| **Request_Method**                    | POST                                                                                                                                                                                                                 |
| **Request_URL**                       | http://localhost:5000/api/auth/forgot-password                                                                                                                                                                       |
| **Request_Body**                      | `{"email": "limited@test.com", "role": "patient"}`                                                                                                                                                                   |
| **DB_Preconditions**                  | Patient exists with passwordResetCount=1                                                                                                                                                                             |

---

#### TC-WB-MC-003: Multiple Condition - OTP Expired and Already Used

| Field                                 | Value                                                                                                                                                                                                     |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test_Case_ID**                      | TC-WB-MC-003                                                                                                                                                                                              |
| **Technique**                         | Multiple Condition Coverage                                                                                                                                                                               |
| **Module**                            | Password Reset                                                                                                                                                                                            |
| **Function**                          | resetPassword() in authController.js                                                                                                                                                                      |
| **Inputs_or_Setup**                   | OTP that is both expired (expiresAt < now) AND already verified (verified=true)                                                                                                                           |
| **Code*Lines_Executed*(Description)** | OTP lookup with conditions email, otp, purpose, AND verified=false; query returns null because verified=true, condition `if (!otpDoc)` TRUE, log failed attempt, return 400 "Invalid or already used OTP" |
| **Expected_Output**                   | Status 400, {"success": false, "message": "Invalid, expired, or already used OTP. Please request a new password reset."}                                                                                  |
| **Request_Method**                    | POST                                                                                                                                                                                                      |
| **Request_URL**                       | http://localhost:5000/api/auth/reset-password                                                                                                                                                             |
| **Request_Body**                      | `{"email": "test@test.com", "otp": "123456", "password": "NewPass123!", "confirmPassword": "NewPass123!", "role": "patient"}`                                                                             |
| **DB_Preconditions**                  | OTP exists with verified=true (already used) OR is expired                                                                                                                                                |

---

#### TC-WB-MC-004: Multiple Condition - Change Password with Same New Password

| Field                                 | Value                                                                                                                                                                                                  |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Test_Case_ID**                      | TC-WB-MC-004                                                                                                                                                                                           |
| **Technique**                         | Multiple Condition Coverage                                                                                                                                                                            |
| **Module**                            | Password Change                                                                                                                                                                                        |
| **Function**                          | changePassword() in authController.js                                                                                                                                                                  |
| **Inputs_or_Setup**                   | Authenticated user tries to change password to same current password                                                                                                                                   |
| **Code*Lines_Executed*(Description)** | Current password verified (isPasswordCorrect=true), then `isSamePassword = await user.comparePassword(newPassword)`, condition `if (isSamePassword)` TRUE, return 400 "New password must be different" |
| **Expected_Output**                   | Status 400, {"success": false, "message": "New password must be different from current password"}                                                                                                      |
| **Request_Method**                    | POST                                                                                                                                                                                                   |
| **Request_URL**                       | http://localhost:5000/api/auth/change-password                                                                                                                                                         |
| **Request_Body**                      | `{"currentPassword": "MyPass123!", "newPassword": "MyPass123!"}`                                                                                                                                       |
| **DB_Preconditions**                  | Authenticated patient/doctor with password "MyPass123!", valid JWT token in cookie                                                                                                                     |

---

#### TC-WB-MC-005: Multiple Condition - Passwords Do Not Match in Reset

| Field                                 | Value                                                                                                                               |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Test_Case_ID**                      | TC-WB-MC-005                                                                                                                        |
| **Technique**                         | Multiple Condition Coverage                                                                                                         |
| **Module**                            | Password Reset                                                                                                                      |
| **Function**                          | resetPassword() in authController.js                                                                                                |
| **Inputs_or_Setup**                   | Valid OTP but password and confirmPassword fields do not match                                                                      |
| **Code*Lines_Executed*(Description)** | Condition `if (password !== confirmPassword)` evaluates TRUE, immediate return with 400 status before OTP lookup                    |
| **Expected_Output**                   | Status 400, {"success": false, "message": "Passwords do not match"}                                                                 |
| **Request_Method**                    | POST                                                                                                                                |
| **Request_URL**                       | http://localhost:5000/api/auth/reset-password                                                                                       |
| **Request_Body**                      | `{"email": "test@test.com", "otp": "123456", "password": "NewPass123!", "confirmPassword": "DifferentPass123!", "role": "patient"}` |
| **DB_Preconditions**                  | Valid OTP exists (not checked due to early return)                                                                                  |

---

### D. Path Coverage (5 Test Cases)

#### TC-WB-PC-001: Path Coverage - Successful Registration → OTP → Email Verification → Login

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

---

#### TC-WB-PC-002: Path Coverage - Failed Login Due to Unverified Email

| Field                                 | Value                                                                                                                                                   |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test_Case_ID**                      | TC-WB-PC-002                                                                                                                                            |
| **Technique**                         | Path Coverage                                                                                                                                           |
| **Module**                            | Authentication                                                                                                                                          |
| **Function**                          | login() in authController.js                                                                                                                            |
| **Inputs_or_Setup**                   | User exists with correct password but isEmailVerified=false                                                                                             |
| **Code*Lines_Executed*(Description)** | Path: User found → Password correct (not checked yet) → isEmailVerified check FAILS → logAuthEvent with failureReason → return 400 requiresVerification |
| **Expected_Output**                   | Status 400, {"success": false, "message": "Email not verified. Please verify your email first.", "requiresVerification": true}                          |
| **Request_Method**                    | POST                                                                                                                                                    |
| **Request_URL**                       | http://localhost:5000/api/auth/login                                                                                                                    |
| **Request_Body**                      | `{"email": "unverified@test.com", "password": "Pass123!", "role": "patient"}`                                                                           |
| **DB_Preconditions**                  | Patient with email "unverified@test.com", isEmailVerified=false, password set                                                                           |

---

#### TC-WB-PC-003: Path Coverage - Admin Login → Token Generation → Session Creation

| Field                                 | Value                                                                                                                                                                                                                        |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test_Case_ID**                      | TC-WB-PC-003                                                                                                                                                                                                                 |
| **Technique**                         | Path Coverage                                                                                                                                                                                                                |
| **Module**                            | Admin Authentication                                                                                                                                                                                                         |
| **Function**                          | adminLogin() → generateToken() → Session.create()                                                                                                                                                                            |
| **Inputs_or_Setup**                   | Valid admin credentials                                                                                                                                                                                                      |
| **Code*Lines_Executed*(Description)** | Path: Admin found → isActive=true → Password verified → previousLoginTime captured → lastlogin updated → generateToken called → JWT created → Session record created in DB → Cookie set → loginInfo prepared → Response sent |
| **Expected_Output**                   | Status 200, admin data returned, JWT cookie "token" set, Session record in DB with isActive=true                                                                                                                             |
| **Request_Method**                    | POST                                                                                                                                                                                                                         |
| **Request_URL**                       | http://localhost:5000/api/auth/admin/login                                                                                                                                                                                   |
| **Request_Body**                      | `{"email": "admin@healthconnect.com", "password": "#1ap@NITK"}`                                                                                                                                                              |
| **DB_Preconditions**                  | Admin exists, isActive=true                                                                                                                                                                                                  |

---

#### TC-WB-PC-004: Path Coverage - Forgot Password → Reset Password → Password Changed Email

| Field                                 | Value                                                                                                                                                                                                                                                            |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test_Case_ID**                      | TC-WB-PC-004                                                                                                                                                                                                                                                     |
| **Technique**                         | Path Coverage                                                                                                                                                                                                                                                    |
| **Module**                            | Password Reset                                                                                                                                                                                                                                                   |
| **Function**                          | forgotPassword() → resetPassword() → sendPasswordChangedEmail()                                                                                                                                                                                                  |
| **Inputs_or_Setup**                   | Step 1: Request password reset; Step 2: Submit valid OTP and new password                                                                                                                                                                                        |
| **Code*Lines_Executed*(Description)** | Path: User found → resetCount < 1 → OTP generated → Email sent → OTP verified → Passwords match → OTP marked verified → Password hashed → passwordResetCount incremented → passwordResetUsedAt set → User saved → Password changed email sent → Success response |
| **Expected_Output**                   | Status 200, {"success": true, "message": "Password reset successful! You can now login with your new password."}, password changed email sent                                                                                                                    |
| **Request_Method**                    | POST (two calls)                                                                                                                                                                                                                                                 |
| **Request_URL**                       | /api/auth/forgot-password → /api/auth/reset-password                                                                                                                                                                                                             |
| **Request_Body**                      | Step 1: `{"email": "user@test.com", "role": "patient"}` / Step 2: `{"email": "user@test.com", "otp": "123456", "password": "NewPass!", "confirmPassword": "NewPass!", "role": "patient"}`                                                                        |
| **DB_Preconditions**                  | Patient exists with passwordResetCount=0 or undefined                                                                                                                                                                                                            |

---

#### TC-WB-PC-005: Path Coverage - Logout → Session Revoked → LastLogout Updated

| Field                                 | Value                                                                                                                                                                                                                                     |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test_Case_ID**                      | TC-WB-PC-005                                                                                                                                                                                                                              |
| **Technique**                         | Path Coverage                                                                                                                                                                                                                             |
| **Module**                            | Authentication                                                                                                                                                                                                                            |
| **Function**                          | logout() in authController.js                                                                                                                                                                                                             |
| **Inputs_or_Setup**                   | Authenticated user with valid JWT token in cookie                                                                                                                                                                                         |
| **Code*Lines_Executed*(Description)** | Path: Token extracted from cookie → userId and userRole identified → UserModel.findByIdAndUpdate sets lastLogout → Session.updateOne sets isActive=false → Cookie cleared (two attempts: secure=true and secure=false) → Success response |
| **Expected_Output**                   | Status 200, {"success": true, "message": "Logged out successfully"}, Session isActive=false in DB, lastLogout timestamp updated, cookie "token" cleared                                                                                   |
| **Request_Method**                    | POST                                                                                                                                                                                                                                      |
| **Request_URL**                       | http://localhost:5000/api/auth/logout                                                                                                                                                                                                     |
| **Request_Body**                      | None (uses cookie)                                                                                                                                                                                                                        |
| **DB_Preconditions**                  | User authenticated with active session, valid JWT token in cookie                                                                                                                                                                         |

---

### E. Data Flow-Based Testing (5 Test Cases)

#### TC-WB-DF-001: Data Flow - Password Definition to Hash to Comparison

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

---

#### TC-WB-DF-002: Data Flow - OTP Creation to Verification to Deletion

| Field                                 | Value                                                                                                                                                                                                                                                            |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test_Case_ID**                      | TC-WB-DF-002                                                                                                                                                                                                                                                     |
| **Technique**                         | Data Flow-Based Testing                                                                                                                                                                                                                                          |
| **Module**                            | OTP Management                                                                                                                                                                                                                                                   |
| **Function**                          | OTP.createOTP() → OTP.verifyOTP() → OTP.deleteOne()                                                                                                                                                                                                              |
| **Inputs_or_Setup**                   | Request OTP for login, then verify it                                                                                                                                                                                                                            |
| **Code*Lines_Executed*(Description)** | DU chain: otp variable DEFINED in createOTP: `otp = Math.floor(100000 + Math.random() * 900000).toString()` → USED in verifyOTP: `OTP.findOne({email, otp, purpose})` → USED in delete: `await OTP.deleteOne({ _id: otpDoc._id })` after successful verification |
| **Expected_Output**                   | OTP created in DB, verified successfully, then deleted after use; cannot be reused                                                                                                                                                                               |
| **Request_Method**                    | POST (two calls)                                                                                                                                                                                                                                                 |
| **Request_URL**                       | /api/auth/login → /api/auth/verify-otp                                                                                                                                                                                                                           |
| **Request_Body**                      | Step 1: `{"email": "doctor@test.com", "password": "Pass123!", "role": "doctor"}` / Step 2: `{"email": "doctor@test.com", "otp": "<generated>", "role": "doctor", "purpose": "login"}`                                                                            |
| **DB_Preconditions**                  | Doctor exists with verified email                                                                                                                                                                                                                                |

---

#### TC-WB-DF-003: Data Flow - User Role Definition to Model Selection to Response Formatting

| Field                                 | Value                                                                                                                                                                                                                                          |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test_Case_ID**                      | TC-WB-DF-003                                                                                                                                                                                                                                   |
| **Technique**                         | Data Flow-Based Testing                                                                                                                                                                                                                        |
| **Module**                            | Authentication                                                                                                                                                                                                                                 |
| **Function**                          | register() in authController.js                                                                                                                                                                                                                |
| **Inputs_or_Setup**                   | Register with role="doctor"                                                                                                                                                                                                                    |
| **Code*Lines_Executed*(Description)** | DU chain: role variable DEFINED from req.body → USED in `getUserModel(role)` to select Doctor vs Patient model → USED in `formatUserResponse(user, role)` to include role-specific fields (specialization, experience) → USED in response JSON |
| **Expected_Output**                   | Doctor model used, registration successful, response includes doctor-specific fields if role="doctor"                                                                                                                                          |
| **Request_Method**                    | POST                                                                                                                                                                                                                                           |
| **Request_URL**                       | http://localhost:5000/api/auth/register                                                                                                                                                                                                        |
| **Request_Body**                      | `{"name": "Dr. Smith", "email": "drsmith@hospital.com", "password": "Pass123!", "role": "doctor", "specialization": "Cardiology", "experience": 5, "qualification": "MD"}`                                                                     |
| **DB_Preconditions**                  | No existing user with this email                                                                                                                                                                                                               |

---

#### TC-WB-DF-004: Data Flow - Email Definition to OTP Lookup to Email Service

| Field                                 | Value                                                                                                                                                                                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test_Case_ID**                      | TC-WB-DF-004                                                                                                                                                                                                                                |
| **Technique**                         | Data Flow-Based Testing                                                                                                                                                                                                                     |
| **Module**                            | OTP Resend                                                                                                                                                                                                                                  |
| **Function**                          | resendOTP() in authController.js                                                                                                                                                                                                            |
| **Inputs_or_Setup**                   | Request OTP resend for existing user                                                                                                                                                                                                        |
| **Code*Lines_Executed*(Description)** | DU chain: email variable DEFINED from req.body → USED in `UserModel.findOne({ email })` → USED in `OTP.checkRateLimit(email, purpose)` → USED in `OTP.createOTP(email, role, purpose)` → USED in `sendOTPEmail({ email: user.email, ... })` |
| **Expected_Output**                   | Email used consistently throughout flow, OTP sent to correct email address                                                                                                                                                                  |
| **Request_Method**                    | POST                                                                                                                                                                                                                                        |
| **Request_URL**                       | http://localhost:5000/api/auth/resend-otp                                                                                                                                                                                                   |
| **Request_Body**                      | `{"email": "patient@test.com", "role": "patient", "purpose": "registration"}`                                                                                                                                                               |
| **DB_Preconditions**                  | Patient exists with email "patient@test.com", not rate limited                                                                                                                                                                              |

---

#### TC-WB-DF-005: Data Flow - Session Token Definition to Cookie to Revocation

| Field                                 | Value                                                                                                                                                                                                                                                                                                |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test_Case_ID**                      | TC-WB-DF-005                                                                                                                                                                                                                                                                                         |
| **Technique**                         | Data Flow-Based Testing                                                                                                                                                                                                                                                                              |
| **Module**                            | Session Management                                                                                                                                                                                                                                                                                   |
| **Function**                          | generateToken() → logout()                                                                                                                                                                                                                                                                           |
| **Inputs_or_Setup**                   | Login successfully, then logout                                                                                                                                                                                                                                                                      |
| **Code*Lines_Executed*(Description)** | DU chain: token DEFINED in generateToken: `const token = jwt.sign(...)` → USED in Session.create({token, ...}) → USED in res.cookie('token', token) → USED in logout: `const { token } = req.cookies` → USED in `Session.updateOne({ token, isActive: true }, { isActive: false })` → Cookie cleared |
| **Expected_Output**                   | Token created, stored in DB session, set as cookie, successfully revoked on logout, cookie cleared                                                                                                                                                                                                   |
| **Request_Method**                    | POST (login then logout)                                                                                                                                                                                                                                                                             |
| **Request_URL**                       | /api/auth/verify-otp (login) → /api/auth/logout                                                                                                                                                                                                                                                      |
| **Request_Body**                      | Login OTP verification, then logout (no body)                                                                                                                                                                                                                                                        |
| **DB_Preconditions**                  | Successful login creates session with token                                                                                                                                                                                                                                                          |

---

## SUMMARY

### Black-Box Test Cases (10)

- **Equivalence Class Partitioning:** 5 test cases
  - Valid and invalid classes for admin login, registration, appointments
- **Boundary Value Analysis:** 5 test cases
  - OTP boundaries (000000, 999999)
  - Experience boundaries (0, 50 years)
  - Time boundaries (OTP expiry at 10 minutes)

### White-Box Test Cases (25)

- **Statement Coverage:** 5 test cases
  - Key statements: email verification, password hashing, suspension check, rate limiting, timestamp updates
- **Branch Coverage:** 5 test cases
  - Critical branches: email exists, password match, OTP purpose, account status, email verified
- **Multiple Condition Coverage:** 5 test cases
  - Complex conditions: email service failure, reset limits, OTP expiry+used, password same, password mismatch
- **Path Coverage:** 5 test cases
  - Complete flows: registration→verification→login, failed login paths, admin login, password reset, logout
- **Data Flow-Based Testing:** 5 test cases
  - Variable chains: password hash flow, OTP lifecycle, role selection, email propagation, token lifecycle

---

**Note:** All test cases include complete details for Excel import including Request_Method, Request_URL, Request_Body, and DB_Preconditions as required.

**Test Execution:** Run these tests using Jest + Supertest framework configured in the backend project. Refer to `/backend/package.json` for test scripts:

- `npm run test` - Watch mode
- `npm run test:once` - Single run
- `npm run test:coverage` - With coverage report
