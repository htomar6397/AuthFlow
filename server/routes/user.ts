import express, { Router } from 'express';
import {
  completeProfile,
  me,
  updateProfile,
  changePassword,
  deleteAccount,
} from '../controller/userController';
import {
  checkCompleteProfile,
  checkEmailVerification,
  checkUsernameAvailability,
} from '../middleware/flowCheckMiddleware';
import { handleValidationErrors } from '../middleware/errorMiddleware';
import { completeProfileValidation, changePasswordValidation } from '../utils/validation';

const router: Router = express.Router();

router.get('/profile', me);

router.use(checkEmailVerification);

// Complete profile route with username availability check
router.post(
  '/complete-profile',
  completeProfileValidation,
  handleValidationErrors,
  checkUsernameAvailability,
  completeProfile
);
router.use(checkCompleteProfile);
router.post('/update-profile', updateProfile);
router.post('/change-password', changePasswordValidation, handleValidationErrors, changePassword);

// Delete account route
router.delete('/delete-account', deleteAccount);

export default router;
