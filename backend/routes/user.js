import express from 'express';
import { completeProfile, me, updateProfile, changePassword } from '../controller/userController.js';
import { checkCompleteProfile, checkEmailVerification, checkUsernameAvailability } from '../middleware/flowCheckMiddleware.js';
const router = express.Router();

router.get('/profile', me);

router.use(checkEmailVerification);
router.post('/complete-profile', checkUsernameAvailability, completeProfile);
router.use(checkCompleteProfile);
router.post('/update-profile', updateProfile);
router.post('/change-password', changePassword);


export default router;