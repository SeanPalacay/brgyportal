import { Router } from 'express';
import {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  getMyAppointments,
  getImmunizationRecords,
  createImmunizationRecord,
  getMyImmunizationRecords,
  getHealthRecords,
  createHealthRecord,
  getMyHealthRecords,
  getCertificates,
  createCertificate,
  downloadCertificate,
  updateCertificate,
  deleteCertificate,
  getVaccinations,
  createVaccination,
  getUpcomingVaccinations,
  getImmunizationSchedule,
  getPatientImmunizationStatus
} from '../controllers/health.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// ========== PATIENT MANAGEMENT ==========
router.get('/patients', authenticate, getAllPatients);
router.get('/patients/:id', authenticate, getPatientById);
router.post('/patients', authenticate, createPatient);
router.put('/patients/:id', authenticate, updatePatient);
router.delete('/patients/:id', authenticate, deletePatient);

// ========== APPOINTMENT MANAGEMENT ==========
router.get('/appointments', authenticate, getAppointments);
router.get('/appointments/:id', authenticate, getAppointmentById);
router.post('/appointments', authenticate, createAppointment);
router.put('/appointments/:id', authenticate, updateAppointment);
router.patch('/appointments/:id/status', authenticate, updateAppointmentStatus);
router.delete('/appointments/:id', authenticate, deleteAppointment);
router.get('/my-appointments', authenticate, getMyAppointments);

// ========== IMMUNIZATION RECORDS ==========
router.get('/immunization-records', authenticate, getImmunizationRecords);
router.get('/immunization-records/my', authenticate, getMyImmunizationRecords);
router.post('/immunization-records', authenticate, createImmunizationRecord);
router.get('/my-immunization-records', authenticate, getMyImmunizationRecords);
router.get('/immunization-schedule', authenticate, getImmunizationSchedule);
router.get('/patients/:patientId/immunization-status', authenticate, getPatientImmunizationStatus);

// ========== HEALTH RECORDS (Legacy) ==========
router.get('/health-records', authenticate, getHealthRecords);
router.post('/health-records', authenticate, createHealthRecord);
router.get('/my-health-records', authenticate, getMyHealthRecords);

// ========== VACCINATIONS (Legacy) ==========
router.get('/vaccinations', authenticate, getVaccinations);
router.post('/vaccinations', authenticate, createVaccination);
router.get('/upcoming-vaccinations', authenticate, getUpcomingVaccinations);

// ========== CERTIFICATES ==========
router.get('/certificates', authenticate, getCertificates);
router.post('/certificates', authenticate, createCertificate);
router.put('/certificates/:id', authenticate, updateCertificate);
router.delete('/certificates/:id', authenticate, deleteCertificate);
router.get('/certificates/:id/download', authenticate, downloadCertificate);

export default router;