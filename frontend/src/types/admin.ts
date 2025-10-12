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
  role?: 'doctor' | 'patient';
  status?: 'active' | 'inactive';
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  search?: string;
  page?: number;
  limit?: number;
}