/**
 * TC-WB-MC-002: Multiple Condition - Password Reset Limit Exceeded
 * Technique: Multiple Condition Coverage
 * Module: Password Reset
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import Patient from '../../../../src/models/Patient.js';
import authRoutes from '../../../../src/routes/auth.js';

describe('TC-WB-MC-002: Password Reset Limit Multiple Condition Coverage', () => {
  let mongoServer;
  let app;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);

    // Create patient with reset count at limit
    await Patient.create({
      name: 'Limited Patient',
      email: 'limited@test.com',
      password: 'hashedpassword',
      role: 'patient',
      isEmailVerified: true,
      passwordResetCount: 1, // Already used reset once
      passwordResetUsedAt: new Date()
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should reject when passwordResetCount >= 1 (both conditions TRUE)', async () => {
    const response = await request(app)
      .post('/api/auth/forgot-password')
      .send({
        email: 'limited@test.com',
        role: 'patient'
      })
      .expect(403);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/attempt.*completed|cannot reset/i);
    expect(response.body.resetLimitReached).toBe(true);
    expect(response.body.resetCount).toBe(1);

    console.log('✓ Condition 1: user.passwordResetCount is TRUE (exists)');
    console.log('✓ Condition 2: user.passwordResetCount >= 1 is TRUE');
    console.log('✓ Both conditions TRUE → Reset blocked');
  });
});
