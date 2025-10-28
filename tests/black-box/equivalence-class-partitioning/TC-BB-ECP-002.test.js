/**
 * TC-BB-ECP-002: Admin Login with Invalid Email (Invalid Class)
 * Technique: Equivalence Class Partitioning
 * Module: Admin Authentication
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import authRoutes from '../../../src/routes/auth.js';

describe('TC-BB-ECP-002: Admin Login with Invalid Email', () => {
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

  it('should return 401 for non-existent admin email', async () => {
    const response = await request(app)
      .post('/api/auth/admin/login')
      .send({
        email: 'nonexistent@admin.com',
        password: 'SomePassword123'
      })
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/invalid credentials/i);
  });
});
