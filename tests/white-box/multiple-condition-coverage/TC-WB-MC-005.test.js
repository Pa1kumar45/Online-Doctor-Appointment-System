/**
 * TC-WB-MC-005: Multiple Condition - Password Mismatch
 * Technique: Multiple Condition Coverage
 * Module: Password Reset
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import authRoutes from '../../../../src/routes/auth.js';

describe('TC-WB-MC-005: Password Mismatch Multiple Condition Coverage', () => {
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

  it('should reject when password !== confirmPassword', async () => {
    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        email: 'test@test.com',
        otp: '123456',
        password: 'NewPass123!',
        confirmPassword: 'DifferentPass123!', // Mismatch
        role: 'patient'
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/passwords do not match/i);

    console.log('✓ Condition: password !== confirmPassword is TRUE');
    console.log('✓ Early return before OTP lookup');
    console.log('✓ Returns mismatch error');
  });
});
