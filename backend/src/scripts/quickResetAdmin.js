/**
 * Quick Admin Password Reset
 * Sets a simple password for testing
 * Usage: node src/scripts/quickResetAdmin.js
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';
import dotenv from 'dotenv';

dotenv.config();

const quickResetAdmin = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Default credentials
    const adminEmail = 'admin@healthconnect.com';
    const newPassword = 'admin123'; // Simple password for testing

    const admin = await Admin.findOne({ email: adminEmail });
    
    if (!admin) {
      console.log(`❌ Admin with email "${adminEmail}" not found!`);
      process.exit(1);
    }

    // Hash and update password (using updateOne to bypass pre-save hook)
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await Admin.updateOne(
      { email: adminEmail },
      { $set: { password: hashedPassword } }
    );

    console.log('✅ Password reset successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    admin@healthconnect.com');
    console.log('🔑 Password: admin123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🔗 Login at: http://localhost:5173/admin/login\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

quickResetAdmin();
