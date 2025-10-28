/**
 * TC-WB-PC-001: Path Coverage Test
 * 
 * This test executes the complete authentication path:
 * Path: Register → Verify Registration OTP → Login → Verify Login OTP
 * 
 * This ensures all nodes in the authentication flow are traversed.
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from '../src/routes/auth.js';
import Patient from '../src/models/Patient.js';
import OTP from '../src/models/OTP.js';

describe('TC-WB-PC-001: Path Coverage - Complete Authentication Flow', () => {
  let mongoServer;
  let app;
  let registrationOTP;
  let loginOTP;
  const testEmail = 'pathtest@test.com';

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use('/api/auth', authRoutes);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should execute complete path: register → verify → login → verify', async () => {
    // ========== PATH STEP 1: REGISTRATION ==========
    console.log('Step 1: Register new patient');
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Path Test User',
        email: testEmail,
        password: 'PathTest123!',
        role: 'patient'
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
      purpose: 'registration' 
    });
    registrationOTP = otpDoc.otp;
    console.log(`Registration OTP: ${registrationOTP}`);

    // ========== PATH STEP 2: VERIFY REGISTRATION OTP ==========
    console.log('Step 2: Verify registration OTP');
    const verifyRegResponse = await request(app)
      .post('/api/auth/verify-otp')
      .send({
        email: testEmail,
        otp: registrationOTP,
        role: 'patient',
        purpose: 'registration'
      })
      .expect(200);

    expect(verifyRegResponse.body.success).toBe(true);
    expect(verifyRegResponse.body.message).toContain('Email verified successfully');

    // Verify isEmailVerified set to true
    user = await Patient.findOne({ email: testEmail });
    expect(user.isEmailVerified).toBe(true);
    expect(user.emailVerifiedAt).toBeDefined();

    // ========== PATH STEP 3: LOGIN ==========
    console.log('Step 3: Login with credentials');
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: 'PathTest123!',
        role: 'patient'
      })
      .expect(200);

    expect(loginResponse.body.success).toBe(true);
    expect(loginResponse.body.message).toContain('OTP sent');
    expect(loginResponse.body.requiresOTP).toBe(true);

    // Get login OTP
    otpDoc = await OTP.findOne({ 
      email: testEmail, 
      purpose: 'login' 
    });
    loginOTP = otpDoc.otp;
    console.log(`Login OTP: ${loginOTP}`);

    // ========== PATH STEP 4: VERIFY LOGIN OTP ==========
    console.log('Step 4: Verify login OTP');
    const verifyLoginResponse = await request(app)
      .post('/api/auth/verify-otp')
      .send({
        email: testEmail,
        otp: loginOTP,
        role: 'patient',
        purpose: 'login'
      })
      .expect(200);

    expect(verifyLoginResponse.body.success).toBe(true);
    expect(verifyLoginResponse.body.message).toBe('Login successful');
    expect(verifyLoginResponse.body.data).toBeDefined();
    expect(verifyLoginResponse.body.loginInfo).toBeDefined();

    // Verify JWT cookie set
    const cookies = verifyLoginResponse.headers['set-cookie'];
    expect(cookies).toBeDefined();
    const tokenCookie = cookies.find(c => c.startsWith('token='));
    expect(tokenCookie).toBeDefined();

    // Verify lastLogin updated
    user = await Patient.findOne({ email: testEmail });
    expect(user.lastLogin).toBeDefined();

    // ========== COMPLETE PATH COVERAGE ACHIEVED ==========
    console.log('✓ Complete path executed successfully');
    console.log('Path nodes covered:');
    console.log('  1. User creation (isEmailVerified: false)');
    console.log('  2. Registration OTP sent');
    console.log('  3. OTP verification (registration)');
    console.log('  4. isEmailVerified set to true');
    console.log('  5. Welcome email sent');
    console.log('  6. Login request');
    console.log('  7. Credentials validated');
    console.log('  8. Login OTP sent');
    console.log('  9. Login OTP verified');
    console.log(' 10. JWT token issued');
    console.log(' 11. lastLogin timestamp updated');
  });
});
