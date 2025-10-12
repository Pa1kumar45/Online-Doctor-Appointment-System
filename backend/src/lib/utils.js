/**
 * Utility Functions
 * 
 * This module provides common utility functions used across the application.
 * Currently contains JWT token generation and management utilities for
 * user authentication and session handling.
 * 
 * @module utils
 * @requires jsonwebtoken - JWT token creation and verification
 */

import jwt from 'jsonwebtoken';

/**
 * Generate JWT authentication token and set secure cookie
 * 
 * This function creates a JSON Web Token for user authentication and
 * automatically sets it as a secure httpOnly cookie in the response.
 * The token includes user ID and role for authorization purposes.
 * 
 * @function generateToken
 * @param {string} userId - Unique identifier of the user
 * @param {string} role - User role ('doctor' or 'patient')
 * @param {Object} res - Express response object for setting cookie
 * @returns {string} Generated JWT token string
 * @throws {Error} If token generation fails
 * 
 * @example
 * // Generate token for a patient
 * const token = generateToken(patient._id, 'patient', res);
 * 
 * @example
 * // Generate token for a doctor
 * const token = generateToken(doctor._id, 'doctor', res);
 * 
 * @security
 * - Token expires in 7 days for security
 * - httpOnly cookie prevents XSS attacks
 * - sameSite 'strict' prevents CSRF attacks
 * - secure flag ensures HTTPS-only transmission
 */
export const generateToken = (userId, role, res) => {
    try {
      // Create JWT token with user ID and role
      const token = jwt.sign(
        { id: userId, role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' } // Token valid for 7 days
      );
  
      // Set secure httpOnly cookie with token
      res.cookie('token', token, {
         maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
         httpOnly: true,                   // Prevent XSS attacks
         sameSite: 'strict',               // CSRF protection
         // secure: false,                 // Development setting
         secure: true                      // Production: HTTPS only
      });
  
      return token;
    } catch (error) {
      throw new Error('Failed to generate authentication token');
    }
  };