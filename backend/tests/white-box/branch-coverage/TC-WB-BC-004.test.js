/**
 * TC-WB-BC-004: Branch Coverage for Admin Account Active Status
 * Technique: Branch Coverage
 * Module: Admin Authentication
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcryptjs from 'bcryptjs';
import express from 'express';
import Admin from '../../../../src/models/Admin.js';
import authRoutes from '../../../../src/routes/auth.js';

describe('TC-WB-BC-004: Admin Account Active Status Branch Coverage', () => {
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

  beforeEach(async () => {
    await Admin.deleteMany({});
  });

  it('should follow FALSE branch (proceed) when admin isActive=true', async () => {
    const hashedPassword = await bcryptjs.hash('#1ap@NITK', 12);
    await Admin.create({
      name: 'Active Admin',
      email: 'admin@healthconnect.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true // Active account
    });

    const response = await request(app)
      .post('/api/auth/admin/login')
      .send({
        email: 'admin@healthconnect.com',
        password: '#1ap@NITK'
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    
    console.log('✓ Branch FALSE: !admin.isActive is false');
    console.log('✓ Proceeds to password verification');
    console.log('✓ Login successful');
  });

  it('should follow TRUE branch (block) when admin isActive=false', async () => {
    const hashedPassword = await bcryptjs.hash('#1ap@NITK', 12);
    await Admin.create({
      name: 'Suspended Admin',
      email: 'admin@healthconnect.com',
      password: hashedPassword,
      role: 'admin',
      isActive: false // Suspended account
    });

    const response = await request(app)
      .post('/api/auth/admin/login')
      .send({
        email: 'admin@healthconnect.com',
        password: '#1ap@NITK'
      })
      .expect(403);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/suspended|contact support/i);
    
    console.log('✓ Branch TRUE: !admin.isActive is true');
    console.log('✓ Returns 403 with suspension message');
  });
});
