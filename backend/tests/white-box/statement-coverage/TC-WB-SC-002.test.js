/**
 * TC-WB-SC-002: Execute Password Hashing Statement in Admin Model
 * Technique: Statement Coverage
 * Module: Admin Management
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcryptjs from 'bcryptjs';
import Admin from '../../../../src/models/Admin.js';

describe('TC-WB-SC-002: Password Hashing Statement Coverage', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should execute password hashing statements in pre-save hook', async () => {
    const plainPassword = '#1ap@NITK';
    
    // Create admin (triggers pre-save hook)
    const admin = await Admin.create({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: plainPassword,
      role: 'admin',
      isActive: true
    });

    // Verify password is hashed (not plaintext)
    expect(admin.password).not.toBe(plainPassword);
    expect(admin.password).toMatch(/^\$2[aby]\$\d{2}\$/); // bcryptjs format

    // Verify hash was created with correct rounds
    const rounds = bcryptjs.getRounds(admin.password);
    expect(rounds).toBe(12);

    console.log('✓ Password hashing statements executed');
    console.log(`✓ this.isModified('password') checked`);
    console.log(`✓ bcryptjs.hash() called with salt rounds=12`);
    console.log(`✓ this.password = hashedPassword assigned`);
  });
});
