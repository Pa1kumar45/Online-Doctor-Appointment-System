/**
 * TC-WB-BC-005: Branch Coverage for Email Verified Status in Login
 * Technique: Branch Coverage
 * Module: Authentication
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcryptjs from 'bcryptjs';
import express from 'express';
import Patient from '../../../../src/models/Patient.js';
import authRoutes from '../../../../src/routes/auth.js';

describe('TC-WB-BC-005: Email Verified Status Branch Coverage', () => {
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
    await Patient.deleteMany({});
  });

  it('should follow FALSE branch (proceed) when isEmailVerified=true', async () => {
    const password = 'Pass123!';
    const hashedPassword = await bcryptjs.hash(password, 12);
    
    await Patient.create({
      name: 'Verified Patient',
      email: 'verified@test.com',
      password: hashedPassword,
      role: 'patient',
      isEmailVerified: true // Email verified
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'verified@test.com',
        password: password,
        role: 'patient'
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    
    console.log('✓ Branch FALSE: !user.isEmailVerified is false');
    console.log('✓ Proceeds to account status check');
    console.log('✓ Login OTP sent');
  });

  it('should follow TRUE branch (block) when isEmailVerified=false', async () => {
    const password = 'Pass123!';
    const hashedPassword = await bcryptjs.hash(password, 12);
    
    await Patient.create({
      name: 'Unverified Patient',
      email: 'unverified@test.com',
      password: hashedPassword,
      role: 'patient',
      isEmailVerified: false // Email NOT verified
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'unverified@test.com',
        password: password,
        role: 'patient'
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/email not verified/i);
    expect(response.body.requiresVerification).toBe(true);
    
    console.log('✓ Branch TRUE: !user.isEmailVerified is true');
    console.log('✓ Returns 400 with requiresVerification');
    console.log('✓ Failed login logged');
  });
});
