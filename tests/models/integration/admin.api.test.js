const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/index'); // Your Express app
const Admin = require('../../src/models/Admin');
const Doctor = require('../../src/models/Doctor');

describe('Admin API Integration Tests', () => {
  let adminToken;
  let superAdminToken;
  let testDoctor;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI);

    // Create test admin user
    const admin = await Admin.create({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: 'admin123',
      role: 'admin'
    });

    // Login to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'admin123' });
    
    adminToken = loginRes.body.token;
  });

  afterAll(async () => {
    await Admin.deleteMany({});
    await Doctor.deleteMany({});
    await mongoose.connection.close();
  });

  describe('GET /api/admin/dashboard/stats', () => {
    test('should return dashboard statistics', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalDoctors');
      expect(res.body.data).toHaveProperty('totalPatients');
      expect(res.body.data).toHaveProperty('pendingVerifications');
    });

    test('should fail without authentication', async () => {
      await request(app)
        .get('/api/admin/dashboard/stats')
        .expect(401); // Unauthorized
    });
  });

  describe('POST /api/admin/users/:userId/verify', () => {
    beforeEach(async () => {
      testDoctor = await Doctor.create({
        name: 'Dr. Test',
        email: 'doctor@test.com',
        password: 'password123',
        specialization: 'Cardiology',
        qualifications: ['MBBS'],
        experience: 5,
        consultationFee: 500,
        isVerified: false
      });
    });

    test('should verify a doctor successfully', async () => {
      const res = await request(app)
        .post(`/api/admin/users/${testDoctor._id}/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userType: 'doctor' })
        .expect(200);

      expect(res.body.success).toBe(true);
      
      // Verify doctor is now verified in database
      const updatedDoctor = await Doctor.findById(testDoctor._id);
      expect(updatedDoctor.isVerified).toBe(true);
    });

    test('should create audit log entry', async () => {
      await request(app)
        .post(`/api/admin/users/${testDoctor._id}/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userType: 'doctor' });

      const logs = await AdminActionLog.find({ 
        actionType: 'verify_user',
        targetUser: testDoctor._id 
      });
      
      expect(logs.length).toBe(1);
    });
  });
});