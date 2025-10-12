// backend/src/controllers/adminController.js
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Admin from '../models/Admin.js';
import AdminActionLog from '../models/AdminActionLog.js';
import Appointment from '../models/Appointment.js';

/**
 * Get dashboard statistics
 * @route GET /api/admin/dashboard/stats
 * @access Admin only
 */
const getDashboardStats = async (req, res) => {
  try {
    // Get user counts
    const [
      totalDoctors,
      totalPatients,
      pendingDoctors,
      pendingPatients,
      suspendedDoctors,
      suspendedPatients,
      todaysAppointments,
      totalAppointments
    ] = await Promise.all([
      Doctor.countDocuments({ isActive: true }),
      Patient.countDocuments({ isActive: true }),
      Doctor.countDocuments({ verificationStatus: 'pending' }),
      Patient.countDocuments({ verificationStatus: 'pending' }),
      Doctor.countDocuments({ isActive: false }),
      Patient.countDocuments({ isActive: false }),
      Appointment.countDocuments({ 
        date: { 
          $gte: new Date().setHours(0, 0, 0, 0),
          $lt: new Date().setHours(23, 59, 59, 999)
        }
      }),
      Appointment.countDocuments()
    ]);

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRegistrations = await Promise.all([
      Doctor.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Patient.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
    ]);

    res.json({
      success: true,
      data: {
        users: {
          totalDoctors,
          totalPatients,
          pendingVerification: pendingDoctors + pendingPatients,
          suspended: suspendedDoctors + suspendedPatients
        },
        appointments: {
          today: todaysAppointments,
          total: totalAppointments
        },
        recentActivity: {
          newDoctors: recentRegistrations[0],
          newPatients: recentRegistrations[1]
        }
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics'
    });
  }
};

/**
 * Get all users with filtering and pagination
 * @route GET /api/admin/users
 * @access Admin only
 */
const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      status,
      verificationStatus,
      search
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let users = [];
    let totalUsers = 0;

    // Build query filter
    const buildFilter = () => {
      const filter = {};
      
      if (status) {
        filter.isActive = status === 'active';
      }
      
      if (verificationStatus) {
        filter.verificationStatus = verificationStatus;
      }
      
      if (search) {
        filter.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ];
      }
      
      return filter;
    };

    // Get users based on role filter
    if (!role || role === 'doctor') {
      const filter = buildFilter();
      const doctors = await Doctor.find(filter)
        .select('firstName lastName email phone specialization verificationStatus isActive createdAt')
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 })
        .lean();
      
      users.push(...doctors.map(doc => ({
        ...doc,
        userType: 'doctor',
        fullName: `${doc.firstName} ${doc.lastName}`
      })));
      
      if (!role) {
        totalUsers += await Doctor.countDocuments(filter);
      } else {
        totalUsers = await Doctor.countDocuments(filter);
      }
    }

    if (!role || role === 'patient') {
      const filter = buildFilter();
      const patients = await Patient.find(filter)
        .select('firstName lastName email phone verificationStatus isActive createdAt')
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 })
        .lean();
      
      users.push(...patients.map(pat => ({
        ...pat,
        userType: 'patient',
        fullName: `${pat.firstName} ${pat.lastName}`
      })));
      
      if (!role) {
        totalUsers += await Patient.countDocuments(filter);
      } else {
        totalUsers = await Patient.countDocuments(filter);
      }
    }

    const totalPages = Math.ceil(totalUsers / limitNum);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalUsers,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};

/**
 * Helper function to get users from both collections
 */
const getAllUsersFromBothCollections = async (pipeline) => {
  const [doctors, patients] = await Promise.all([
    Doctor.aggregate([
      { $addFields: { userType: 'doctor', fullName: { $concat: ['$firstName', ' ', '$lastName'] } } },
      ...pipeline.slice(1) // Skip the $unionWith stage
    ]),
    Patient.aggregate([
      { $addFields: { userType: 'patient', fullName: { $concat: ['$firstName', ' ', '$lastName'] } } },
      ...pipeline.slice(1)
    ])
  ]);

  return [...doctors, ...patients].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

/**
 * Verify/Update user status
 * @route PUT /api/admin/users/:id/verify
 * @access Admin only
 */
const verifyUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { verificationStatus, reason, userType } = req.body;
    const adminId = req.user._id;

    // Determine the model based on userType
    const Model = userType === 'doctor' ? Doctor : Patient;
    
    // Get current user data for logging
    const currentUser = await Model.findById(id);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Store previous data for audit log
    const previousData = {
      verificationStatus: currentUser.verificationStatus,
      isActive: currentUser.isActive
    };

    // Update user
    const updatedUser = await Model.findByIdAndUpdate(
      id,
      {
        verificationStatus,
        verifiedBy: adminId,
        verifiedAt: new Date(),
        ...(verificationStatus === 'rejected' && { isActive: false })
      },
      { new: true }
    );

    // Log admin action
    await AdminActionLog.create({
      adminId,
      actionType: 'user_verification',
      targetUserId: id,
      targetUserType: userType === 'doctor' ? 'Doctor' : 'Patient',
      previousData,
      newData: {
        verificationStatus: updatedUser.verificationStatus,
        isActive: updatedUser.isActive
      },
      reason,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // TODO: Send notification email to user
    // await sendVerificationEmail(updatedUser, verificationStatus);

    res.json({
      success: true,
      message: `User ${verificationStatus} successfully`,
      data: updatedUser
    });
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user verification status'
    });
  }
};

/**
 * Suspend/Activate user account
 * @route PUT /api/admin/users/:id/toggle-status
 * @access Admin only
 */
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason, userType } = req.body; // action: 'suspend' | 'activate'
    const adminId = req.user._id;

    const Model = userType === 'doctor' ? Doctor : Patient;
    
    const currentUser = await Model.findById(id);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isActive = action === 'activate';
    const updateData = {
      isActive,
      ...(action === 'suspend' && {
        suspensionReason: reason,
        suspendedBy: adminId,
        suspendedAt: new Date()
      })
    };

    const updatedUser = await Model.findByIdAndUpdate(id, updateData, { new: true });

    // If suspending a doctor, cancel their future appointments
    if (action === 'suspend' && userType === 'doctor') {
      await cancelFutureAppointments(id, 'doctor');
    }

    // Log admin action
    await AdminActionLog.create({
      adminId,
      actionType: action === 'suspend' ? 'user_suspension' : 'user_activation',
      targetUserId: id,
      targetUserType: userType === 'doctor' ? 'Doctor' : 'Patient',
      previousData: { isActive: currentUser.isActive },
      newData: { isActive },
      reason,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: `User ${action}d successfully`,
      data: updatedUser
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user status'
    });
  }
};

/**
 * Cancel future appointments for suspended user
 */
const cancelFutureAppointments = async (userId, userType) => {
  const query = userType === 'doctor' ? { doctorId: userId } : { patientId: userId };
  
  await Appointment.updateMany(
    {
      ...query,
      date: { $gte: new Date() },
      status: { $in: ['pending', 'confirmed'] }
    },
    {
      status: 'cancelled',
      cancellationReason: `Account ${userType === 'doctor' ? 'doctor' : 'patient'} suspended by admin`,
      cancelledAt: new Date()
    }
  );
};

/**
 * Update user role (for role management)
 * @route PUT /api/admin/users/:id/role
 * @access Super Admin only
 */
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { newRole, userType } = req.body;
    const adminId = req.user._id;

    // Only super admin can change roles
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only super admin can change user roles'
      });
    }

    const Model = userType === 'doctor' ? Doctor : Patient;
    const currentUser = await Model.findById(id);
    
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // For now, we're managing role within the same collection
    // In future, you might want to implement role migration between collections
    
    // Log the action
    await AdminActionLog.create({
      adminId,
      actionType: 'role_change',
      targetUserId: id,
      targetUserType: userType === 'doctor' ? 'Doctor' : 'Patient',
      previousData: { userType },
      newData: { userType: newRole },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Role update logged (feature in development)',
      data: currentUser
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user role'
    });
  }
};

/**
 * Get admin action logs
 * @route GET /api/admin/logs
 * @access Admin only
 */
const getAdminLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      actionType,
      targetUserId,
      adminId
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (actionType) query.actionType = actionType;
    if (targetUserId) query.targetUserId = targetUserId;
    if (adminId) query.adminId = adminId;

    const [logs, total] = await Promise.all([
      AdminActionLog.find(query)
        .populate('adminId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      AdminActionLog.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get admin logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin logs'
    });
  }
};

export {
  getDashboardStats,
  getAllUsers,
  verifyUser,
  toggleUserStatus,
  updateUserRole,
  getAdminLogs
};