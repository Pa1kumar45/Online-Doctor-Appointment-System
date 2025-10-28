/**
 * TC-BB-BVA-001: OTP Verification with Minimum Boundary (000000)
 * Technique: Boundary Value Analysis
 * Module: OTP Verification
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import Patient from '../../../src/models/Patient.js';
import OTP from '../../../src/models/OTP.js';
import authRoutes from '../../../src/routes/auth.js';

describe('TC-BB-BVA-001: OTP Verification with Minimum Boundary', () => {
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

  it('should fail OTP verification with minimum boundary value 000000', async () => {
    // Create patient
    await Patient.create({
      name: 'Test Patient',
      email: 'patient@test.com',
      password: 'hashedpassword',
      role: 'patient',
      isEmailVerified: false
    });

    // Create valid OTP (different from 000000)
    await OTP.create({
      email: 'patient@test.com',
      otp: '123456',
      purpose: 'registration',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      verified: false
    });

    // Try with boundary value
    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({
        email: 'patient@test.com',
        otp: '000000', // Minimum boundary
        role: 'patient',
        purpose: 'registration'
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/invalid|expired|otp/i);
  });
});
