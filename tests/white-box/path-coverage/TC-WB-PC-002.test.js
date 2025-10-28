/**
 * TC-WB-PC-002: Path Coverage - Failed Login Path (Unverified Email)
 * Technique: Path Coverage
 * Module: Authentication
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcryptjs from 'bcryptjs';
import express from 'express';
import Patient from '../../../../src/models/Patient.js';
import authRoutes from '../../../../src/routes/auth.js';

describe('TC-WB-PC-002: Failed Login Path - Unverified Email', () => {
  let mongoServer;
  let app;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);

    const hashedPassword = await bcryptjs.hash('Pass123!', 12);
    await Patient.create({
      name: 'Unverified Patient',
      email: 'unverified@test.com',
      password: hashedPassword,
      role: 'patient',
      isEmailVerified: false // Not verified
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should follow path: User found → isEmailVerified check FAILS', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'unverified@test.com',
        password: 'Pass123!',
        role: 'patient'
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/email not verified/i);
    expect(response.body.requiresVerification).toBe(true);

    console.log('✓ Path: User found → isEmailVerified=false → Blocked');
  });
});
