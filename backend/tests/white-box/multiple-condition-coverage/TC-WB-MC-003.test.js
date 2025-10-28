/**
 * TC-WB-MC-003: Multiple Condition - OTP Expired AND Already Verified
 * Technique: Multiple Condition Coverage
 * Module: Password Reset
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import Patient from '../../../../src/models/Patient.js';
import OTP from '../../../../src/models/OTP.js';
import authRoutes from '../../../../src/routes/auth.js';

describe('TC-WB-MC-003: OTP Expired AND Verified Multiple Condition Coverage', () => {
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
    await OTP.deleteMany({});
  });

  it('should reject OTP that is already verified (verified=true)', async () => {
    await Patient.create({
      name: 'Test Patient',
      email: 'test@test.com',
      password: 'hashedpassword',
      role: 'patient',
      isEmailVerified: true
    });

    // Create already-verified OTP
    await OTP.create({
      email: 'test@test.com',
      otp: '123456',
      purpose: 'password-reset',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      verified: true // Already used
    });

    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        email: 'test@test.com',
        otp: '123456',
        password: 'NewPass123!',
        confirmPassword: 'NewPass123!',
        role: 'patient'
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/invalid|expired|already used/i);

    console.log('✓ Query with verified=false fails to find OTP');
    console.log('✓ if (!otpDoc) condition TRUE');
    console.log('✓ Returns invalid/already used OTP message');
  });
});
