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
import { handleValidationErrors } from '../middleware/errorMiddleware.js';
import { 
    registerValidation, 
    loginValidation, 
    forgotPasswordValidation, 
    verifyOtpValidation 
} from '../utils/validation.js';

const router = express.Router();

// Public routes
router.post('/login', loginValidation, handleValidationErrors, login);
router.post('/register', registerValidation, handleValidationErrors, register);
router.get('/check-username', checkUsernameAvailability);
router.get('/refresh-token', refreshAccessToken);
router.post('/forgot-password', forgotPasswordValidation, handleValidationErrors, forgotPassword);

router.use(authenticate);
// Protected routes
router.post('/logout', logout);
// OTP and verification routes
router.post('/verify-otp', verifyOtpValidation, handleValidationErrors, verifyOtp);
router.get('/resend-otp', resendOtp);

export default router;
