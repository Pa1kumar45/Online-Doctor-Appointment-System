/**
 * auth.service.ts - Authentication service module
 * 
 * This service module handles all authentication-related operations for the Health-Connect application.
 * It provides comprehensive user authentication including:
 * - User registration (doctors and patients)
 * - User login with role-based access
 * - Current user retrieval and validation
 * - Session management and logout
 * - Authentication state checking
 * 
 * Features:
 * - Role-based authentication (doctor/patient)
 * - Cookie-based session management
 * - Local storage token management
 * - Error handling with descriptive messages
 * - TypeScript type safety
 * 
 * Authentication Flow:
 * 1. User registers/logs in with credentials
 * 2. Server returns JWT token and user data
 * 3. Token stored in localStorage, session in cookies
 * 4. Subsequent requests include credentials for validation
 * 5. Logout clears local storage and session
 * 
 * API Endpoints:
 * - POST /auth/register - User registration
 * - POST /auth/login - User login
 * - GET /auth/me - Get current user
 * 
 * Used by: Login/signup forms, authentication context, protected routes
 * Dependencies: LoginCredentials, AuthResponse types
 */

import { LoginCredentials, AuthResponse } from '../types/index.ts';  // Type definitions

// Environment configuration - backend URL from Vite environment variables
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// API base URL for authentication endpoints
export const API_URL = `${BACKEND_URL}/api`;


/**
 * authService - Comprehensive authentication service
 * 
 * This service handles all user authentication operations including registration,
 * login, session management, and authentication state checking. Uses both
 * localStorage for client-side tokens and HTTP cookies for server sessions.
 */
export const authService = {
  /**
   * register - Registers a new user (doctor or patient)
   * 
   * Creates a new user account with role-based registration.
   * Supports both doctor and patient registration with appropriate
   * data validation and role assignment.
   * 
   * API Details:
   * - Endpoint: POST /api/auth/register
   * - Authentication: Not required (public endpoint)
   * - Content-Type: application/json
   * - Credentials: Included for session creation
   * 
   * @param {Object} data - Registration data object
   * @param {string} data.email - User email address
   * @param {string} data.password - User password
   * @param {string} data.name - User full name
   * @param {string} data.role - User role ('doctor' or 'patient')
   * @returns {Promise<AuthResponse>} Registration response with user data and token
   * 
   * @throws {Error} If registration fails due to validation or server errors
   * 
   * Example:
   * ```typescript
   * const response = await authService.register({
   *   email: 'john@example.com',
   *   password: 'securePassword123',
   *   name: 'John Doe',
   *   role: 'patient'
   * });
   * ```
   */
  async register(data: LoginCredentials & { name: string; role: string }): Promise<AuthResponse> {
    console.log("register data");
    console.log(data);
    
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',    // Include cookies for session management
      body: JSON.stringify(data)
    });

    // Error handling for registration failures
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }
    
    const result = await response.json();
    console.log("registration complete", result);
    return result;
  },

  /**
   * login - Authenticates user and creates session
   * 
   * Validates user credentials and creates authenticated session.
   * Returns user data and authentication token for subsequent requests.
   * 
   * API Details:
   * - Endpoint: POST /api/auth/login
   * - Authentication: Not required (public endpoint)
   * - Content-Type: application/json
   * - Credentials: Included for session creation
   * 
   * @param {Object} credentials - Login credentials object
   * @param {string} credentials.email - User email address
   * @param {string} credentials.password - User password
   * @param {string} credentials.role - User role ('doctor' or 'patient')
   * @returns {Promise<AuthResponse>} Login response with user data and token
   * 
   * @throws {Error} If login fails due to invalid credentials
   * 
   * Example:
   * ```typescript
   * const response = await authService.login({
   *   email: 'john@example.com',
   *   password: 'securePassword123',
   *   role: 'patient'
   * });
   * ```
   */
  async login(credentials: LoginCredentials & { role: string }): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      credentials: 'include',    // Include cookies for session management
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    // Error handling for login failures
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const result = await response.json();
    return result;
  },

  /**
   * getCurrentUser - Retrieves current authenticated user information
   * 
   * Fetches current user data from server using stored authentication token.
   * Used to restore user session on app initialization and verify authentication.
   * 
   * API Details:
   * - Endpoint: GET /api/auth/me
   * - Authentication: Required (token or session)
   * - Credentials: Included for session validation
   * 
   * @returns {Promise<AuthResponse>} Current user data
   * @throws {Error} If no token found or authentication invalid
   * 
   * Example:
   * ```typescript
   * try {
   *   const user = await authService.getCurrentUser();
   *   console.log('Current user:', user);
   * } catch (error) {
   *   console.log('User not authenticated');
   * }
   * ```
   */
  async getCurrentUser() {
    // Check for stored authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_URL}/auth/me`, {
      credentials: 'include'    // Include session cookies
    });

    // Error handling for authentication validation
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get user');
    }

    return response.json();
  },

  /**
   * logout - Terminates user session and clears authentication data
   * 
   * Clears stored authentication token from localStorage.
   * Note: Server-side session invalidation should also be implemented.
   * 
   * Actions:
   * - Removes authentication token from localStorage
   * - Clears any cached user data
   * 
   * Example:
   * ```typescript
   * authService.logout();
   * // User is now logged out locally
   * ```
   */
  logout() {
    localStorage.removeItem('token');
    // Note: Consider implementing server-side logout endpoint
    // localStorage.removeItem('user'); // Additional cleanup if needed
  },

  /**
   * isAuthenticated - Checks if user is currently authenticated
   * 
   * Simple check for authentication token presence in localStorage.
   * Used for client-side route protection and UI state management.
   * 
   * @returns {boolean} True if authentication token exists, false otherwise
   * 
   * Note: This only checks for token presence, not validity.
   * Server-side validation should be used for secure operations.
   * 
   * Example:
   * ```typescript
   * if (authService.isAuthenticated()) {
   *   // Show authenticated user interface
   * } else {
   *   // Redirect to login page
   * }
   * ```
   */
  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
  
  // Note: Additional methods commented out for potential future implementation
  // getStoredUser() method template available for local user data caching
}; 