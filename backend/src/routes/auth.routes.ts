import { Router } from 'express';
import { register, login, getProfile, updateProfile, sendLoginOTP, verifyLoginOTP, resendOTP, upload, forgotPassword, verifyResetCode, resetPassword } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', upload.single('proofOfResidency'), register);
router.post('/login', login);
router.post('/send-otp', sendLoginOTP);
router.post('/resend-otp', resendOTP);
router.post('/verify-otp', verifyLoginOTP);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

export default router;
