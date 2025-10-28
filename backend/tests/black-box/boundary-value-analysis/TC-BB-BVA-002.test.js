/**
 * TC-BB-BVA-002: OTP Verification with Maximum Boundary (999999)
 * Technique: Boundary Value Analysis
 * Module: OTP Verification
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import Doctor from '../../../src/models/Doctor.js';
import OTP from '../../../src/models/OTP.js';
import authRoutes from '../../../src/routes/auth.js';

describe('TC-BB-BVA-002: OTP Verification with Maximum Boundary', () => {
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
    await Doctor.deleteMany({});
    await OTP.deleteMany({});
  });

  it('should fail OTP verification with maximum boundary value 999999', async () => {
    // Create doctor
    await Doctor.create({
      name: 'Dr. Test',
      email: 'doctor@test.com',
      password: 'hashedpassword',
      role: 'doctor',
      specialization: 'General',
      experience: 5,
      qualification: 'MBBS',
      isEmailVerified: true
    });

    // Create valid OTP for login (different from 999999)
    await OTP.create({
      email: 'doctor@test.com',
      otp: '654321',
      purpose: 'login',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      verified: false
    });

    // Try with boundary value
    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({
        email: 'doctor@test.com',
        otp: '999999', // Maximum boundary
        role: 'doctor',
        purpose: 'login'
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/invalid|expired|otp/i);
  });
});
