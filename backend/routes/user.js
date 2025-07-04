import express from 'express';
import { completeProfile, me, updateProfile, changePassword } from '../controller/userController.js';
import { checkCompleteProfile, checkEmailVerification, checkUsernameAvailability } from '../middleware/flowCheckMiddleware.js';
import { handleValidationErrors } from '../middleware/errorMiddleware.js';
import { completeProfileValidation, changePasswordValidation } from '../utils/validation.js';
const router = express.Router();

router.get('/profile', me);

router.use(checkEmailVerification);
router.post('/complete-profile', completeProfileValidation, handleValidationErrors, checkUsernameAvailability, completeProfile);
router.use(checkCompleteProfile);
router.post('/update-profile', updateProfile);
router.post('/change-password', changePasswordValidation, handleValidationErrors, changePassword);


export default router;