import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  verifyUser,
  toggleUserStatus,
  updateUserRole,
  getAdminLogs
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Apply admin protection to all routes
router.use(protect);
router.use(adminOnly);

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);

// User management routes
router.get('/users', getAllUsers);
router.put('/users/:id/verify', verifyUser);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.put('/users/:id/role', updateUserRole);

// Admin logs
router.get('/logs', getAdminLogs);

export default router;
