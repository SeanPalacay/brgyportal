import { Router } from 'express';
import { getSKAnalytics, createSKCertificate, getSKCertificates, downloadSKCertificate, updateSKCertificate, deleteSKCertificate } from '../controllers/sk.controller';
import { 
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  updateEventStatus,
  deleteEvent
} from '../controllers/event.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// SK Analytics route
router.get('/analytics', authenticate, getSKAnalytics);

// ========== EVENT MANAGEMENT ROUTES ==========
router.post('/events', authenticate, createEvent);
router.get('/events', authenticate, getAllEvents);
router.get('/events/:id', authenticate, getEventById);
router.put('/events/:id', authenticate, updateEvent);
router.patch('/events/:id/status', authenticate, updateEventStatus);
router.delete('/events/:id', authenticate, deleteEvent);

// ========== CERTIFICATE ROUTES ==========
router.post('/certificates', authenticate, createSKCertificate);
router.get('/certificates', authenticate, getSKCertificates);
router.put('/certificates/:id', authenticate, updateSKCertificate);
router.delete('/certificates/:id', authenticate, deleteSKCertificate);
router.get('/certificates/:id/download', authenticate, downloadSKCertificate);

export default router;