/**
 * TC-WB-MC-004: Multiple Condition - Password Change to Same Password
 * Technique: Multiple Condition Coverage
 * Module: Password Change
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import express from 'express';
import Patient from '../../../../src/models/Patient.js';
import authRoutes from '../../../../src/routes/auth.js';

describe('TC-WB-MC-004: Password Same as Current Multiple Condition Coverage', () => {
  let mongoServer;
  let app;
  let token;

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

    // Create patient
    const password = 'MyPass123!';
    const hashedPassword = await bcryptjs.hash(password, 12);
    const patient = await Patient.create({
      name: 'Test Patient',
      email: 'patient@test.com',
      password: hashedPassword,
      role: 'patient',
      isEmailVerified: true
    });

    // Generate token
    token = jwt.sign(
      { userId: patient._id, userRole: 'patient' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '7d' }
    );
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should reject when new password same as current password', async () => {
    const response = await request(app)
      .post('/api/auth/change-password')
      .set('Cookie', `token=${token}`)
      .send({
        currentPassword: 'MyPass123!',
        newPassword: 'MyPass123!' // Same as current
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/new password must be different/i);

    console.log('✓ Current password verified (isPasswordCorrect=true)');
    console.log('✓ isSamePassword = comparePassword(newPassword) is TRUE');
    console.log('✓ if (isSamePassword) condition TRUE');
    console.log('✓ Returns "must be different" error');
  });
});
