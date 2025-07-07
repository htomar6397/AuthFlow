import { body, query, ValidationChain } from 'express-validator';

const email: ValidationChain = body('email')
.isEmail()
.withMessage('Please enter a valid email address')
  .isLength({ min: 5 ,max:30})
  .withMessage('Email must be at least 5 characters long and at most 100 characters long')
  .normalizeEmail();
const password: ValidationChain = body('password')
  .isLength({ min: 8 ,max:20})
  .withMessage('Password must be at least 8 characters long and at most 20 characters long');
  const usernameBody = body('username')
  .isLength({ min: 3, max: 20 })
  .withMessage('Username must be at least 3 characters long and at most 20 characters long')
  .matches(/^[a-zA-Z0-9_]+$/)
  .withMessage('Username can only contain letters, numbers, and underscores');

const usernameQuery = query('username')
  .isLength({ min: 3, max: 20 })
  .withMessage('Username must be at least 3 characters long and at most 20 characters long')
  .matches(/^[a-zA-Z0-9_]+$/)
  .withMessage('Username can only contain letters, numbers, and underscores');
const name: ValidationChain = body('name')
  .isLength({ min: 2 ,max:20})
  .withMessage('Name must be at least 2 characters long and at most 20 characters long');

const identifier: ValidationChain = body('identifier')
  .isLength({ min: 3 ,max:30})
  .withMessage('Identifier must be at least 3 characters long and at most 100 characters long')

const otp: ValidationChain = body('otp')
  .isLength({ min: 6, max: 6 })
  .withMessage('OTP must be 6 digits');
const newPassword: ValidationChain = body('newPassword')
  .isLength({ min: 8 ,max:20})
  .withMessage('New password must be at least 8 characters long and at most 20 characters long');
const bio: ValidationChain = body('bio')
  .isLength({ min: 2 ,max:100})
  .withMessage('Bio must be at least 2 characters long and at most 100 characters long')
 
export const registerValidation: ValidationChain[] = [email, password];
export const loginValidation: ValidationChain[] = [identifier, password];
export const forgotPasswordValidation: ValidationChain[] = [identifier];
export const verifyOtpValidation: ValidationChain[] = [otp];
export const completeProfileValidation: ValidationChain[] = [usernameBody, name,bio.optional()];
export const changePasswordValidation: ValidationChain[] = [password, newPassword];
export const usernameValidation: ValidationChain[] = [usernameQuery];
export const updateProfileValidation: ValidationChain[] = [
  usernameBody.optional(),
  name.optional(),
  bio.optional(),
  body().custom((value, { req }) => {
    const { username, name, bio } = req.body;
    if (!username && !name && !bio) {
      throw new Error('At least one field (username, name, or bio) must be provided');
    }
    return true;
  })
];
