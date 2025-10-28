/**
 * TC-WB-SC-005: Execute Last Login Timestamp Update Statement
 * Technique: Statement Coverage
 * Module: Authentication
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import Doctor from '../../../../src/models/Doctor.js';
import OTP from '../../../../src/models/OTP.js';
import authRoutes from '../../../../src/routes/auth.js';

describe('TC-WB-SC-005: Last Login Timestamp Update Statement Coverage', () => {
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

  it('should execute lastLogin timestamp update statements', async () => {
    // Create doctor
    const doctor = await Doctor.create({
      name: 'Dr. Test',
      email: 'doctor@test.com',
      password: 'hashedpassword',
      role: 'doctor',
      specialization: 'Cardiology',
      experience: 5,
      qualification: 'MD',
      isEmailVerified: true,
      lastLogin: new Date('2025-01-01') // Previous login
    });

    // Create valid login OTP
    const otp = '123456';
    await OTP.create({
      email: 'doctor@test.com',
      otp: otp,
      purpose: 'login',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      verified: false
    });

    // Verify OTP for login
    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({
        email: 'doctor@test.com',
        otp: otp,
        role: 'doctor',
        purpose: 'login'
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Login successful');
    expect(response.body.loginInfo).toBeDefined();
    expect(response.body.loginInfo.previousLogin).toBeDefined();

    // Verify lastLogin updated in DB
    const updatedDoctor = await Doctor.findById(doctor._id);
    expect(updatedDoctor.lastLogin).not.toEqual(doctor.lastLogin);
    expect(updatedDoctor.lastLogin.getTime()).toBeGreaterThan(doctor.lastLogin.getTime());

    console.log('✓ previousLoginTime = user.lastLogin executed');
    console.log('✓ user.lastLogin = new Date() executed');
    console.log('✓ await user.save() executed');
    console.log('✓ Response includes loginInfo object');
  });
});
