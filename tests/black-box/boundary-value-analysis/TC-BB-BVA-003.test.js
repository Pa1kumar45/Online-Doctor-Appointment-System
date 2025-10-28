/**
 * TC-BB-BVA-003: Doctor Experience at Lower Boundary (0 years)
 * Technique: Boundary Value Analysis
 * Module: Doctor Registration
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import Doctor from '../../../src/models/Doctor.js';
import authRoutes from '../../../src/routes/auth.js';

describe('TC-BB-BVA-003: Doctor Experience at Lower Boundary', () => {
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

  it('should register doctor successfully with experience=0', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Dr. Fresh Graduate',
        email: 'newdoc@hospital.com',
        password: 'Pass1234!',
        role: 'doctor',
        specialization: 'General Medicine',
        experience: 0, // Lower boundary
        qualification: 'MBBS'
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toMatch(/registration successful/i);

    // Verify in DB
    const doctor = await Doctor.findOne({ email: 'newdoc@hospital.com' });
    expect(doctor).toBeDefined();
    expect(doctor.experience).toBe(0);
  });
});
