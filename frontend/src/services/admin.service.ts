// frontend/src/services/admin.service.ts
import axios from '../utils/axios';
import { DashboardStats, UserManagementUser, AdminActionLog, UserFilters } from '../types/admin';

/**
 * Admin Service
 * Handles all admin-related API calls for user management dashboard
 */
class AdminService {
  private baseURL = '/admin';

  /**
   * Get dashboard statistics
   * @returns Promise<DashboardStats> Dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await axios.get(`${this.baseURL}/dashboard/stats`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw new Error('Failed to fetch dashboard statistics');
    }
  }

  /**
   * Get all users with filtering and pagination
   * @param filters UserFilters object with optional filtering parameters
   * @returns Promise with users and pagination info
   */
  async getUsers(filters: UserFilters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await axios.get(`${this.baseURL}/users?${params}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  /**
   * Verify or update user verification status
   * @param userId User ID to verify
   * @param verificationStatus New verification status
   * @param userType Type of user (doctor/patient)
   * @param reason Optional reason for the action
   */
  async verifyUser(
    userId: string, 
    verificationStatus: string, 
    userType: 'doctor' | 'patient',
    reason?: string
  ) {
    try {
      const response = await axios.put(`${this.baseURL}/users/${userId}/verify`, {
        verificationStatus,
        userType,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying user:', error);
      throw new Error('Failed to verify user');
    }
  }

  /**
   * Suspend or activate user account
   * @param userId User ID to toggle status
   * @param action Action to perform ('suspend' | 'activate')
   * @param userType Type of user (doctor/patient)
   * @param reason Reason for the action
   */
  async toggleUserStatus(
    userId: string, 
    action: 'suspend' | 'activate',
    userType: 'doctor' | 'patient',
    reason?: string
  ) {
    try {
      const response = await axios.put(`${this.baseURL}/users/${userId}/toggle-status`, {
        action,
        userType,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw new Error('Failed to update user status');
    }
  }

  /**
   * Update user role (super admin only)
   * @param userId User ID to update role
   * @param newRole New role to assign
   * @param userType Type of user (doctor/patient)
   */
  async updateUserRole(
    userId: string,
    newRole: string,
    userType: 'doctor' | 'patient'
  ) {
    try {
      const response = await axios.put(`${this.baseURL}/users/${userId}/role`, {
        newRole,
        userType
      });
      return response.data;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw new Error('Failed to update user role');
    }
  }

  /**
   * Get admin action logs
   * @param filters Optional filters for logs
   */
  async getAdminLogs(filters: any = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await axios.get(`${this.baseURL}/logs?${params}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching admin logs:', error);
      throw new Error('Failed to fetch admin logs');
    }
  }
}

export default new AdminService();