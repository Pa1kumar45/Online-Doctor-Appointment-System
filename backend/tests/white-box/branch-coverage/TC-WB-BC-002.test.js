/**
 * TC-WB-BC-002: Branch Coverage for Password Match Validation in comparePassword
 * Technique: Branch Coverage
 * Module: Admin Authentication
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcryptjs from 'bcryptjs';
import express from 'express';
import Admin from '../../../../src/models/Admin.js';
import authRoutes from '../../../../src/routes/auth.js';

describe('TC-WB-BC-002: Password Match Branch Coverage', () => {
  let mongoServer;
  let app;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);

    // Create admin
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

  it('should follow TRUE branch when password matches', async () => {
    const response = await request(app)
      .post('/api/auth/admin/login')
      .send({
        email: 'admin@healthconnect.com',
        password: '#1ap@NITK' // Correct password
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Login successful');
    
    console.log('✓ Branch TRUE: bcryptjs.compare() returns true');
    console.log('✓ Authentication succeeds, status 200');
  });

  it('should follow FALSE branch when password does not match', async () => {
    const response = await request(app)
      .post('/api/auth/admin/login')
      .send({
        email: 'admin@healthconnect.com',
        password: 'WrongPassword' // Incorrect password
      })
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/invalid credentials/i);
    
    console.log('✓ Branch FALSE: bcryptjs.compare() returns false');
    console.log('✓ Returns 401 error');
  });
});
