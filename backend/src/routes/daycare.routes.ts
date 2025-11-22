import { Router } from 'express';
// @ts-ignore
import multer from 'multer';
import path from 'path';
import {
  // Registration Management
  createDaycareRegistration,
  getDaycareRegistrations,
  getMyRegistrations,
  approveRegistration,
  rejectRegistration,
  // Student Management
  getDaycareStudents,
  getStudentById,
  createStudent,
  updateStudent,
  // Attendance Management
  recordAttendance,
  getAttendance,
  updateAttendance,
  // Progress Reports
  createProgressReport,
  getProgressReports,
  getMyChildrenProgressReports,
  // Learning Materials
  createLearningMaterial,
  getLearningMaterials,
  updateLearningMaterial,
  deleteLearningMaterial,
  downloadLearningMaterial,
  // Registration Updates
  updateDaycareRegistration,
  deleteDaycareRegistration,
  // Certificate Management
  createDaycareCertificate,
  getDaycareCertificates,
  downloadDaycareCertificate,
  updateDaycareCertificate,
  deleteDaycareCertificate
} from '../controllers/daycare.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Configure multer for learning materials (memory storage for Supabase)
// @ts-ignore
const learningMaterialUpload = multer({
  storage: multer.memoryStorage(), // Use memory storage for Supabase
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  // @ts-ignore
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'video/mpeg'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported'));
    }
  }
});

// ========== REGISTRATION ROUTES ==========
router.post('/registrations', authenticate, createDaycareRegistration);
router.get('/registrations', authenticate, getDaycareRegistrations);
router.get('/registrations/my', authenticate, getMyRegistrations);
router.patch('/registrations/:id/approve', authenticate, approveRegistration);
router.patch('/registrations/:id/reject', authenticate, rejectRegistration);
router.patch('/registrations/:id', authenticate, updateDaycareRegistration);
router.delete('/registrations/:id', authenticate, deleteDaycareRegistration);

// ========== STUDENT ROUTES ==========
router.get('/students', authenticate, getDaycareStudents);
router.post('/students', authenticate, createStudent);
router.get('/students/:id', authenticate, getStudentById);
router.patch('/students/:id', authenticate, updateStudent);

// ========== ATTENDANCE ROUTES ==========
router.post('/attendance', authenticate, recordAttendance);
router.get('/attendance', authenticate, getAttendance);
router.patch('/attendance/:id', authenticate, updateAttendance);

// ========== PROGRESS REPORT ROUTES ==========
router.post('/progress-reports', authenticate, createProgressReport);
router.get('/progress-reports', authenticate, getProgressReports);
router.get('/progress-reports/my', authenticate, getMyChildrenProgressReports);

// ========== LEARNING MATERIAL ROUTES ==========
router.post('/learning-materials', learningMaterialUpload.single('file'), authenticate, createLearningMaterial);
router.get('/learning-materials', authenticate, getLearningMaterials);
router.get('/learning-materials/:id/download', authenticate, downloadLearningMaterial);
router.patch('/learning-materials/:id', authenticate, updateLearningMaterial);
router.delete('/learning-materials/:id', authenticate, deleteLearningMaterial);

// ========== CERTIFICATE ROUTES ==========
router.post('/certificates', authenticate, createDaycareCertificate);
router.get('/certificates', authenticate, getDaycareCertificates);
router.put('/certificates/:id', authenticate, updateDaycareCertificate);
router.delete('/certificates/:id', authenticate, deleteDaycareCertificate);
router.get('/certificates/:id/download', authenticate, downloadDaycareCertificate);

export default router;
