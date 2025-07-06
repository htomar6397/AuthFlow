import { body, ValidationChain } from 'express-validator';

const email: ValidationChain = body('email')
  .isEmail()
  .withMessage('Please enter a valid email address')
  .normalizeEmail();
const password: ValidationChain = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters long');
const username: ValidationChain = body('username')
  .isLength({ min: 3 })
  .withMessage('Username must be at least 3 characters long')
  .matches(/^[a-zA-Z0-9_]+$/)
  .withMessage('Username can only contain letters, numbers, and underscores');
const name: ValidationChain = body('name')
  .isLength({ min: 2 })
  .withMessage('Name must be at least 2 characters long');
const identifier: ValidationChain = body('identifier')
  .notEmpty()
  .withMessage('Identifier is required');
const otp: ValidationChain = body('otp')
  .isLength({ min: 6, max: 6 })
  .withMessage('OTP must be 6 digits');
const newPassword: ValidationChain = body('newPassword')
  .isLength({ min: 8 })
  .withMessage('New password must be at least 8 characters long');

export const registerValidation: ValidationChain[] = [email, password];
export const loginValidation: ValidationChain[] = [identifier, password];
export const forgotPasswordValidation: ValidationChain[] = [
  body('identifier').notEmpty().withMessage('Identifier is required'),
];
export const verifyOtpValidation: ValidationChain[] = [otp];
export const completeProfileValidation: ValidationChain[] = [username, name];
export const changePasswordValidation: ValidationChain[] = [password, newPassword];
