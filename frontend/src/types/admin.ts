// frontend/src/types/admin.ts
export interface Admin {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
  permissions: string[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserManagementUser {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  userType: 'doctor' | 'patient';
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'under_review';
  isActive: boolean;
  specialization?: string;
  medicalLicense?: string;
  suspensionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  users: {
    totalDoctors: number;
    totalPatients: number;
    pendingVerification: number;
    suspended: number;
  };
  appointments: {
    today: number;
    total: number;
  };
  recentActivity: {
    newDoctors: number;
    newPatients: number;
  };
}

export interface AdminActionLog {
  _id: string;
  adminId: {
    _id: string;
    name: string;
    email: string;
  };
  actionType: string;
  targetUserId: string;
  targetUserType: 'Doctor' | 'Patient' | 'Admin';
  previousData: any;
  newData: any;
  reason?: string;
  createdAt: Date;
}

export interface UserFilters {
  role?: 'doctor' | 'patient' | 'admin' | 'super_admin';
  status?: 'active' | 'inactive';
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  search?: string;
  page?: number;
  limit?: number;
}

// Auth-related types for Admin Logs page (SRS requirements)
export interface AuthLog {
  _id: string;
  userId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  message?: string;
  createdAt: Date;
}

export interface FailedLoginAttempt {
  _id: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  reason?: string;
  createdAt: Date;
}

export interface AuthStats {
  totalLogins: number;
  successfulLogins: number;
  failedLogins: number;
  successRate?: number;
  topIPs?: { ip: string; count: number }[];
  recentFailedAttempts?: FailedLoginAttempt[];
}