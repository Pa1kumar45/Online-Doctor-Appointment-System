/**
 * TC-BB-ECP-003: Doctor Registration with Valid Data (Valid Class)
 * Technique: Equivalence Class Partitioning
 * Module: Doctor Registration
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import Doctor from '../../../src/models/Doctor.js';
import authRoutes from '../../../src/routes/auth.js';

describe('TC-BB-ECP-003: Doctor Registration with Valid Data', () => {
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

  it('should register doctor successfully with valid data', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Dr. Sarah Johnson',
        email: 'sarah.j@hospital.com',
        password: 'SecurePass123!',
        role: 'doctor',
        specialization: 'Cardiology',
        experience: 8,
        qualification: 'MD, MBBS'
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toMatch(/registration successful/i);
    expect(response.body.data.email).toBe('sarah.j@hospital.com');
    expect(response.body.data.requiresVerification).toBe(true);

    // Verify user created in DB with isEmailVerified=false
    const doctor = await Doctor.findOne({ email: 'sarah.j@hospital.com' });
    expect(doctor).toBeDefined();
    expect(doctor.isEmailVerified).toBe(false);
    expect(doctor.specialization).toBe('Cardiology');
    expect(doctor.experience).toBe(8);
  });
});
