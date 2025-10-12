# Testing Quick Reference

## 🚀 Commands

```powershell
# Run tests (watch mode - auto re-runs on changes)
npm test

# Run tests once
npm run test:once

# Run with coverage report
npm run test:coverage

# Run specific test file
npm run test:once -- doctor.test.js
```

## ✅ Current Status

**Test Results:**

```
Test Suites: 1 passed, 1 total
Tests:       13 passed, 13 total
Time:        ~11 seconds
```

**Tests Passing:**

- ✅ Create doctor successfully
- ✅ Hash password before saving
- ✅ Compare password correctly
- ✅ Fail without required fields
- ✅ No duplicate emails
- ✅ Convert email to lowercase
- ✅ Trim whitespace from fields
- ✅ Don't re-hash unchanged password
- ✅ Create with optional fields
- ✅ Auto-generate timestamps
- ✅ Validate non-negative experience
- ✅ Validate verification status enum
- ✅ Validate schedule day enum

## 📁 Test Files

```
backend/
├── jest.config.js              # Jest configuration
├── .env.test                   # Test environment vars
├── tests/
│   ├── setup.js                # Global test setup
│   └── models/
│       └── doctor.test.js      # Doctor model tests (13 tests)
```

## 🎯 What's Being Tested

### Doctor Model

- **Password Security:** Hashing, comparison
- **Validation:** Required fields, data types
- **Unique Constraints:** Email uniqueness
- **Data Processing:** Lowercase, trimming
- **Enum Values:** Status, days
- **Timestamps:** Auto-generated createdAt/updatedAt
- **Optional Fields:** Avatar, schedule, about

## 🔧 Test Database

**Connection:** `mongodb://localhost:27017/healthconnect-test`

**How it works:**

1. Connects before tests
2. Clears data after each test
3. Disconnects after all tests

**Safety:** ✅ Separate from dev database!

## 📊 Reading Test Output

```
✓ Test name (time in ms)    ← Passed
✗ Test name (time in ms)    ← Failed
  Error: Expected...        ← Error details
```

**Colors:**

- 🟢 Green = Passed
- 🔴 Red = Failed

## 🐛 Quick Troubleshooting

### MongoDB Not Running?

```powershell
# Start MongoDB
net start MongoDB

# Or use Docker
docker run -d -p 27017:27017 mongo:7
```

### Tests Failing?

1. Check MongoDB is running
2. Check `.env.test` exists
3. Clear test database: `db.dropDatabase()` in mongosh
4. Run `npm install` to ensure dependencies

### Slow Tests?

**Normal:** Password hashing takes time (~800ms per test)
**Expected:** 10-15 seconds for all tests

## 📈 Next Steps

### Add More Tests:

1. **Patient Model Tests** - Test patient functionality
2. **Admin Model Tests** - Test admin roles/permissions
3. **Appointment Tests** - Test booking logic
4. **API Integration Tests** - Test complete workflows

### Example: Add Patient Tests

```javascript
// tests/models/patient.test.js
import mongoose from "mongoose";
import Patient from "../../src/models/Patient.js";

describe("Patient Model Tests", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI);
  });

  afterAll(async () => {
    await Patient.deleteMany({});
    await mongoose.connection.close();
  });

  test("should create patient", async () => {
    const patient = await Patient.create({
      name: "Test Patient",
      email: "patient@test.com",
      password: "password123",
    });
    expect(patient._id).toBeDefined();
  });
});
```

## 💡 Pro Tips

1. **Write tests first** - Before fixing bugs, write a test that reproduces it
2. **Test edge cases** - Empty strings, null, undefined, negative numbers
3. **One assertion per test** - Makes failures easier to debug
4. **Descriptive names** - "should validate email format" not "test email"
5. **Clean up after tests** - Always clear test data

## 🎓 Common Expect Methods

```javascript
expect(value).toBe(expected); // Exact match
expect(value).toEqual(expected); // Deep equality
expect(value).toBeDefined(); // Not undefined
expect(value).toBeTruthy(); // Truthy value
expect(value).toBeFalsy(); // Falsy value
expect(value).toBeGreaterThan(10); // >10
expect(value).toBeLessThan(10); // <10
expect(value).toMatch(/regex/); // Matches regex
expect(value).toContain("item"); // Array/string contains
expect(value).toHaveLength(3); // Array/string length
expect(promise).rejects.toThrow(); // Promise rejects
expect(fn).toThrow(); // Function throws
```

## 📞 Need Help?

**Documentation:**

- Jest: https://jestjs.io/docs/getting-started
- Mongoose Testing: https://mongoosejs.com/docs/jest.html

**Common Issues:**

- See `TESTING_GUIDE.md` section "Troubleshooting"

---

**Last Updated:** After successful setup - 13/13 tests passing ✅
