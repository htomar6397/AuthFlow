import express from 'express';
import { 
    login, 
    register, 
    verifyOtp,
    resendOtp, 
    forgotPassword,
    refreshAccessToken,
    logout,
} from '../controller/authController.js';
import { checkUsernameAvailability } from '../middleware/flowCheckMiddleware.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/register', register);
router.get('/check-username', checkUsernameAvailability);
router.get('/refresh-token', refreshAccessToken);
router.post('/forgot-password', forgotPassword);

router.use(authenticate);
// Protected routes
router.post('/logout', logout);
// OTP and verification routes
router.post('/verify-otp', verifyOtp);
router.get('/resend-otp', resendOtp);

export default router;
