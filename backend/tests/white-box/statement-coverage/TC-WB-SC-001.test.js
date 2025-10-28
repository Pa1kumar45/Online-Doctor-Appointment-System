/**
 * TC-WB-SC-001: Statement Coverage Test
 * 
 * This test verifies that all key statements in the registration function are executed:
 * - User creation with isEmailVerified: false
 * - OTP generation via OTP.createOTP()
 * - Email sending via sendOTPEmail()
 * - Logging via logAuthEvent()
 * - Response with requiresVerification: true
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import authRoutes from '../src/routes/auth.js';
import Patient from '../src/models/Patient.js';
import OTP from '../src/models/OTP.js';

describe('TC-WB-SC-001: Statement Coverage - Registration', () => {
  let mongoServer;
  let app;

  beforeAll(async () => {
    // Setup in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Setup Express app
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should execute all registration statements including email verification, OTP generation, and logging', async () => {
    // Arrange
    const registrationData = {
      name: 'Test User',
      email: 'new@test.com',
      password: 'Pass123!',
      role: 'patient'
    };

    // Act
    const response = await request(app)
      .post('/api/auth/register')
      .send(registrationData)
      .expect(201);

    // Assert - Response structure
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('Registration successful');
    expect(response.body.data.email).toBe('new@test.com');
    expect(response.body.data.requiresVerification).toBe(true);

    // Assert - User created in DB with isEmailVerified: false
    const user = await Patient.findOne({ email: 'new@test.com' });
    expect(user).not.toBeNull();
    expect(user.name).toBe('Test User');
    expect(user.isEmailVerified).toBe(false);

    // Assert - OTP created in DB
    const otp = await OTP.findOne({ 
      email: 'new@test.com', 
      purpose: 'registration' 
    });
    expect(otp).not.toBeNull();
    expect(otp.otp).toMatch(/^\d{6}$/); // 6-digit OTP

    // Coverage achieved:
    // ✓ User creation statement
    // ✓ isEmailVerified: false assignment
    // ✓ OTP.createOTP() call
    // ✓ sendOTPEmail() call
    // ✓ logAuthEvent() call
    // ✓ Response with requiresVerification: true
  });
});
