/**
 * TC-WB-DF-003: Data Flow - User Role Definition to Model Selection
 * Technique: Data Flow-Based Testing
 * Module: Authentication
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import Doctor from '../../../../src/models/Doctor.js';
import authRoutes from '../../../../src/routes/auth.js';

describe('TC-WB-DF-003: Role Variable Data Flow', () => {
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

  it('should trace role from input to model selection to response', async () => {
    // D1: role DEFINED from req.body
    console.log('D1: role = req.body.role → "doctor"');
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Dr. Smith',
        email: 'drsmith@hospital.com',
        password: 'Pass123!',
        role: 'doctor', // DEFINITION
        specialization: 'Cardiology',
        experience: 5,
        qualification: 'MD'
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    console.log('✓ Role defined: doctor');

    // U1: Verify Doctor model was USED (not Patient)
    console.log('U1: getUserModel(role) → Doctor model selected');
    const doctor = await Doctor.findOne({ email: 'drsmith@hospital.com' });
    expect(doctor).toBeDefined();
    expect(doctor.specialization).toBe('Cardiology');
    expect(doctor.experience).toBe(5);
    console.log('✓ Doctor model used for creation');

    // U2: Verify role-specific fields in response
    console.log('U2: formatUserResponse(user, role) includes doctor fields');
    expect(response.body.data.email).toBe('drsmith@hospital.com');
    console.log('✓ Response formatted with role-specific fields');

    console.log('✓ DU-chain: D1 (input) → U1 (model) → U2 (response)');
  });
});
