import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import AppError from './AppError';
import { CustomRequest } from '../types/express';

/**
 * Middleware to check if user's email is verified.
 */
const checkEmailVerification = (req: CustomRequest, res: Response, next: NextFunction): void => {
  const user = req.user;

  if (!user.isEmailVerified) {
    next(new AppError('Email not verified. Please verify your email to continue.', 403));
    return;
  }
  next();
  return;
};

/**
 * Middleware to check if user has completed their profile.
 */
const checkCompleteProfile = (req: CustomRequest, res: Response, next: NextFunction): void => {
  const user = req.user;

  if (!user?.username) {
    next(new AppError('Profile incomplete. Please complete your profile to continue.', 403));
    return;
  }

  next();
  return;
};



export { checkEmailVerification, checkCompleteProfile };
