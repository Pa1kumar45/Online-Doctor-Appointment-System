# Health-Connect Test Suite

Complete automated test suite for Health-Connect MERN application with **35 test cases** organized by testing technique.

## 📁 Test Structure

```
backend/tests/
├── black-box/
│   ├── equivalence-class-partitioning/
│   │   ├── TC-BB-ECP-001.test.js  ✅ Admin Login Valid
│   │   ├── TC-BB-ECP-002.test.js  ✅ Admin Login Invalid Email
│   │   ├── TC-BB-ECP-003.test.js  ✅ Doctor Registration Valid
│   │   ├── TC-BB-ECP-004.test.js  ✅ Patient Registration Invalid Role
│   │   └── TC-BB-ECP-005.test.js  ✅ Appointment Booking Valid
│   └── boundary-value-analysis/
│       ├── TC-BB-BVA-001.test.js  ✅ OTP Min Boundary (000000)
│       ├── TC-BB-BVA-002.test.js  ✅ OTP Max Boundary (999999)
│       ├── TC-BB-BVA-003.test.js  ✅ Experience Lower (0 years)
│       ├── TC-BB-BVA-004.test.js  ✅ Experience Upper (50 years)
│       └── TC-BB-BVA-005.test.js  ✅ OTP Expiry (10 minutes)
│
└── white-box/
    ├── statement-coverage/
    │   ├── TC-WB-SC-001.test.js   ✅ Email Verification Statement
    │   ├── TC-WB-SC-002.test.js   ✅ Password Hashing Statement
    │   ├── TC-WB-SC-003.test.js   ✅ Account Suspension Statement
    │   ├── TC-WB-SC-004.test.js   ✅ OTP Rate Limit Statement
    │   └── TC-WB-SC-005.test.js   ✅ Last Login Update Statement
    │
    ├── branch-coverage/
    │   ├── TC-WB-BC-001.test.js   ✅ Email Already Exists Branch
    │   ├── TC-WB-BC-002.test.js   ✅ Password Match Branch
    │   ├── TC-WB-BC-003.test.js   ✅ OTP Purpose Branch
    │   ├── TC-WB-BC-004.test.js   ✅ Admin Active Status Branch
    │   └── TC-WB-BC-005.test.js   ✅ Email Verified Branch
    │
    ├── multiple-condition-coverage/
    │   ├── TC-WB-MC-001.test.js   ✅ Email Service Failure
    │   ├── TC-WB-MC-002.test.js   ✅ Password Reset Limit
    │   ├── TC-WB-MC-003.test.js   ✅ OTP Expired AND Verified
    │   ├── TC-WB-MC-004.test.js   ✅ Password Same as Current
    │   └── TC-WB-MC-005.test.js   ✅ Password Mismatch
    │
    ├── path-coverage/
    │   ├── TC-WB-PC-001.test.js   ✅ Complete Auth Flow
    │   ├── TC-WB-PC-002.test.js   ✅ Failed Login Path
    │   ├── TC-WB-PC-003.test.js   ✅ Admin Login Path
    │   ├── TC-WB-PC-004.test.js   ✅ Password Reset Path
    │   └── TC-WB-PC-005.test.js   ✅ Logout Path
    │
    └── data-flow-based/
        ├── TC-WB-DF-001.test.js   ✅ Password Hash Flow
        ├── TC-WB-DF-002.test.js   ✅ OTP Lifecycle Flow
        ├── TC-WB-DF-003.test.js   ✅ Role Selection Flow
        ├── TC-WB-DF-004.test.js   ✅ Email Propagation Flow
        └── TC-WB-DF-005.test.js   ✅ Token Lifecycle Flow
```

## 📊 Test Statistics

- **Total Test Cases:** 35
  - **Black-Box Tests:** 10
    - Equivalence Class Partitioning: 5
    - Boundary Value Analysis: 5
  - **White-Box Tests:** 25
    - Statement Coverage: 5
    - Branch Coverage: 5
    - Multiple Condition Coverage: 5
    - Path Coverage: 5
    - Data Flow-Based Testing: 5

## 🚀 Running Tests

### Run All Tests

```bash
cd backend
npm run test:once
```

### Run Specific Test Type

```bash
# Black-Box Tests
npm run test:once -- black-box

# White-Box Tests
npm run test:once -- white-box

# Specific Subtype
npm run test:once -- statement-coverage
npm run test:once -- branch-coverage
npm run test:once -- multiple-condition-coverage
npm run test:once -- path-coverage
npm run test:once -- data-flow-based
npm run test:once -- equivalence-class-partitioning
npm run test:once -- boundary-value-analysis
```

### Run Individual Test Case

```bash
npm run test:once -- TC-BB-ECP-001
npm run test:once -- TC-WB-SC-001
npm run test:once -- TC-WB-DF-001
```

### Run with Coverage

```bash
npm run test:coverage
```

## 🧪 Test Technologies

- **Jest** - Testing framework
- **Supertest** - HTTP assertions
- **MongoDB Memory Server** - In-memory database for isolation
- **bcryptjs** - Password hashing verification
- **jsonwebtoken** - JWT token testing

## 📖 Documentation

- **`Complete_Test_Cases.md`** - Detailed documentation of all 35 test cases
- **`Health_Connect_Test_Cases.xlsx`** - Excel format with all test cases
- **`1testcase_in_each_subtype.md`** - Detailed guide for 7 selected test cases

## ✅ Test Coverage Goals

### Black-Box Testing

- **Equivalence Class Partitioning:** Tests valid and invalid input classes
- **Boundary Value Analysis:** Tests boundary conditions (min, max, at-limit values)

### White-Box Testing

- **Statement Coverage:** Ensures all statements execute
- **Branch Coverage:** Tests both TRUE and FALSE branches
- **Multiple Condition Coverage:** Tests complex condition combinations
- **Path Coverage:** Tests complete execution paths through multiple functions
- **Data Flow-Based Testing:** Traces variables from definition to usage (DU-chains)

## 🎯 Test Execution Order

1. **Setup Phase** (beforeAll)

   - Create MongoDB Memory Server
   - Connect to in-memory database
   - Initialize Express app
   - Create test data

2. **Test Execution**

   - Each test runs in isolation
   - Assertions verify expected behavior
   - Console logs show execution path

3. **Cleanup Phase** (afterAll)
   - Disconnect from database
   - Stop MongoDB Memory Server

## 💡 Best Practices

1. **Isolation:** Each test uses fresh database
2. **Deterministic:** No external dependencies
3. **Fast:** In-memory database ensures speed
4. **Readable:** Clear test descriptions
5. **Maintainable:** Organized by technique

## 🔧 Troubleshooting

### Tests Failing?

1. Ensure MongoDB Memory Server is installed: `npm install -D mongodb-memory-server`
2. Check Node.js version (requires v16+)
3. Verify all dependencies: `npm install`
4. Check for port conflicts

### Import Errors?

- Ensure `"type": "module"` is in `package.json`
- Use `.js` extension in imports
- Use `import` syntax (not `require`)

## 📝 Adding New Tests

1. Choose appropriate folder based on test type
2. Follow naming convention: `TC-{TYPE}-{SUBTYPE}-{NUMBER}.test.js`
3. Use existing tests as templates
4. Add documentation to `Complete_Test_Cases.md`
5. Update Excel file

## 🎓 Learning Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Guide](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)

---

**Created:** October 28, 2025  
**Project:** Health-Connect MERN Application  
**Testing Framework:** Jest + Supertest + MongoDB Memory Server
