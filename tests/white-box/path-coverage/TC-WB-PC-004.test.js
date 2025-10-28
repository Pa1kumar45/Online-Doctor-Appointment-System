/**
 * TC-WB-PC-004: Path Coverage - Forgot Password → Reset Password Complete Flow
 * Technique: Path Coverage
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

describe('TC-WB-PC-004: Password Reset Complete Path', () => {
  let mongoServer;
  let app;
  let generatedOtp;

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

    await Patient.create({
      name: 'Test Patient',
      email: 'user@test.com',
      password: 'oldpasswordhash',
      role: 'patient',
      isEmailVerified: true,
      passwordResetCount: 0
    });
  });

  it('should follow complete password reset path', async () => {
    // Step 1: Request password reset
    console.log('Step 1: Forgot Password Request');
    const forgotResponse = await request(app)
      .post('/api/auth/forgot-password')
      .send({
        email: 'user@test.com',
        role: 'patient'
      })
      .expect(200);

    expect(forgotResponse.body.success).toBe(true);

    // Get OTP from database
    const otpDoc = await OTP.findOne({ email: 'user@test.com', purpose: 'password-reset' });
    generatedOtp = otpDoc.otp;

    // Step 2: Reset password with OTP
    console.log('Step 2: Reset Password with OTP');
    const resetResponse = await request(app)
      .post('/api/auth/reset-password')
      .send({
        email: 'user@test.com',
        otp: generatedOtp,
        password: 'NewPass123!',
        confirmPassword: 'NewPass123!',
        role: 'patient'
      })
      .expect(200);

    expect(resetResponse.body.success).toBe(true);
    expect(resetResponse.body.message).toMatch(/password reset successful/i);

    // Verify password changed and count incremented
    const patient = await Patient.findOne({ email: 'user@test.com' });
    expect(patient.passwordResetCount).toBe(1);
    expect(patient.passwordResetUsedAt).toBeDefined();

    console.log('✓ Complete Path: Forgot → OTP Generated → Reset → Count Incremented');
  });
});
