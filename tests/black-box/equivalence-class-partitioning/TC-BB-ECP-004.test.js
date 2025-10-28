/**
 * TC-BB-ECP-004: Patient Registration with Invalid Role (Invalid Class)
 * Technique: Equivalence Class Partitioning
 * Module: Patient Registration
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import authRoutes from '../../../src/routes/auth.js';

describe('TC-BB-ECP-004: Patient Registration with Invalid Role', () => {
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

  it('should return 400 for invalid role (admin)', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'John Doe',
        email: 'john.doe@email.com',
        password: 'Pass1234!',
        role: 'admin' // Invalid - only doctor or patient allowed
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/role|invalid/i);
  });
});
