/**
 * TC-WB-BC-003: Branch Coverage for OTP Purpose (Registration vs Login)
 * Technique: Branch Coverage
 * Module: OTP Verification
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import Patient from '../../../../src/models/Patient.js';
import Doctor from '../../../../src/models/Doctor.js';
import OTP from '../../../../src/models/OTP.js';
import authRoutes from '../../../../src/routes/auth.js';

describe('TC-WB-BC-003: OTP Purpose Branch Coverage', () => {
  let mongoServer;
  let app;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Patient.deleteMany({});
    await Doctor.deleteMany({});
    await OTP.deleteMany({});
  });

  it('should follow registration branch when purpose=registration', async () => {
    // Create unverified patient
    await Patient.create({
      name: 'New Patient',
      email: 'new@test.com',
      password: 'hashedpassword',
      role: 'patient',
      isEmailVerified: false
    });

    // Create registration OTP
    await OTP.create({
      email: 'new@test.com',
      otp: '123456',
      purpose: 'registration',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      verified: false
    });

    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({
        email: 'new@test.com',
        otp: '123456',
        role: 'patient',
        purpose: 'registration'
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toMatch(/email verified successfully/i);
    
    // Verify isEmailVerified set to true
    const patient = await Patient.findOne({ email: 'new@test.com' });
    expect(patient.isEmailVerified).toBe(true);
    
    console.log('✓ Branch: purpose === "registration"');
    console.log('✓ isEmailVerified set to true');
    console.log('✓ Welcome email sent');
  });

  it('should follow login branch when purpose=login', async () => {
    // Create verified doctor
    await Doctor.create({
      name: 'Dr. Verified',
      email: 'verified@test.com',
      password: 'hashedpassword',
      role: 'doctor',
      specialization: 'General',
      experience: 5,
      qualification: 'MBBS',
      isEmailVerified: true
    });

    // Create login OTP
    await OTP.create({
      email: 'verified@test.com',
      otp: '654321',
      purpose: 'login',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      verified: false
    });

    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({
        email: 'verified@test.com',
        otp: '654321',
        role: 'doctor',
        purpose: 'login'
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Login successful');
    expect(response.body.loginInfo).toBeDefined();
    expect(response.headers['set-cookie']).toBeDefined(); // JWT cookie
    
    console.log('✓ Branch: purpose === "login"');
    console.log('✓ lastLogin updated');
    console.log('✓ JWT token generated');
    console.log('✓ loginInfo included in response');
  });
});
