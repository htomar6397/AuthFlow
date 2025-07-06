import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import AppError from './AppError';
import { CustomRequest } from '../types/express';

/**
 * Middleware to check if user's email is verified.
 */
const checkEmailVerification = (req: CustomRequest, res: Response, next: NextFunction): void => {
  const user = req.user;

  if (!user || !user.email) {
    next(new AppError('User not authenticated or email not found.', 401));
    return;
  }

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

/**
 * Controller to check username availability.
 */
const checkUsernameAvailability = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let username: string = '';
    let fromBody: boolean = false;

    // Extract from different sources
    if (req.body?.username) {
      username = req.body.username;
      fromBody = true;
    } else if (req.query?.username) {
      username = req.query.username as string;
    } else if (req.params?.username) {
      username = req.params.username;
    }
   

    const existingUser: IUser | null = await User.findOne({ username });
    if (!fromBody) {

      res.status(200).json({
        status: existingUser ? 'error' : 'success',
        data: {
          available: !existingUser,
        },
        message: existingUser ? 'Username is already taken.' : 'Username is available.',
      });
      return;
    }
    if(existingUser){
      next(new AppError('Username is already taken.', 400));
      return;
    }

    // For form submission, let it pass to next middleware
    next();
    return;
  } catch (err: any) {
    console.error('Username check error:', err.message);
    next(new AppError('Failed to check username availability. Please try again.', 500));
    return;
  }
};

export { checkEmailVerification, checkCompleteProfile, checkUsernameAvailability };
