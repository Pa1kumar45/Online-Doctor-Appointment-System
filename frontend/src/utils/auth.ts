/**
 * Authentication Utilities
 * Helper functions for user authentication and authorization
 */

/**
 * Get current user from localStorage
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const user = getCurrentUser();
  return user !== null;
};

/**
 * Check if current user is an admin
 * Returns true if user has admin or super_admin role
 */
export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  
  return user.role === 'admin' || user.role === 'super_admin';
};

/**
 * Check if current user is a super admin
 */
export const isSuperAdmin = (): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  
  return user.role === 'super_admin';
};

/**
 * Check if current user is a doctor
 */
export const isDoctor = (): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  
  return user.role === 'doctor';
};

/**
 * Check if current user is a patient
 */
export const isPatient = (): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  
  return user.role === 'patient';
};

/**
 * Get user role
 */
export const getUserRole = (): string | null => {
  const user = getCurrentUser();
  return user?.role || null;
};

/**
 * Clear authentication data
 */
export const clearAuth = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

/**
 * Set user data in localStorage
 */
export const setUser = (user: any) => {
  localStorage.setItem('user', JSON.stringify(user));
};