/**
 * TC-WB-PC-003: Path Coverage - Admin Login → Token Generation → Session Creation
 * Technique: Path Coverage
 * Module: Admin Authentication
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcryptjs from 'bcryptjs';
import express from 'express';
import Admin from '../../../../src/models/Admin.js';
import Session from '../../../../src/models/Session.js';
import authRoutes from '../../../../src/routes/auth.js';

describe('TC-WB-PC-003: Admin Login Complete Path', () => {
  let mongoServer;
  let app;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);

    const hashedPassword = await bcryptjs.hash('#1ap@NITK', 12);
    await Admin.create({
      name: 'Admin User',
      email: 'admin@healthconnect.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should follow complete admin login path', async () => {
    const response = await request(app)
      .post('/api/auth/admin/login')
      .send({
        email: 'admin@healthconnect.com',
        password: '#1ap@NITK'
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.user).toBeDefined();
    expect(response.headers['set-cookie']).toBeDefined();

    // Verify session created
    const session = await Session.findOne({ userId: response.body.user._id });
    expect(session).toBeDefined();
    expect(session.isActive).toBe(true);

    console.log('✓ Path: Admin found → isActive=true → Password verified');
    console.log('✓ → Token generated → Session created → Cookie set');
  });
});
