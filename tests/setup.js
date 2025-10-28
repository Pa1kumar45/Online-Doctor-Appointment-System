import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Note: jest.setTimeout is called in jest.config.js
// Global setup
beforeAll(() => {
  console.log('🧪 Starting test suite...');
});

// Global teardown
afterAll(() => {
  console.log('✅ Test suite completed');
});
