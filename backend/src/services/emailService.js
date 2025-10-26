/**
 * Email Service
 *
 * This service handles all email-related functionality:
 * - OTP emails for registration and login
 * - Password reset emails
 * - Welcome emails
 * - Appointment notifications (future)
 *
 * Uses Nodemailer with Gmail SMTP
 *
 * @module emailService
 */

import pkg from 'nodemailer';
import dotenv from 'dotenv';

const { createTransport } = pkg;

dotenv.config();

/**
 * Helper function to get display name for role
 */
const getRoleDisplay = (role) => {
  if (role === 'doctor') return 'Doctor';
  if (role === 'patient') return 'Patient';
  return 'Admin';
};

/**
 * Create reusable nodemailer transporter
 * Configuration from environment variables
 */
const createTransporter = () => {
  // Check if email service is configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('⚠️  Email service not configured. Set EMAIL_USER and EMAIL_PASSWORD in .env');
    return null;
  }

  try {
    const transporter = createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      // Additional security options
      secure: true, // Use TLS
      tls: {
        rejectUnauthorized: true,
      },
    });

    console.log('✅ Email service configured successfully');
    return transporter;
  } catch (error) {
    console.error('❌ Error configuring email service:', error.message);
    return null;
  }
};

const transporter = createTransporter();

/**
 * HTML template for OTP email
 * @param {String} name - User's name
 * @param {String} otp - 6-digit OTP
 * @param {String} purpose - Purpose of OTP (registration/login)
 * @returns {String} HTML email template
 */
const getOTPEmailTemplate = (name, otp, purpose) => {
  const actionText = purpose === 'registration' ? 'complete your registration' : 'log in to your account';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: #ffffff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #ffffff;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .content {
          padding: 40px 30px;
        }
        .otp-box {
          background: #f8f9fa;
          border: 2px dashed #667eea;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin: 30px 0;
        }
        .otp-code {
          font-size: 36px;
          font-weight: bold;
          color: #667eea;
          letter-spacing: 8px;
          margin: 10px 0;
        }
        .info-box {
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .warning-box {
          background: #f8d7da;
          border-left: 4px solid #dc3545;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .footer {
          background: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 14px;
          color: #6c757d;
        }
        .btn {
          display: inline-block;
          padding: 12px 30px;
          background: #667eea;
          color: #ffffff;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏥 HealthConnect</h1>
          <p>Your Online Doctor Appointment System</p>
        </div>
        
        <div class="content">
          <h2>Hello ${name}! 👋</h2>
          <p>We received a request to ${actionText}. Use the OTP code below to proceed:</p>
          
          <div class="otp-box">
            <p style="margin: 0; font-size: 14px; color: #666;">Your OTP Code</p>
            <div class="otp-code">${otp}</div>
            <p style="margin: 0; font-size: 12px; color: #999;">Valid for 10 minutes</p>
          </div>
          
          <div class="info-box">
            <strong>⏰ This OTP will expire in 10 minutes.</strong><br>
            You have 3 attempts to enter the correct OTP.
          </div>
          
          <div class="warning-box">
            <strong>🔒 Security Notice:</strong><br>
            • Never share this OTP with anyone<br>
            • HealthConnect will never ask for your OTP via phone or SMS<br>
            • If you didn't request this OTP, please ignore this email
          </div>
          
          <p>If you have any questions or need assistance, feel free to contact our support team.</p>
          
          <p>Best regards,<br>
          <strong>HealthConnect Team</strong></p>
        </div>
        
        <div class="footer">
          <p>© 2025 HealthConnect. All rights reserved.</p>
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Plain text version of OTP email (fallback)
 * @param {String} name - User's name
 * @param {String} otp - 6-digit OTP
 * @param {String} purpose - Purpose of OTP
 * @returns {String} Plain text email
 */
const getOTPEmailPlainText = (name, otp, purpose) => {
  const actionText = purpose === 'registration' ? 'complete your registration' : 'log in to your account';

  return `
Hello ${name}!

We received a request to ${actionText}. Use the OTP code below to proceed:

Your OTP Code: ${otp}

This OTP is valid for 10 minutes and you have 3 attempts to enter it correctly.

SECURITY NOTICE:
• Never share this OTP with anyone
• HealthConnect will never ask for your OTP via phone or SMS
• If you didn't request this OTP, please ignore this email

Best regards,
HealthConnect Team

© 2025 HealthConnect. All rights reserved.
This is an automated email. Please do not reply to this message.
  `;
};

/**
 * Send OTP email
 * @param {Object} options - Email options
 * @param {String} options.email - Recipient email
 * @param {String} options.name - Recipient name
 * @param {String} options.otp - 6-digit OTP
 * @param {String} options.purpose - Purpose (registration/login)
 * @returns {Promise<Object>} { success: Boolean, message: String, info: Object }
 */
export const sendOTPEmail = async ({
  email, name, otp, purpose = 'login',
}) => {
  // Check if transporter is configured
  if (!transporter) {
    console.error('❌ Email service not configured');
    return {
      success: false,
      message: 'Email service not configured. Please contact administrator.',
    };
  }

  const subject = purpose === 'registration'
    ? '🔐 Verify Your Email - HealthConnect Registration'
    : '🔐 Your Login OTP - HealthConnect';

  const mailOptions = {
    from: {
      name: 'HealthConnect',
      address: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    },
    to: email,
    subject,
    html: getOTPEmailTemplate(name, otp, purpose),
    text: getOTPEmailPlainText(name, otp, purpose),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}: ${info.messageId}`);

    return {
      success: true,
      message: 'OTP sent successfully',
      info,
    };
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);

    return {
      success: false,
      message: 'Failed to send OTP email. Please try again later.',
      error: error.message,
    };
  }
};

/**
 * Send welcome email after successful registration
 * @param {Object} options - Email options
 * @param {String} options.email - Recipient email
 * @param {String} options.name - Recipient name
 * @param {String} options.role - User role (doctor/patient)
 * @returns {Promise<Object>} { success: Boolean, message: String }
 */
export const sendWelcomeEmail = async ({ email, name, role }) => {
  if (!transporter) {
    return { success: false, message: 'Email service not configured' };
  }

  const roleText = role === 'doctor' ? 'Healthcare Provider' : 'Patient';

  const mailOptions = {
    from: {
      name: 'HealthConnect',
      address: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    },
    to: email,
    subject: '🎉 Welcome to HealthConnect!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 Welcome to HealthConnect!</h1>
          </div>
          <div class="content">
            <h2>Hello ${name}! 👋</h2>
            <p>Thank you for registering as a <strong>${roleText}</strong> with HealthConnect.</p>
            <p>Your email has been verified successfully and your account is now active!</p>
            <p>You can now access all features of our platform.</p>
            <p>Best regards,<br><strong>HealthConnect Team</strong></p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Welcome email sent' };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return { success: false, message: 'Failed to send welcome email' };
  }
};

/**
 * Send password reset email
 * @param {Object} options - Email options
 * @param {String} options.email - User's email
 * @param {String} options.name - User's name
 * @param {String} options.resetToken - Password reset token
 * @param {String} options.role - User role
 * @returns {Promise<Object>} { success: Boolean, message: String }
 */
export const sendPasswordResetEmail = async ({
  email, name, resetToken, role,
}) => {
  if (!transporter) {
    throw new Error('Email service not configured');
  }

  // Create reset URL
  const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .content {
          padding: 40px 30px;
        }
        .content p {
          font-size: 16px;
          margin: 15px 0;
          color: #555;
        }
        .reset-button {
          display: inline-block;
          padding: 15px 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white !important;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          margin: 25px 0;
          text-align: center;
          transition: transform 0.2s;
        }
        .reset-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        .reset-link {
          word-break: break-all;
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 6px;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          color: #666;
          margin: 20px 0;
        }
        .warning {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 25px 0;
          border-radius: 4px;
        }
        .warning-title {
          font-weight: 600;
          color: #856404;
          margin: 0 0 8px 0;
        }
        .warning p {
          margin: 5px 0;
          font-size: 14px;
          color: #856404;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 30px;
          text-align: center;
          color: #666;
          font-size: 14px;
        }
        .footer p {
          margin: 5px 0;
        }
        .expiry-notice {
          background-color: #e3f2fd;
          padding: 12px;
          border-radius: 6px;
          margin: 20px 0;
          text-align: center;
        }
        .expiry-notice strong {
          color: #1976d2;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔒 Password Reset Request</h1>
        </div>
        
        <div class="content">
          <p>Hi <strong>${name}</strong>,</p>
          
          <p>We received a request to reset your password for your <strong>${getRoleDisplay(role)}</strong> account.</p>
          
          <p>Click the button below to reset your password:</p>
          
          <div style="text-align: center;">
            <a href="${resetURL}" class="reset-button">Reset My Password</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <div class="reset-link">${resetURL}</div>
          
          <div class="expiry-notice">
            <strong>⏰ This link will expire in 1 hour</strong>
          </div>
          
          <div class="warning">
            <p class="warning-title">⚠️ Security Notice:</p>
            <p>• If you didn't request this password reset, please ignore this email</p>
            <p>• Your current password will remain unchanged</p>
            <p>• Never share this link with anyone</p>
            <p>• We'll never ask for your password via email</p>
          </div>
          
          <p>If you're having trouble clicking the button, you can copy and paste the link into your web browser.</p>
          
          <p>If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>
        </div>
        
        <div class="footer">
          <p><strong>Doctor Appointment System</strong></p>
          <p>This is an automated email, please do not reply.</p>
          <p>If you need help, contact our support team.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Doctor Appointment System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Request - Doctor Appointment System',
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Password reset email sent' };
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    throw new Error('Email service failed. Please try again later.');
  }
};

/**
 * Send password changed confirmation email
 * @param {Object} options - Email options
 * @param {String} options.email - User's email
 * @param {String} options.name - User's name
 * @returns {Promise<Object>} { success: Boolean, message: String }
 */
export const sendPasswordChangedEmail = async ({ email, name }) => {
  if (!transporter) {
    throw new Error('Email service not configured');
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .content {
          padding: 40px 30px;
        }
        .content p {
          font-size: 16px;
          margin: 15px 0;
          color: #555;
        }
        .success-box {
          background-color: #d4edda;
          border-left: 4px solid #28a745;
          padding: 20px;
          margin: 25px 0;
          border-radius: 4px;
          text-align: center;
        }
        .success-icon {
          font-size: 48px;
          margin-bottom: 10px;
        }
        .warning {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 25px 0;
          border-radius: 4px;
        }
        .warning-title {
          font-weight: 600;
          color: #856404;
          margin: 0 0 8px 0;
        }
        .warning p {
          margin: 5px 0;
          font-size: 14px;
          color: #856404;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 30px;
          text-align: center;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Password Changed Successfully</h1>
        </div>
        
        <div class="content">
          <p>Hi <strong>${name}</strong>,</p>
          
          <div class="success-box">
            <div class="success-icon">🔐</div>
            <p style="margin: 0; font-size: 18px; font-weight: 600; color: #28a745;">
              Your password has been changed successfully!
            </p>
          </div>
          
          <p>Your account password was changed on <strong>${new Date().toLocaleString()}</strong>.</p>
          
          <p>You can now log in with your new password.</p>
          
          <div class="warning">
            <p class="warning-title">⚠️ Didn't make this change?</p>
            <p>If you did NOT change your password, please contact our support team immediately.</p>
            <p>Your account security may be compromised.</p>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Doctor Appointment System</strong></p>
          <p>This is an automated email, please do not reply.</p>
          <p>If you need help, contact our support team.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Doctor Appointment System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Changed - Doctor Appointment System',
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Password changed confirmation email sent' };
  } catch (error) {
    console.error('❌ Error sending password changed email:', error);
    // Don't throw error - password was changed successfully, email is just notification
    return { success: false, message: 'Failed to send confirmation email' };
  }
};

/**
 * Verify email service configuration (for testing)
 * @returns {Promise<Object>} { configured: Boolean, message: String }
 */
export const verifyEmailService = async () => {
  if (!transporter) {
    return {
      configured: false,
      message: 'Email service not configured. Set EMAIL_USER and EMAIL_PASSWORD in .env',
    };
  }

  try {
    await transporter.verify();
    return {
      configured: true,
      message: 'Email service is configured and ready to send emails',
    };
  } catch (error) {
    return {
      configured: false,
      message: `Email service configuration error: ${error.message}`,
    };
  }
};

export default {
  sendOTPEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  verifyEmailService,
};
