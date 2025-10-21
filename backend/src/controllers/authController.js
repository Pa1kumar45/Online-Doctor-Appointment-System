/**
 * Authentication Controller
 * 
 * This module handles all authentication-related operations including:
 * - User registration with OTP verification
 * - User login with OTP verification
 * - OTP generation, verification, and resending
 * - JWT token management
 * - Current user retrieval
 * 
 * @module authController
 * @requires Doctor - Doctor model for database operations
 * @requires Patient - Patient model for database operations
 * @requires OTP - OTP model for verification
 * @requires emailService - Email service for sending OTPs
 * @requires generateToken - Utility function for JWT token generation
 */

import { Doctor } from '../models/Doctor.js'
import { Patient } from '../models/Patient.js'
import Admin from '../models/Admin.js';
import OTP from '../models/OTP.js';
import { sendOTPEmail, sendWelcomeEmail, sendPasswordResetEmail, sendPasswordChangedEmail } from '../services/emailService.js';
import { generateToken } from '../lib/utils.js';
import crypto from 'crypto';


/**
 * Formats user data for API response based on user role
 * 
 * @param {Object} user - User document from database (Doctor or Patient)
 * @param {string} role - User role ('doctor' or 'patient')
 * @returns {Object} Formatted user object with role-specific fields
 * 
 * For doctors, includes: specialization, experience, qualification, about, contactNumber, schedule
 * For patients, includes: dateOfBirth, gender, contactNumber, emergencyContact, bloodGroup, allergies
 */
const formatUserResponse = (user, role) => ({
  name: user.name,
  email: user.email,
  role,
  avatar: user.avatar || '',
  isEmailVerified: user.isEmailVerified || false,
  // Conditional spread: include doctor-specific fields if role is 'doctor'
  ...(role === 'doctor' ? {
    specialization: user.specialization,
    experience: user.experience,
    qualification: user.qualification,
    about: user.about || '',
    contactNumber: user.contactNumber || '',
    schedule: user.schedule || []  // Doctor's availability schedule
  } : {
    // Patient-specific fields
    dateOfBirth: user.dateOfBirth || '',
    gender: user.gender || '',
    contactNumber: user.contactNumber || '',
    emergencyContact: user.emergencyContact || [],
    bloodGroup: user.bloodGroup || '',
    allergies: user.allergies || ''
    // profileCompleted: user.profileCompleted || false  
  })
});


/**
 * Register a new user (doctor or patient) - Step 1
 * 
 * This function handles user registration with email verification via OTP.
 * User account is created but marked as unverified until OTP is confirmed.
 * 
 * Flow:
 * 1. Validate input data
 * 2. Check if user already exists
 * 3. Create user account (isEmailVerified = false)
 * 4. Generate 6-digit OTP
 * 5. Send OTP to user's email
 * 6. Return success message (user must verify OTP to login)
 * 
 * @async
 * @function register
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing user registration data
 * @param {string} req.body.name - User's full name (required)
 * @param {string} req.body.email - User's email address (required, must be unique)
 * @param {string} req.body.password - User's password (required, will be hashed)
 * @param {string} req.body.role - User role: 'doctor' or 'patient' (required)
 * @param {Object} res - Express response object
 * 
 * @returns {Object} JSON response with message to verify OTP
 * @throws {400} If required fields are missing or user already exists
 * @throws {500} If database operation fails
 */
export const register = async (req, res) => {
  try {
    console.log("Register endpoint hit with data:", req.body);
    
    const { name, email, password, role, ...additionalData } = req.body;
    
    // Validation is already done by middleware
    // No need for manual validation here
    
    // Check for existing users with same email across both collections
    const existingDoctor = await Doctor.findOne({ email });
    const existingPatient = await Patient.findOne({ email });

    if (existingDoctor || existingPatient) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Select appropriate model based on role
    const UserModel = role === 'doctor' ? Doctor : Patient;
    
    // Create new user instance (email not verified yet)
    const user = new UserModel({
      name,
      email,
      password, // Will be hashed by pre-save middleware
      isEmailVerified: false, // User needs to verify email
      ...additionalData // Role-specific fields
    });

    // Save user to database
    console.log("Saving user to database:", { name, email, role });
    await user.save();
    console.log("✅ User saved successfully");

    // Generate and send OTP
    const { otp } = await OTP.createOTP(email, role, 'registration');
    console.log(`📧 OTP generated for ${email}: ${otp}`);

    // Send OTP email
    const emailResult = await sendOTPEmail({
      email,
      name,
      otp,
      purpose: 'registration'
    });

    if (!emailResult.success) {
      // If email fails, still return success but inform user
      console.warn('⚠️  Email service failed, but user registered');
      return res.status(201).json({
        success: true,
        message: 'Registration successful. Email service temporarily unavailable. Please contact support for OTP.',
        data: {
          email,
          role,
          requiresVerification: true,
          otp: process.env.NODE_ENV === 'development' ? otp : undefined // Only show OTP in development
        }
      });
    }

    console.log(`✅ OTP email sent to ${email}`);

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for the OTP to verify your account.',
      data: {
        email,
        role,
        requiresVerification: true,
        // In development, include OTP in response for testing
        ...(process.env.NODE_ENV === 'development' && { otp })
      }
    });

  } catch (error) {
    console.error('❌ Register endpoint ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Error in registration process',
      error: error.message
    });
  }
};

/**
 * Authenticate user login - Step 1: Validate credentials and send OTP
 * 
 * This function validates user credentials and sends an OTP for verification.
 * Direct login is no longer allowed - OTP verification is mandatory.
 * 
 * @async
 * @function login
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing login credentials
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password (plain text)
 * @param {string} req.body.role - User role ('doctor' or 'patient')
 * @param {Object} res - Express response object
 * 
 * @returns {Object} JSON response with OTP sent confirmation
 * @throws {400} If credentials are invalid or email not verified
 * @throws {403} If account is suspended
 * @throws {429} If OTP rate limit exceeded
 * @throws {500} If database operation or email sending fails
 */
export const login = async (req, res) => {
  try {
    console.log("login hit");

    const { email, password, role } = req.body;

    // Find user in the appropriate collection based on role
    const UserModel = role === 'doctor' ? Doctor : Patient;
    const user = await UserModel.findOne({ email });
    
    // Return generic error if user not found (security: don't reveal if email exists)
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if email is verified (required for login)
    if (!user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email not verified. Please verify your email first.',
        requiresVerification: true
      });
    }

    // Check if account is suspended/inactive
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account suspended',
        suspended: true,
        suspensionReason: user.suspensionReason || 'Your account has been suspended by an administrator. Please contact support for more information.',
        suspendedAt: user.suspendedAt
      });
    }

    // Verify password using the model's comparePassword method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check OTP rate limiting
    const rateLimitCheck = await OTP.checkRateLimit(email, 'login');
    if (!rateLimitCheck.allowed) {
      return res.status(429).json({
        success: false,
        message: `Please wait ${rateLimitCheck.waitTime} seconds before requesting a new OTP`,
        waitTime: rateLimitCheck.waitTime
      });
    }

    // Generate and send OTP
    const otpDoc = await OTP.createOTP(email, role, 'login');
    
    // Send OTP via email
    await sendOTPEmail({
      email: user.email,
      name: user.name || user.firstName || 'User',
      otp: otpDoc.otp,
      purpose: 'login'
    });

    // Prepare response
    const response = {
      success: true,
      message: 'OTP sent to your email. Please verify to complete login.',
      email: user.email,
      requiresOTP: true
    };

    // In development mode, include OTP in response for testing
    if (process.env.NODE_ENV === 'development') {
      response.otp = otpDoc.otp;
      response.devNote = 'OTP included for development testing only';
    }

    res.status(200).json(response);

  } catch (error) {
    console.error('Login error:', error);
    
    // Handle specific error cases
    if (error.message.includes('Email service')) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error in login process',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Verify OTP and complete authentication
 * 
 * This function verifies the OTP code and completes the authentication process.
 * For registration OTPs, it marks the email as verified and sends a welcome email.
 * For login OTPs, it generates a JWT token to create the session.
 * 
 * @async
 * @function verifyOTP
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.otp - 6-digit OTP code
 * @param {string} req.body.role - User role ('doctor' or 'patient')
 * @param {string} req.body.purpose - OTP purpose ('registration' or 'login')
 * @param {Object} res - Express response object
 * 
 * @returns {Object} JSON response with authentication token (login) or confirmation (registration)
 * @throws {400} If OTP is invalid, expired, or verification fails
 * @throws {404} If user not found
 * @throws {500} If database operation fails
 */
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp, role, purpose } = req.body;

    // Verify the OTP
    const verification = await OTP.verifyOTP(email, otp, purpose);

    if (!verification.success) {
      return res.status(400).json({
        success: false,
        message: verification.message,
        attemptsRemaining: verification.attemptsRemaining
      });
    }

    // Find the user
    const UserModel = role === 'doctor' ? Doctor : Patient;
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Handle registration OTP verification
    if (purpose === 'registration') {
      // Mark email as verified
      user.isEmailVerified = true;
      user.emailVerifiedAt = new Date();
      await user.save();

      // Send welcome email
      try {
        await sendWelcomeEmail({
          email: user.email,
          name: user.name || user.firstName || 'User',
          role: role
        });
      } catch (emailError) {
        console.error('Welcome email error:', emailError);
        // Don't fail the registration if welcome email fails
      }

      return res.status(200).json({
        success: true,
        message: 'Email verified successfully! You can now login.',
        data: formatUserResponse(user, role)
      });
    }

    // Handle login OTP verification
    if (purpose === 'login') {
      // Generate JWT token and set as httpOnly cookie
      generateToken(user._id, role, res);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: formatUserResponse(user, role)
      });
    }

    // Invalid purpose
    return res.status(400).json({
      success: false,
      message: 'Invalid OTP purpose'
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Resend OTP
 * 
 * This function generates and sends a new OTP to the user's email.
 * It respects rate limiting to prevent abuse.
 * 
 * @async
 * @function resendOTP
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.role - User role ('doctor' or 'patient')
 * @param {string} req.body.purpose - OTP purpose ('registration' or 'login')
 * @param {Object} res - Express response object
 * 
 * @returns {Object} JSON response with OTP sent confirmation
 * @throws {404} If user not found
 * @throws {429} If rate limit exceeded
 * @throws {500} If OTP generation or email sending fails
 */
export const resendOTP = async (req, res) => {
  try {
    const { email, role, purpose } = req.body;

    // Find the user to verify they exist
    const UserModel = role === 'doctor' ? Doctor : Patient;
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check rate limiting
    const rateLimitCheck = await OTP.checkRateLimit(email, purpose);
    if (!rateLimitCheck.allowed) {
      return res.status(429).json({
        success: false,
        message: `Please wait ${rateLimitCheck.waitTime} seconds before requesting a new OTP`,
        waitTime: rateLimitCheck.waitTime
      });
    }

    // Generate new OTP
    const otpDoc = await OTP.createOTP(email, role, purpose);

    // Send OTP via email
    await sendOTPEmail({
      email: user.email,
      name: user.name || user.firstName || 'User',
      otp: otpDoc.otp,
      purpose: purpose
    });

    // Prepare response
    const response = {
      success: true,
      message: 'New OTP sent to your email',
      email: user.email
    };

    // In development mode, include OTP in response
    if (process.env.NODE_ENV === 'development') {
      response.otp = otpDoc.otp;
      response.devNote = 'OTP included for development testing only';
    }

    res.status(200).json(response);

  } catch (error) {
    console.error('Resend OTP error:', error);
    
    if (error.message.includes('Email service')) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error resending OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get current authenticated user information
 * 
 * This function retrieves the current user's data from the request object.
 * The user object is populated by the authentication middleware.
 * 
 * @async
 * @function getCurrentUser
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object (set by auth middleware)
 * @param {string} req.userRole - User role (set by auth middleware)
 * @param {Object} res - Express response object
 * 
 * @returns {Object} JSON response with current user data
 * @throws {404} If user not found in request object
 * @throws {500} If operation fails
 */
export const getCurrentUser = async (req, res) => {
  try {
    // User object is populated by the protect middleware
    let user = req.user;

    if (!user) {
      console.log("error")
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return user data with role information
    res.json({
      success: true,
      data: {...user.toObject(), role: req.userRole} // Include role from JWT
    });
  } catch (error) {
    console.log('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message
    });
  }
};


/**
 * Log out current user
 * 
 * This function clears the JWT authentication cookie to log out the user.
 * It sets the cookie value to empty and expires it immediately.
 * 
 * @async
 * @function logout
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * 
 * @returns {Object} JSON response confirming successful logout
 * @throws {500} If cookie clearing operation fails
 */
export const logout = async (req, res) => {
  try {
    // Clear the JWT token cookie by setting it to empty with maxAge 0
    // This immediately expires the cookie on the client side
    res.cookie("token", "", {maxAge: 0});

    res.status(200).json({success: true, message: 'logged out succesfully'})
    
  } catch (err) {
    console.log("error in logout", err);
  }
}

/**
 * Admin Login
 * 
 * Authenticates admin users and generates JWT token
 * 
 * @async
 * @function adminLogin
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - Admin email
 * @param {string} req.body.password - Admin password
 * @param {Object} res - Express response object
 * 
 * @returns {Object} JSON response with admin data and JWT token
 * @throws {400} If required fields missing
 * @throws {401} If invalid credentials
 * @throws {403} If account suspended
 * @throws {500} If database error
 */
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find admin by email (include password for verification)
    const admin = await Admin.findOne({ email }).select('+password');
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if admin account is active
    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is suspended. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login timestamp
    admin.lastlogin = new Date();
    await admin.save();

    // Generate JWT token with admin role and set cookie
    const token = generateToken(admin._id, admin.role, res);

    // Prepare admin data for response (exclude password)
    const adminData = {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      permissions: admin.Permissions || [],
      avatar: admin.avatar || '',
      lastLogin: admin.lastlogin
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: adminData,
      data: adminData
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in'
    });
  }
};

/**
 * Request password reset - Step 1: Generate and send reset token
 * 
 * This function handles forgot password requests by generating a secure reset token
 * and sending it to the user's email address.
 * 
 * @async
 * @function forgotPassword
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.role - User role ('doctor', 'patient', or 'admin')
 * @param {Object} res - Express response object
 * 
 * @returns {Object} JSON response confirming email was sent
 * @throws {400} If email not found
 * @throws {500} If token generation or email sending fails
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email, role } = req.body;

    // Find user based on role
    let user;
    const UserModel = role === 'doctor' ? Doctor : role === 'patient' ? Patient : Admin;
    user = await UserModel.findOne({ email });

    if (!user) {
      // Return generic message for security (don't reveal if email exists)
      return res.status(400).json({
        success: false,
        message: 'If an account exists with this email, a password reset link has been sent.'
      });
    }

    // Generate reset token (32 bytes random string)
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token before storing in database (for security)
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Save hashed token and expiration to user document
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour from now
    await user.save({ validateBeforeSave: false });

    // Send reset email with plain token (not hashed)
    try {
      await sendPasswordResetEmail({
        email: user.email,
        name: user.name || user.firstName || 'User',
        resetToken: resetToken, // Send plain token in email
        role: role
      });

      res.status(200).json({
        success: true,
        message: 'Password reset link sent to your email. Please check your inbox.',
        email: user.email
      });
    } catch (emailError) {
      // If email fails, remove token from database
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      throw new Error('Failed to send reset email. Please try again later.');
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error processing password reset request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Reset password - Step 2: Verify token and update password
 * 
 * This function validates the reset token and updates the user's password.
 * 
 * @async
 * @function resetPassword
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.token - Password reset token from URL
 * @param {Object} req.body - Request body
 * @param {string} req.body.password - New password
 * @param {string} req.body.role - User role ('doctor', 'patient', or 'admin')
 * @param {Object} res - Express response object
 * 
 * @returns {Object} JSON response confirming password was reset
 * @throws {400} If token is invalid or expired
 * @throws {500} If password update fails
 */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, role } = req.body;

    // Hash the token from URL to match stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with matching token and check expiration
    const UserModel = role === 'doctor' ? Doctor : role === 'patient' ? Patient : Admin;
    const user = await UserModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() } // Token not expired
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token. Please request a new password reset.'
      });
    }

    // Update password (will be hashed by pre-save middleware)
    user.password = password;
    user.passwordResetToken = undefined; // Clear reset token
    user.passwordResetExpires = undefined; // Clear expiration
    user.passwordChangedAt = Date.now(); // Record password change time
    await user.save();

    // Send confirmation email
    try {
      await sendPasswordChangedEmail({
        email: user.email,
        name: user.name || user.firstName || 'User'
      });
    } catch (emailError) {
      console.error('Password changed email error:', emailError);
      // Don't fail the reset if email fails
    }

    res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now login with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Change password (authenticated user)
 * 
 * This function allows authenticated users to change their password.
 * Requires current password verification.
 * 
 * @async
 * @function changePassword
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user (from protect middleware)
 * @param {string} req.userRole - User role (from protect middleware)
 * @param {Object} req.body - Request body
 * @param {string} req.body.currentPassword - Current password for verification
 * @param {string} req.body.newPassword - New password
 * @param {Object} res - Express response object
 * 
 * @returns {Object} JSON response confirming password was changed
 * @throws {400} If current password is incorrect
 * @throws {401} If user not authenticated
 * @throws {500} If password update fails
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;
    const role = req.userRole;

    // Find user with password field included
    const UserModel = role === 'doctor' ? Doctor : role === 'patient' ? Patient : Admin;
    const user = await UserModel.findById(userId).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordCorrect = await user.comparePassword(currentPassword);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Check if new password is same as current
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    user.passwordChangedAt = Date.now();
    await user.save();

    // Send confirmation email
    try {
      await sendPasswordChangedEmail({
        email: user.email,
        name: user.name || user.firstName || 'User'
      });
    } catch (emailError) {
      console.error('Password changed email error:', emailError);
      // Don't fail if email fails
    }

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};;