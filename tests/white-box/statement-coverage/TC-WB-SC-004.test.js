/**
 * TC-WB-SC-004: Execute OTP Rate Limiting Statement in Login
 * Technique: Statement Coverage
 * Module: Authentication
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import bcryptjs from 'bcryptjs';
import Patient from '../../../../src/models/Patient.js';
import OTP from '../../../../src/models/OTP.js';
import authRoutes from '../../../../src/routes/auth.js';

describe('TC-WB-SC-004: OTP Rate Limiting Statement Coverage', () => {
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

  it('should execute rate limit check statement', async () => {
    const password = 'CorrectPass123!';
    const hashedPassword = await bcryptjs.hash(password, 12);

    // Create patient
    await Patient.create({
      name: 'Test Patient',
      email: 'patient@test.com',
      password: hashedPassword,
      role: 'patient',
      isEmailVerified: true
    });

    // Create multiple recent OTP records to trigger rate limit
    const now = Date.now();
    for (let i = 0; i < 3; i++) {
      await OTP.create({
        email: 'patient@test.com',
        otp: `${100000 + i}`,
        purpose: 'login',
        expiresAt: new Date(now + 10 * 60 * 1000),
        createdAt: new Date(now - i * 1000) // Recent OTPs
      });
    }

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'patient@test.com',
        password: password,
        role: 'patient'
      })
      .expect(429);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/wait|rate|limit/i);
    expect(response.body.waitTime).toBeDefined();

    console.log('✓ OTP.checkRateLimit() statement executed');
    console.log('✓ if (!rateLimitCheck.allowed) statement executed');
    console.log('✓ Response with status 429 and waitTime');
  });
});
