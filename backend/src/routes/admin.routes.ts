// ========== AUDIT LOGS ==========

import { Router } from 'express';
import {
  getAdminStats,
  getAllUsers,
  createUser,
  updateUser,
  updateUserStatus,
  updateUserRole,
  updateUserRoles,
  getUserById,
  deleteUser,
  getSystemSettings,
  updateSystemSettings,
  getAuditLogs,
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  publishAnnouncement,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getPermissions,
  createBackup,
  getBackups,
  downloadBackup,
  getBroadcastMessages,
  createBroadcastMessage,
  // CMS Content Management
  getFeatures,
  createFeature,
  updateFeature,
  deleteFeature,
  toggleFeatureActive,
  getBenefits,
  createBenefit,
  updateBenefit,
  deleteBenefit,
  toggleBenefitActive,
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonialActive,
  getServiceFeatures,
  createServiceFeature,
  updateServiceFeature,
  deleteServiceFeature,
  toggleServiceFeatureActive
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// ========== ADMIN STATS ==========
router.get('/stats', authenticate, getAdminStats);

// ========== USER MANAGEMENT ==========
router.post('/users', authenticate, createUser);
router.get('/users', authenticate, getAllUsers);
router.get('/users/:userId', authenticate, getUserById);
router.patch('/users/:userId/status', authenticate, updateUserStatus);
router.put('/users/:userId/role', authenticate, updateUserRole);
router.put('/users/:userId/roles', authenticate, updateUserRoles);
router.put('/users/:userId', authenticate, updateUser);
router.delete('/users/:userId', authenticate, deleteUser);

// ========== SYSTEM SETTINGS ==========
router.get('/settings', authenticate, getSystemSettings);
router.put('/settings', authenticate, updateSystemSettings);

// ========== ANNOUNCEMENTS ==========
router.get('/announcements', authenticate, getAnnouncements);
router.post('/announcements', authenticate, createAnnouncement);
router.put('/announcements/:id', authenticate, updateAnnouncement);
router.patch('/announcements/:id/publish', authenticate, publishAnnouncement);
router.delete('/announcements/:id', authenticate, deleteAnnouncement);

// ========== ROLE MANAGEMENT ==========
router.get('/roles', authenticate, getRoles);
router.post('/roles', authenticate, createRole);
router.put('/roles/:roleId', authenticate, updateRole);
router.delete('/roles/:roleId', authenticate, deleteRole);
router.get('/permissions', authenticate, getPermissions);

// ========== BACKUP MANAGEMENT ==========
router.post('/backup', authenticate, createBackup);
router.get('/backups', authenticate, getBackups);
router.get('/backups/:id/download', authenticate, downloadBackup);

// ========== BROADCAST MESSAGES ==========
router.get('/broadcast-messages', authenticate, getBroadcastMessages);
router.post('/broadcast-messages', authenticate, createBroadcastMessage);

// ========== AUDIT LOGS ==========
router.get('/audit-logs', authenticate, getAuditLogs);

// ========== PUBLIC CONTENT MANAGEMENT (CMS) ==========

// Features Management
router.get('/features', authenticate, getFeatures);
router.post('/features', authenticate, createFeature);
router.put('/features/:id', authenticate, updateFeature);
router.delete('/features/:id', authenticate, deleteFeature);
router.patch('/features/:id/toggle-active', authenticate, toggleFeatureActive);

// Benefits Management
router.get('/benefits', authenticate, getBenefits);
router.post('/benefits', authenticate, createBenefit);
router.put('/benefits/:id', authenticate, updateBenefit);
router.delete('/benefits/:id', authenticate, deleteBenefit);
router.patch('/benefits/:id/toggle-active', authenticate, toggleBenefitActive);

// Testimonials Management
router.get('/testimonials', authenticate, getTestimonials);
router.post('/testimonials', authenticate, createTestimonial);
router.put('/testimonials/:id', authenticate, updateTestimonial);
router.delete('/testimonials/:id', authenticate, deleteTestimonial);
router.patch('/testimonials/:id/toggle-active', authenticate, toggleTestimonialActive);

// Service Features Management
router.get('/service-features', authenticate, getServiceFeatures);
router.post('/service-features', authenticate, createServiceFeature);
router.put('/service-features/:id', authenticate, updateServiceFeature);
router.delete('/service-features/:id', authenticate, deleteServiceFeature);
router.patch('/service-features/:id/toggle-active', authenticate, toggleServiceFeatureActive);

export default router;