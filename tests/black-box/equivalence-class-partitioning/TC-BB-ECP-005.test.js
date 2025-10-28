/**
 * TC-BB-ECP-005: Appointment Booking with Valid Time Slot (Valid Class)
 * Technique: Equivalence Class Partitioning
 * Module: Appointment Management
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import Doctor from '../../../src/models/Doctor.js';
import Patient from '../../../src/models/Patient.js';
import appointmentRoutes from '../../../src/routes/appointments.js';
import { authenticate } from '../../../src/middleware/auth.js';

describe('TC-BB-ECP-005: Appointment Booking with Valid Time Slot', () => {
  let mongoServer;
  let app;
  let doctorId;
  let patientId;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    app = express();
    app.use(express.json());
    app.use('/api/appointments', appointmentRoutes);

    // Create verified doctor
    const doctor = await Doctor.create({
      name: 'Dr. Test',
      email: 'doctor@test.com',
      password: 'hashedpassword',
      role: 'doctor',
      specialization: 'General',
      experience: 5,
      qualification: 'MBBS',
      isEmailVerified: true,
      isActive: true
    });
    doctorId = doctor._id.toString();

    // Create verified patient
    const patient = await Patient.create({
      name: 'Test Patient',
      email: 'patient@test.com',
      password: 'hashedpassword',
      role: 'patient',
      isEmailVerified: true
    });
    patientId = patient._id.toString();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should create appointment successfully with valid data', async () => {
    const response = await request(app)
      .post('/api/appointments')
      .send({
        doctorId: doctorId,
        patientId: patientId,
        date: '2025-11-05',
        time: '10:00 AM',
        reason: 'Regular checkup'
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.appointment).toBeDefined();
    expect(response.body.appointment.doctorId).toBe(doctorId);
    expect(response.body.appointment.patientId).toBe(patientId);
  });
});
