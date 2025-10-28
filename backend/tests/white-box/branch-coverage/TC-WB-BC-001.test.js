/**
 * TC-WB-BC-001: Branch Coverage Test
 * 
 * This test verifies both branches of the email existence check:
 * - TRUE branch: Email already exists (returns 400)
 * - FALSE branch: Email does not exist (continues to registration)
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import authRoutes from '../src/routes/auth.js';
import Patient from '../src/models/Patient.js';

describe('TC-WB-BC-001: Branch Coverage - Email Already Exists', () => {
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
    // Clear database
    await Patient.deleteMany({});
  });

  it('should take TRUE branch when email already exists', async () => {
    // Arrange - Create existing patient
    const existingPatient = new Patient({
      name: 'Existing User',
      email: 'existing@test.com',
      password: 'ExistingPass123!',
      isEmailVerified: true
    });
    await existingPatient.save();

    // Act - Try to register with same email
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Duplicate User',
        email: 'existing@test.com',
        password: 'Pass123!',
        role: 'patient'
      })
      .expect(400);

    // Assert - Branch TRUE executed
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('User already exists with this email');

    // Verify no duplicate created
    const count = await Patient.countDocuments({ email: 'existing@test.com' });
    expect(count).toBe(1); // Still only 1

    // Coverage achieved:
    // ✓ existingDoctor lookup
    // ✓ existingPatient lookup
    // ✓ if (existingDoctor || existingPatient) → TRUE branch
    // ✓ logAuthEvent with failureReason
    // ✓ Early return with 400 status
  });

  it('should take FALSE branch when email does not exist', async () => {
    // Act - Register with new email
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'New User',
        email: 'newuser@test.com',
        password: 'Pass123!',
        role: 'patient'
      })
      .expect(201);

    // Assert - Branch FALSE executed (continues to create user)
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('Registration successful');

    // Coverage achieved:
    // ✓ if (existingDoctor || existingPatient) → FALSE branch
    // ✓ Continues to user creation
  });
});
