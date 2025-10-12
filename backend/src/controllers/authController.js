/**
 * Authentication Controller
 * 
 * This module handles all authentication-related operations including:
 * - User registration (doctors and patients)
 * - User login and logout
 * - JWT token management
 * - Current user retrieval
 * 
 * @module authController
 * @requires Doctor - Doctor model for database operations
 * @requires Patient - Patient model for database operations
 * @requires generateToken - Utility function for JWT token generation
 */

import { Doctor } from '../models/Doctor.js'
import { Patient } from '../models/Patient.js'
import Admin from '../models/Admin.js';
import { generateToken } from '../lib/utils.js';


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
 * Register a new user (doctor or patient)
 * 
 * This function handles user registration with role-based validation.
 * It creates either a Doctor or Patient document based on the role.
 * 
 * @async
 * @function register
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing user registration data
 * @param {string} req.body.name - User's full name (required)
 * @param {string} req.body.email - User's email address (required, must be unique)
 * @param {string} req.body.password - User's password (required, will be hashed)
 * @param {string} req.body.role - User role: 'doctor' or 'patient' (required)
 * @param {string} [req.body.specialization] - Doctor's specialization (required for doctors)
 * @param {number} [req.body.experience] - Doctor's years of experience (required for doctors)
 * @param {string} [req.body.qualification] - Doctor's qualifications (required for doctors)
 * @param {Object} res - Express response object
 * 
 * @returns {Object} JSON response with user data and sets JWT cookie
 * @throws {400} If required fields are missing or user already exists
 * @throws {500} If database operation fails
 */
export const register = async (req, res) => {
  try {
    console.log("Register endpoint hit with data:", req.body);
    
    // Destructure user data from request body
    // additionalData contains role-specific fields (specialization, experience, etc.)
    const { name, email, password, role, ...additionalData } = req.body;
    
    // Validate required basic fields for all users
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'all fields are requried'
      });
    }

    // Role-specific validation: doctors need additional required fields
    if (role === 'doctor') {
      if (!additionalData.specialization || !additionalData.qualification || typeof additionalData.experience !== 'number') {
        return res.status(400).json({
          success: false,
          message: 'Missing some of the Additional filelds for Doctor '
        });
      }
    }

    // Check for existing users with same email across both collections
    // This ensures email uniqueness across the entire system
    const existingDoctor = await Doctor.findOne({ email });
    const existingPatient = await Patient.findOne({ email });

    if (existingDoctor || existingPatient) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Note: Data validation is expected to be handled on frontend

    // Dynamically select the appropriate model based on user role
    let user;
    const UserModel = role === 'doctor' ? Doctor : Patient;
    
    // Create new user instance with provided data
    // Password will be automatically hashed by the model's pre-save middleware
    user = new UserModel({
      name,
      email,
      password, // Will be hashed before saving
      ...additionalData // Spread role-specific fields
    });

    // Save user to database (triggers password hashing)
    console.log("About to save user:", {name, email, role});
    await user.save();
    console.log("User saved successfully");

    // Generate and set JWT token as httpOnly cookie
    generateToken(user._id, role, res);
    
    // Return success response with user data (password excluded by toObject())
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {...user.toObject(), role} // Include role in response
    });
  } catch (error) {
    console.error('register endpoint ERROR:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error in registration process',
      error: error.message
    });
  }
};

/**
 * Authenticate user login
 * 
 * This function validates user credentials and creates a JWT session.
 * It searches for the user in the appropriate collection based on role.
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
 * @returns {Object} JSON response with authenticated user data and JWT cookie
 * @throws {400} If credentials are invalid
 * @throws {500} If database operation fails
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
        message: 'Invalid creds'
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
    // This method handles bcrypt comparison with the hashed password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token and set as httpOnly cookie
    generateToken(user._id, role, res);
    
    // Return success response with user data (password excluded by toObject())
    res.json({
      success: true,
      message: 'Login successful',
      data: {...user.toObject(), role} // Include role in response
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error in login process',
      error: error.message
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