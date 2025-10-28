/**
 * TC-BB-BVA-004: Doctor Experience at Upper Boundary (50 years)
 * Technique: Boundary Value Analysis
 * Module: Doctor Profile Update
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import jwt from 'jsonwebtoken';
import Doctor from '../../../src/models/Doctor.js';
import doctorRoutes from '../../../src/routes/doctors.js';
import { authenticate } from '../../../src/middleware/auth.js';

describe('TC-BB-BVA-004: Doctor Experience at Upper Boundary', () => {
  let mongoServer;
  let app;
  let token;
  let doctorId;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    app = express();
    app.use(express.json());
    app.use((req, res, next) => {
      if (token) {
        req.cookies = { token };
      }
      next();
    });
    app.use('/api/doctors', doctorRoutes);

    // Create authenticated doctor
    const doctor = await Doctor.create({
      name: 'Dr. Senior',
      email: 'senior@hospital.com',
      password: 'hashedpassword',
      role: 'doctor',
      specialization: 'Surgery',
      experience: 30,
      qualification: 'MD, MBBS',
      isEmailVerified: true
    });
    doctorId = doctor._id;

    // Generate token
    token = jwt.sign(
      { userId: doctorId, userRole: 'doctor' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '7d' }
    );
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should update doctor experience to 50 years (upper boundary)', async () => {
    const response = await request(app)
      .put('/api/doctors/profile')
      .set('Cookie', `token=${token}`)
      .send({
        experience: 50 // Upper boundary
      })
      .expect(200);

    expect(response.body.success).toBe(true);

    // Verify in DB
    const updatedDoctor = await Doctor.findById(doctorId);
    expect(updatedDoctor.experience).toBe(50);
  });
});
