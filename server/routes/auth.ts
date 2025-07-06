import express, { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import {
  login,
  register,
  verifyOtp,
  resendOtp,
  forgotPassword,
  refreshAccessToken,
  logout,
  googleAuthCallback,
} from '../controller/authController';
import { checkUsernameAvailability } from '../middleware/flowCheckMiddleware';
import { authenticate } from '../middleware/authMiddleware';
import { handleValidationErrors } from '../middleware/errorMiddleware';
import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  verifyOtpValidation,
  usernameValidation,
} from '../utils/validation';

const router: Router = express.Router();

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { session: false, scope: ['profile', 'email'] })
);
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/login',
    failureMessage: true,
  }),
  googleAuthCallback
);

// Public routes
router.post('/login', loginValidation, handleValidationErrors, login);
router.post('/register', registerValidation, handleValidationErrors, register);
// Check username availability route
router.get('/check-username', usernameValidation, handleValidationErrors, checkUsernameAvailability);
router.get('/refresh-token', refreshAccessToken);
router.post('/forgot-password', forgotPasswordValidation, handleValidationErrors, forgotPassword);

router.use(authenticate);
// Protected routes
router.post('/logout', logout);
// OTP and verification routes
router.post('/verify-otp', verifyOtpValidation, handleValidationErrors, verifyOtp);
router.get('/resend-otp', resendOtp);

export default router;
