import mongoose from 'mongoose';

const adiminActionLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  },
  actionType: {
    type: String,
    required: true,
    enum: [
      'user_verification',
      'user_suspension',
      'user_activation',
      'role_change',
      'account_deletion',
      'password_reset',
      'profile_update',
    ],
  },
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  targetUserType: {
    type: String,
    required: true,
    enum: ['Doctor', 'Patient', 'Admin'],
  },
  previousData: {
    type: mongoose.Schema.Types.Mixed,
  },
  newData: {
    type: mongoose.Schema.Types.Mixed,
  },
  reason: {
    type: String,
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
}, {
  timestamps: true,
});

adiminActionLogSchema.index({ adminId: 1, createdAt: -1 });
adiminActionLogSchema.index({ targetUserId: 1, createdAt: -1 });

export default mongoose.model('AdminActionLog', adiminActionLogSchema);
