import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'userType',
    required: true,
    index: true
  },
  userType: {
    type: String,
    required: true,
    enum: ['Doctor', 'Patient', 'Admin']
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  deviceInfo: {
    browser: {
      type: String,
      default: 'Unknown'
    },
    os: {
      type: String,
      default: 'Unknown'
    },
    device: {
      type: String,
      default: 'Unknown'
    }
  },
  ipAddress: {
    type: String,
    required: true
  },
  lastActivity: {
    type: Date,
    default: Date.now,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  revokedReason: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Compound index for efficient user session queries
sessionSchema.index({ userId: 1, isActive: 1, expiresAt: 1 });

// Index for cleanup of expired sessions
sessionSchema.index({ expiresAt: 1, isActive: 1 });

/**
 * Static method to create a new session
 */
sessionSchema.statics.createSession = async function(sessionData) {
  try {
    const session = new this(sessionData);
    await session.save();
    return session;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

/**
 * Static method to get user's active sessions
 */
sessionSchema.statics.getUserSessions = async function(userId, userType) {
  try {
    const sessions = await this.find({
      userId,
      userType,
      isActive: true,
      expiresAt: { $gt: new Date() }
    })
    .sort({ lastActivity: -1 })
    .lean();

    return sessions;
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    throw error;
  }
};

/**
 * Static method to find session by token
 */
sessionSchema.statics.findByToken = async function(token) {
  try {
    return await this.findOne({
      token,
      isActive: true,
      expiresAt: { $gt: new Date() }
    });
  } catch (error) {
    console.error('Error finding session by token:', error);
    return null;
  }
};

/**
 * Static method to update session activity
 */
sessionSchema.statics.updateActivity = async function(token) {
  try {
    await this.findOneAndUpdate(
      { token, isActive: true },
      { lastActivity: new Date() },
      { new: true }
    );
  } catch (error) {
    console.error('Error updating session activity:', error);
  }
};

/**
 * Static method to revoke a specific session
 */
sessionSchema.statics.revokeSession = async function(sessionId, userId) {
  try {
    const result = await this.findOneAndUpdate(
      { _id: sessionId, userId, isActive: true },
      { isActive: false },
      { new: true }
    );
    return result;
  } catch (error) {
    console.error('Error revoking session:', error);
    throw error;
  }
};

/**
 * Static method to revoke all user sessions except current
 */
sessionSchema.statics.revokeAllSessions = async function(userId, exceptToken = null) {
  try {
    const query = {
      userId,
      isActive: true
    };
    
    if (exceptToken) {
      query.token = { $ne: exceptToken };
    }

    const result = await this.updateMany(
      query,
      { isActive: false }
    );
    
    return result;
  } catch (error) {
    console.error('Error revoking all sessions:', error);
    throw error;
  }
};

/**
 * Static method to enforce single device login
 * Revokes ALL existing sessions for a user when they log in from a new device
 * Used for FR-1.4 Single Device Login Enforcement
 * 
 * @param {ObjectId} userId - User's ID
 * @param {String} userType - User type ('Doctor', 'Patient', 'Admin')
 * @returns {Object} Result with count of revoked sessions
 */
sessionSchema.statics.enforceSingleDevice = async function(userId, userType) {
  try {
    // Get count of active sessions before revoking
    const activeSessionsCount = await this.countDocuments({
      userId,
      userType,
      isActive: true,
      expiresAt: { $gt: new Date() }
    });

    // Revoke all active sessions for this user
    const result = await this.updateMany(
      {
        userId,
        userType,
        isActive: true
      },
      { 
        isActive: false,
        revokedReason: 'New device login - single device enforcement'
      }
    );
    
    console.log(`✓ Single device enforcement: Revoked ${activeSessionsCount} session(s) for user ${userId}`);
    
    return {
      revokedCount: result.modifiedCount,
      previousDeviceLoggedOut: activeSessionsCount > 0
    };
  } catch (error) {
    console.error('Error enforcing single device login:', error);
    throw error;
  }
};

/**
 * Static method to clean up expired sessions
 */
sessionSchema.statics.cleanupExpired = async function() {
  try {
    const result = await this.updateMany(
      {
        expiresAt: { $lt: new Date() },
        isActive: true
      },
      { isActive: false }
    );
    
    console.log(`✓ Cleaned up ${result.modifiedCount} expired sessions`);
    return result;
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
    throw error;
  }
};

/**
 * Static method to delete old inactive sessions (for database maintenance)
 */
sessionSchema.statics.deleteOldSessions = async function(daysOld = 30) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.deleteMany({
      isActive: false,
      updatedAt: { $lt: cutoffDate }
    });

    console.log(`✓ Deleted ${result.deletedCount} old inactive sessions`);
    return result;
  } catch (error) {
    console.error('Error deleting old sessions:', error);
    throw error;
  }
};

/**
 * Instance method to check if session is valid
 */
sessionSchema.methods.isValid = function() {
  return this.isActive && this.expiresAt > new Date();
};

/**
 * Instance method to get session duration
 */
sessionSchema.methods.getDuration = function() {
  const now = new Date();
  const created = this.createdAt;
  const durationMs = now - created;
  const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
  const durationDays = Math.floor(durationHours / 24);

  if (durationDays > 0) {
    return `${durationDays} day${durationDays > 1 ? 's' : ''} ago`;
  } else if (durationHours > 0) {
    return `${durationHours} hour${durationHours > 1 ? 's' : ''} ago`;
  } else {
    const durationMinutes = Math.floor(durationMs / (1000 * 60));
    return `${durationMinutes} minute${durationMinutes > 1 ? 's' : ''} ago`;
  }
};

const Session = mongoose.model('Session', sessionSchema);

export default Session;
