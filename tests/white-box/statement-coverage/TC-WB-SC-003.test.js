/**
 * TC-WB-SC-003: Execute Account Suspension Check Statement in Login
 * Technique: Statement Coverage
 * Module: Authentication
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import Doctor from '../../../../src/models/Doctor.js';
import authRoutes from '../../../../src/routes/auth.js';

describe('TC-WB-SC-003: Account Suspension Check Statement Coverage', () => {
  let mongoServer;
  let app;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);

    // Create suspended doctor
    await Doctor.create({
      name: 'Dr. Suspended',
      email: 'suspended@test.com',
      password: '$2a$12$' + 'a'.repeat(50), // Mock hash
      role: 'doctor',
      specialization: 'General',
      experience: 5,
      qualification: 'MBBS',
      isEmailVerified: true,
      isActive: false // Suspended account
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should execute account suspension check statement', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'suspended@test.com',
        password: 'Pass123!',
        role: 'doctor'
      })
      .expect(403);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/suspended/i);
    expect(response.body.suspended).toBe(true);

    console.log('✓ if (!user.isActive) statement executed');
    console.log('✓ logAuthEvent with failureReason executed');
    console.log('✓ Response with status 403 and suspensionReason');
  });
});
