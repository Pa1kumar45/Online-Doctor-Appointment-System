/**
 * Authentication Routes
 * 
 * This module defines all authentication-related API endpoints including:
 * - User registration (doctors and patients)
 * - User login and logout
 * - Current user retrieval
 * - JWT token management
 * 
 * All routes except registration and login require authentication middleware.
 * 
 * @module authRoutes
 * @requires express - Express framework
 * @requires express-validator - Input validation middleware
 * @requires authController - Authentication business logic
 * @requires auth - Authentication middleware
 */

import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  logout,
  getCurrentUser,
  adminLogin
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

// Create Express router instance
const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user (doctor or patient)
 * 
 * Public endpoint - no authentication required
 * Validates required fields and creates user account with hashed password
 * Sets JWT token as httpOnly cookie upon successful registration
 * 
 * @route POST /api/auth/register
 * @access Public
 * @param {string} name - User's full name
 * @param {string} email - User's email (must be unique)
 * @param {string} password - User's password (min 6 characters)
 * @param {string} role - User role ('doctor' or 'patient')
 * @param {Object} additionalData - Role-specific fields (specialization for doctors, etc.)
 * @returns {Object} User data with JWT cookie set
 */
router.post('/register', [
  // Input validation middleware
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['doctor', 'patient']).withMessage('Role must be doctor or patient')
], register);

/**
 * POST /api/auth/login
 * Authenticate user login
 * 
 * Public endpoint - validates credentials and creates session
 * Searches appropriate collection based on role
 * Sets JWT token as httpOnly cookie upon successful authentication
 * 
 * @route POST /api/auth/login
 * @access Public
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {string} role - User role ('doctor' or 'patient')
 * @returns {Object} Authenticated user data with JWT cookie set
 */
router.post('/login', [
  // Input validation middleware
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('role').isIn(['doctor', 'patient']).withMessage('Role must be doctor or patient')
], login);

/**
 * POST /api/auth/logout
 * Log out current user
 * 
 * Protected endpoint - requires valid JWT token
 * Clears authentication cookie to end user session
 * 
 * @route POST /api/auth/logout
 * @access Private
 * @returns {Object} Success confirmation message
 */
router.post('/logout', protect, logout);

/**
 * POST /api/auth/admin/login
 * Authenticate admin login
 * 
 * Public endpoint - validates admin credentials
 * Only for admin users with admin or super_admin role
 * Sets JWT token as httpOnly cookie upon successful authentication
 * 
 * @route POST /api/auth/admin/login
 * @access Public
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @returns {Object} Authenticated admin data with JWT cookie set
 */
router.post('/admin/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], adminLogin);

/**
 * GET /api/auth/me
 * Get current authenticated user information
 * 
 * Protected endpoint - requires valid JWT token
 * Returns user profile data populated by auth middleware
 * 
 * @route GET /api/auth/me
 * @access Private
 * @returns {Object} Current user profile data
 */
router.get('/me', protect, getCurrentUser);

export default router;