import mongoose from 'mongoose';
import Doctor from '../../src/models/Doctor.js';

describe('Doctor Model Tests', () => {
  beforeAll(async () => {
    // Connect to test database before running tests
    const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/healthconnect-test';
    await mongoose.connect(mongoUri);
    console.log('Connected to test database');
  });

  afterAll(async () => {
    // Clean up and disconnect after tests
    await Doctor.deleteMany({});
    await mongoose.connection.close();
    console.log('Disconnected from test database');
  });

  afterEach(async () => {
    // Clear database after each test
    await Doctor.deleteMany({});
  });

  test('should create a new doctor successfully', async () => {
    const doctorData = {
      name: 'Dr. John Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      specialization: 'Cardiology',
      qualification: 'MBBS, MD',
      experience: 10,
    };

    const doctor = await Doctor.create(doctorData);
    
    expect(doctor._id).toBeDefined();
    expect(doctor.name).toBe(doctorData.name);
    expect(doctor.email).toBe(doctorData.email);
    expect(doctor.specialization).toBe(doctorData.specialization);
    expect(doctor.experience).toBe(doctorData.experience);
    expect(doctor.isActive).toBe(true); // Default value
    expect(doctor.verificationStatus).toBe('pending'); // Default value
  });

  test('should hash password before saving', async () => {
    const doctorData = {
      name: 'Dr. Jane Smith',
      email: 'jane.smith@example.com',
      password: 'plainPassword',
      specialization: 'Dermatology',
      qualification: 'MBBS',
      experience: 5,
    };

    const doctor = await Doctor.create(doctorData);
    
    // Password should be hashed, not plain text
    expect(doctor.password).not.toBe('plainPassword');
    expect(doctor.password.length).toBeGreaterThan(20);
    // Should start with bcrypt hash prefix
    expect(doctor.password).toMatch(/^\$2[aby]\$/);
  });

  test('should compare password correctly', async () => {
    const plainPassword = 'mySecurePassword123';
    const doctorData = {
      name: 'Dr. Test Password',
      email: 'password@test.com',
      password: plainPassword,
      specialization: 'General Medicine',
      qualification: 'MBBS',
      experience: 3,
    };

    const doctor = await Doctor.create(doctorData);
    
    // Correct password should match
    const isMatch = await doctor.comparePassword(plainPassword);
    expect(isMatch).toBe(true);
    
    // Wrong password should not match
    const isWrongMatch = await doctor.comparePassword('wrongPassword');
    expect(isWrongMatch).toBe(false);
  });

  test('should fail without required fields', async () => {
    const invalidDoctor = new Doctor({
      name: 'Dr. Incomplete'
      // Missing required fields: email, password, specialization, qualification, experience
    });

    await expect(invalidDoctor.save()).rejects.toThrow();
  });

  test('should not allow duplicate email', async () => {
    const doctorData = {
      name: 'Dr. Test',
      email: 'duplicate@example.com',
      password: 'password123',
      specialization: 'General',
      qualification: 'MBBS',
      experience: 3,
    };

    await Doctor.create(doctorData);
    
    // Try to create another doctor with same email
    const duplicateDoctor = new Doctor(doctorData);
    await expect(duplicateDoctor.save()).rejects.toThrow();
  });

  test('should convert email to lowercase', async () => {
    const doctorData = {
      name: 'Dr. Case Test',
      email: 'TestEmail@EXAMPLE.COM',
      password: 'password123',
      specialization: 'Pediatrics',
      qualification: 'MBBS, DCH',
      experience: 7,
    };

    const doctor = await Doctor.create(doctorData);
    
    // Email should be converted to lowercase
    expect(doctor.email).toBe('testemail@example.com');
  });

  test('should trim whitespace from fields', async () => {
    const doctorData = {
      name: '  Dr. Whitespace Test  ',
      email: '  whitespace@test.com  ',
      password: 'password123',
      specialization: '  Neurology  ',
      qualification: '  MBBS, MD  ',
      experience: 5,
    };

    const doctor = await Doctor.create(doctorData);
    
    expect(doctor.name).toBe('Dr. Whitespace Test');
    expect(doctor.email).toBe('whitespace@test.com');
    expect(doctor.specialization).toBe('Neurology');
    expect(doctor.qualification).toBe('MBBS, MD');
  });

  test('should not hash password if not modified', async () => {
    const doctorData = {
      name: 'Dr. Update Test',
      email: 'update@test.com',
      password: 'password123',
      specialization: 'Surgery',
      qualification: 'MBBS, MS',
      experience: 8,
    };

    const doctor = await Doctor.create(doctorData);
    const originalPassword = doctor.password;
    
    // Update a field other than password
    doctor.name = 'Dr. Updated Name';
    await doctor.save();
    
    // Password hash should remain the same
    expect(doctor.password).toBe(originalPassword);
  });

  test('should create doctor with optional fields', async () => {
    const doctorData = {
      name: 'Dr. Complete Profile',
      email: 'complete@test.com',
      password: 'password123',
      specialization: 'Orthopedics',
      qualification: 'MBBS, MS',
      experience: 12,
      about: 'Experienced orthopedic surgeon',
      contactNumber: '+1234567890',
      avatar: 'https://example.com/avatar.jpg',
      schedule: [{
        day: 'Monday',
        slots: [{
          slotNumber: 1,
          startTime: '09:00',
          endTime: '10:00',
          isAvailable: true
        }]
      }]
    };

    const doctor = await Doctor.create(doctorData);
    
    expect(doctor.about).toBe(doctorData.about);
    expect(doctor.contactNumber).toBe(doctorData.contactNumber);
    expect(doctor.avatar).toBe(doctorData.avatar);
    expect(doctor.schedule).toHaveLength(1);
    expect(doctor.schedule[0].day).toBe('Monday');
  });

  test('should have timestamps', async () => {
    const doctorData = {
      name: 'Dr. Timestamp Test',
      email: 'timestamp@test.com',
      password: 'password123',
      specialization: 'Radiology',
      qualification: 'MBBS, MD',
      experience: 6,
    };

    const doctor = await Doctor.create(doctorData);
    
    expect(doctor.createdAt).toBeDefined();
    expect(doctor.updatedAt).toBeDefined();
    expect(doctor.createdAt).toBeInstanceOf(Date);
    expect(doctor.updatedAt).toBeInstanceOf(Date);
  });

  test('should validate experience as non-negative', async () => {
    const doctorData = {
      name: 'Dr. Negative Experience',
      email: 'negative@test.com',
      password: 'password123',
      specialization: 'Oncology',
      qualification: 'MBBS',
      experience: -5, // Negative experience
    };

    await expect(Doctor.create(doctorData)).rejects.toThrow();
  });

  test('should validate verificationStatus enum', async () => {
    const doctorData = {
      name: 'Dr. Verification Test',
      email: 'verification@test.com',
      password: 'password123',
      specialization: 'ENT',
      qualification: 'MBBS',
      experience: 4,
      verificationStatus: 'invalid_status' // Invalid enum value
    };

    await expect(Doctor.create(doctorData)).rejects.toThrow();
  });

  test('should validate schedule day enum', async () => {
    const doctorData = {
      name: 'Dr. Schedule Test',
      email: 'schedule@test.com',
      password: 'password123',
      specialization: 'Psychiatry',
      qualification: 'MBBS, MD',
      experience: 9,
      schedule: [{
        day: 'Funday', // Invalid day
        slots: []
      }]
    };

    await expect(Doctor.create(doctorData)).rejects.toThrow();
  });
});
