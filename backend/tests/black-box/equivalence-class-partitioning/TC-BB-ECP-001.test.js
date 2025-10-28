/**
 * TC-BB-ECP-001: Admin Login with Valid Credentials (Valid Class)
 * Technique: Equivalence Class Partitioning
 * Module: Admin Authentication
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcryptjs from 'bcryptjs';
import express from 'express';
import Admin from '../../../src/models/Admin.js';
import authRoutes from '../../../src/routes/auth.js';

describe('TC-BB-ECP-001: Admin Login with Valid Credentials', () => {
  let mongoServer;
  let app;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);

    // Create admin with valid credentials
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

  it('should return 200 and login successfully with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/admin/login')
      .send({
        email: 'admin@healthconnect.com',
        password: '#1ap@NITK'
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Login successful');
    expect(response.body.user).toBeDefined();
    expect(response.body.user.email).toBe('admin@healthconnect.com');
    expect(response.body.user.role).toBe('admin');
    expect(response.headers['set-cookie']).toBeDefined(); // JWT token cookie
  });
});
