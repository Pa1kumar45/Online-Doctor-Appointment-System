/**
 * TC-WB-DF-005: Data Flow - Session Token Definition to Cookie to Revocation
 * Technique: Data Flow-Based Testing
 * Module: Session Management
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcryptjs from 'bcryptjs';
import express from 'express';
import Doctor from '../../../../src/models/Doctor.js';
import OTP from '../../../../src/models/OTP.js';
import Session from '../../../../src/models/Session.js';
import authRoutes from '../../../../src/routes/auth.js';

describe('TC-WB-DF-005: Token Lifecycle Data Flow', () => {
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
    await Doctor.deleteMany({});
    await OTP.deleteMany({});
    await Session.deleteMany({});
  });

  it('should trace token from generation to revocation', async () => {
    const password = 'Pass123!';
    const hashedPassword = await bcryptjs.hash(password, 12);

    // Create doctor
    await Doctor.create({
      name: 'Dr. Test',
      email: 'doctor@test.com',
      password: hashedPassword,
      role: 'doctor',
      specialization: 'General',
      experience: 5,
      qualification: 'MBBS',
      isEmailVerified: true
    });

    // Login to get OTP
    await request(app)
      .post('/api/auth/login')
      .send({
        email: 'doctor@test.com',
        password: password,
        role: 'doctor'
      })
      .expect(200);

    const otpDoc = await OTP.findOne({ email: 'doctor@test.com' });

    // D1: Token DEFINED in generateToken during OTP verification
    console.log('D1: token = jwt.sign({ userId, userRole }, SECRET)');
    const loginResponse = await request(app)
      .post('/api/auth/verify-otp')
      .send({
        email: 'doctor@test.com',
        otp: otpDoc.otp,
        role: 'doctor',
        purpose: 'login'
      })
      .expect(200);

    const cookies = loginResponse.headers['set-cookie'];
    expect(cookies).toBeDefined();
    const tokenCookie = cookies.find(c => c.startsWith('token='));
    expect(tokenCookie).toBeDefined();
    console.log('✓ Token created and set in cookie');

    // U1: Token USED in Session.create
    console.log('U1: Session.create({ token, ... })');
    const session = await Session.findOne({ userRole: 'doctor' });
    expect(session).toBeDefined();
    expect(session.isActive).toBe(true);
    console.log('✓ Token stored in session');

    // U2: Token USED in logout
    console.log('U2: const { token } = req.cookies');
    const logoutResponse = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', tokenCookie)
      .expect(200);

    expect(logoutResponse.body.success).toBe(true);

    // U3: Token USED to update session
    console.log('U3: Session.updateOne({ token }, { isActive: false })');
    const updatedSession = await Session.findById(session._id);
    expect(updatedSession.isActive).toBe(false);
    console.log('✓ Session revoked using token');

    console.log('✓ DU-chain: D1 (generate) → U1 (session) → U2 (cookie) → U3 (revoke)');
  });
});
