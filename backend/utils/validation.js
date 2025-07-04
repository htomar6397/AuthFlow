import { body } from 'express-validator';

const email = body('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail();
const password = body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long');
const username = body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long').matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores');
const name = body('name').isLength({ min: 2 }).withMessage('Name must be at least 2 characters long');
const identifier = body('identifier').notEmpty().withMessage('Identifier is required');
const otp = body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits');
const newPassword = body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters long');

export const registerValidation = [email, password];
export const loginValidation = [identifier, password];
export const forgotPasswordValidation = [body('identifier').notEmpty().withMessage('Identifier is required')];
export const verifyOtpValidation = [otp];
export const completeProfileValidation = [username, name];
export const changePasswordValidation = [password, newPassword];
