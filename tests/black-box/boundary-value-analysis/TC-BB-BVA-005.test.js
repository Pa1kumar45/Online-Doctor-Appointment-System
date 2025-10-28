/**
 * TC-BB-BVA-005: Password Reset with OTP at Expiry Boundary (10 minutes)
 * Technique: Boundary Value Analysis
 * Module: Password Reset
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import Patient from '../../../src/models/Patient.js';
import OTP from '../../../src/models/OTP.js';
import authRoutes from '../../../src/routes/auth.js';

describe('TC-BB-BVA-005: Password Reset with OTP at Expiry Boundary', () => {
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

  it('should reject OTP that is exactly 10 minutes old (expired)', async () => {
    // Create patient
    await Patient.create({
      name: 'Test Patient',
      email: 'patient@test.com',
      password: 'hashedpassword',
      role: 'patient',
      isEmailVerified: true
    });

    // Create expired OTP (exactly 10 minutes ago)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    await OTP.create({
      email: 'patient@test.com',
      otp: '123456',
      purpose: 'password-reset',
      expiresAt: tenMinutesAgo, // Expired exactly at boundary
      verified: false
    });

    // Try to reset password with expired OTP
    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        email: 'patient@test.com',
        otp: '123456',
        password: 'NewPass123!',
        confirmPassword: 'NewPass123!',
        role: 'patient'
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/expired|invalid|otp/i);
  });
});
