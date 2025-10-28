/**
 * TC-WB-PC-005: Path Coverage - Logout → Session Revoked → LastLogout Updated
 * Technique: Path Coverage
 * Module: Authentication
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import express from 'express';
import Doctor from '../../../../src/models/Doctor.js';
import Session from '../../../../src/models/Session.js';
import authRoutes from '../../../../src/routes/auth.js';

describe('TC-WB-PC-005: Logout Complete Path', () => {
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
    app.use('/api/auth', authRoutes);

    // Create authenticated doctor
    const doctor = await Doctor.create({
      name: 'Dr. Test',
      email: 'doctor@test.com',
      password: 'hashedpassword',
      role: 'doctor',
      specialization: 'General',
      experience: 5,
      qualification: 'MBBS',
      isEmailVerified: true
    });
    doctorId = doctor._id;

    // Generate token and create session
    token = jwt.sign(
      { userId: doctorId, userRole: 'doctor' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '7d' }
    );

    await Session.create({
      userId: doctorId,
      userRole: 'doctor',
      token: token,
      isActive: true
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should follow complete logout path', async () => {
    const response = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', `token=${token}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Logged out successfully');

    // Verify session revoked
    const session = await Session.findOne({ token: token });
    expect(session.isActive).toBe(false);

    // Verify lastLogout updated
    const doctor = await Doctor.findById(doctorId);
    expect(doctor.lastLogout).toBeDefined();

    console.log('✓ Path: Token extracted → Session revoked → lastLogout updated → Cookie cleared');
  });
});
