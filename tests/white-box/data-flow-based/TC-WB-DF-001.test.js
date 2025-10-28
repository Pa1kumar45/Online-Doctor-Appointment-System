/**
 * TC-WB-DF-001: Data Flow-Based Testing
 * 
 * This test traces the data flow of the password variable through the system:
 * 
 * Data Flow Chain:
 * D1: password defined at Admin.create({ password: plaintext })
 * D2: password redefined in pre-save hook as hash
 * U1: password used in comparePassword method
 * U2: password used in bcryptjs.compare
 * 
 * DU-Chain: D1 → D2 → U1 → U2
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import bcryptjs from 'bcryptjs';
import Admin from '../src/models/Admin.js';
import authRoutes from '../src/routes/auth.js';

describe('TC-WB-DF-001: Data Flow - Password Hash Chain', () => {
  let mongoServer;
  let app;
  const plainPassword = '#1ap@NITK';
  const adminEmail = 'dataflow@test.com';

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

  it('should trace password data flow from definition to comparison', async () => {
    // ========== DEFINITION POINT D1 ==========
    console.log('D1: Create admin with plaintext password');
    const admin = new Admin({
      name: 'Data Flow Admin',
      email: adminEmail,
      password: plainPassword, // DEFINITION D1
      role: 'admin',
      isActive: true
    });

    // Before save - password is plaintext
    expect(admin.password).toBe(plainPassword);
    console.log(`Password before save: ${admin.password}`);

    // ========== DEFINITION POINT D2 ==========
    console.log('D2: Save admin (triggers pre-save hook)');
    await admin.save(); // Triggers pre('save') middleware

    // After save - password should be hashed
    const savedAdmin = await Admin.findOne({ email: adminEmail }).select('+password');
    expect(savedAdmin.password).not.toBe(plainPassword);
    expect(savedAdmin.password).toMatch(/^\$2[aby]\$\d{2}\$/); // bcryptjs format
    console.log(`Password after save (hashed): ${savedAdmin.password.substring(0, 20)}...`);

    // Verify hash was created with correct rounds
    const rounds = bcryptjs.getRounds(savedAdmin.password);
    expect(rounds).toBe(12);
    console.log(`Hash rounds: ${rounds}`);

    // ========== USE POINT U1 & U2 ==========
    console.log('U1 & U2: Login using comparePassword method');
    
    // Test with CORRECT password (should return true)
    const isCorrect = await savedAdmin.comparePassword(plainPassword);
    expect(isCorrect).toBe(true);
    console.log(`comparePassword(correct): ${isCorrect}`);

    // Test with WRONG password (should return false)
    const isWrong = await savedAdmin.comparePassword('WrongPassword');
    expect(isWrong).toBe(false);
    console.log(`comparePassword(wrong): ${isWrong}`);

    // ========== INTEGRATION TEST: Login Endpoint ==========
    console.log('Integration: Test login endpoint with data flow');
    const loginResponse = await request(app)
      .post('/api/auth/admin/login')
      .send({
        email: adminEmail,
        password: plainPassword
      })
      .expect(200);

    expect(loginResponse.body.success).toBe(true);
    expect(loginResponse.body.message).toBe('Login successful');
    expect(loginResponse.body.user.email).toBe(adminEmail);

    // ========== DATA FLOW COVERAGE ACHIEVED ==========
    console.log('\n✓ Complete DU-chain traced:');
    console.log('  D1: password = "#1ap@NITK" (plaintext)');
    console.log('  D2: this.password = hash(plaintext, 12)');
    console.log('  U1: comparePassword(candidatePassword)');
    console.log('  U2: bcryptjs.compare(candidate, this.password)');
    console.log('  ✓ DU-chain: D1 → D2 → U1 → U2 verified');
  });

  it('should verify password is never stored in plaintext', async () => {
    // Create another admin
    const admin2 = await Admin.create({
      name: 'Security Test',
      email: 'security@test.com',
      password: 'PlainTextPassword',
      role: 'admin',
      isActive: true
    });

    // Fetch from DB with password field
    const fromDB = await Admin.findById(admin2._id).select('+password');
    
    // Password should be hashed, never plaintext
    expect(fromDB.password).not.toBe('PlainTextPassword');
    expect(fromDB.password.length).toBeGreaterThan(50); // Hash is long
    
    console.log('✓ Password security verified: never stored as plaintext');
  });
});
