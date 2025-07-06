import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/jwtService';
import User, { IUser } from '../models/User';
import AppError from './AppError';

/**
 * Middleware to authenticate requests using JWT
 */
const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        status: 'error',
        message: 'You are not logged in. Please log in to get access.',
      });
      return;
    }

    const { valid, expired, decoded } = verifyAccessToken(token);

    if (!valid || !decoded) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid token or user no longer exists.',
      });
      return;
    }

    if (expired) {
      res.status(401).json({
        status: 'error',
        message: 'Your token has expired. Please log in again.',
      });
      return;
    }

    const currentUser: IUser | null = await User.findById(decoded.id);
    if (!currentUser) {
      res.status(401).json({
        status: 'error',
        message: 'The user belonging to this token no longer exists.',
      });
      return;
    }

    req.user = {
      id: (currentUser._id as mongoose.Types.ObjectId).toString(),
      email: currentUser.email,
      isEmailVerified: currentUser.isEmailVerified,
      username: currentUser.username,
    };

    next();
    return;
  } catch (error: any) {
    console.error('Authentication error:', error);
    next(new AppError('Authentication failed. Please log in again.', 401));
    return;
  }
};

export { authenticate };
