/**
 * TC-WB-DF-002: Data Flow - OTP Creation to Verification to Deletion
 * Technique: Data Flow-Based Testing
 * Module: OTP Management
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcryptjs from 'bcryptjs';
import express from 'express';
import Doctor from '../../../../src/models/Doctor.js';
import OTP from '../../../../src/models/OTP.js';
import authRoutes from '../../../../src/routes/auth.js';

describe('TC-WB-DF-002: OTP Lifecycle Data Flow', () => {
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

  it('should trace OTP from creation to deletion', async () => {
    const password = 'Pass123!';
    const hashedPassword = await bcryptjs.hash(password, 12);

    // Create verified doctor
    await Doctor.create({
      name: 'Dr. Test',
      email: 'doctor@test.com',
      password: hashedPassword,
      role: 'doctor',
      specialization: 'General',
      experience: 5,
      qualification: 'MBBS',
      isEmailVerified: true
    });

    // D1: Request login (OTP will be DEFINED/created)
    console.log('D1: OTP Creation - otp = generateRandomSixDigit()');
    await request(app)
      .post('/api/auth/login')
      .send({
        email: 'doctor@test.com',
        password: password,
        role: 'doctor'
      })
      .expect(200);

    // Verify OTP created in DB
    const otpDoc = await OTP.findOne({ email: 'doctor@test.com', purpose: 'login' });
    expect(otpDoc).toBeDefined();
    expect(otpDoc.otp).toMatch(/^\d{6}$/);
    const generatedOtp = otpDoc.otp;
    console.log(`✓ OTP created: ${generatedOtp}`);

    // U1: Use OTP in verification query
    console.log('U1: OTP.findOne({ email, otp, purpose })');
    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({
        email: 'doctor@test.com',
        otp: generatedOtp,
        role: 'doctor',
        purpose: 'login'
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    console.log('✓ OTP verified successfully');

    // U2: Verify OTP is DELETED after use
    console.log('U2: OTP.deleteOne({ _id: otpDoc._id })');
    const deletedOtp = await OTP.findById(otpDoc._id);
    expect(deletedOtp).toBeNull();
    console.log('✓ OTP deleted after verification');

    // Cannot reuse
    const reuseResponse = await request(app)
      .post('/api/auth/verify-otp')
      .send({
        email: 'doctor@test.com',
        otp: generatedOtp,
        role: 'doctor',
        purpose: 'login'
      })
      .expect(400);

    expect(reuseResponse.body.success).toBe(false);
    console.log('✓ DU-chain complete: D1 → U1 → U2 (delete)');
  });
});
