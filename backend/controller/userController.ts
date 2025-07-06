import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import { sendPassChangeAlert, sendWelcomeEmail } from '../services/emailService';
import { comparePassword, hashPassword } from '../utils/hashed';
import asyncHandler from '../utils/asyncHandler';
import AppError from '../middleware/AppError';
import { sendSuccess } from '../utils/responseHandler';

interface CustomRequest extends Request {
  user?: {
    id: string;
    email: string;
    isEmailVerified: boolean;
    username?: string | null;
  };
  body: any;
}

const completeProfile = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    const { username, name, bio }: { username?: string; name?: string; bio?: string } = req.body;

    const user: IUser | null = await User.findOne({ email: req.user?.email });

    if (!user) {
      next(new AppError('User not found', 404));
      return;
    }

    if (username) user.username = username;
    if (name) user.name = name;
    if (bio) user.bio = bio;

    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user.name, user.email);

    sendSuccess(
      res,
      {
        username: user.username,
        name: user.name,
        email: user.email,
        bio: user.bio,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      'Profile completed successfully'
    );
    return;
  }
);

const me = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    const user: IUser | null = await User.findOne(
      { email: req.user?.email },
      'email username name bio isEmailVerified createdAt updatedAt'
    ).lean();
    if (!user) {
      next(new AppError('User not found', 404));
      return;
    }

    sendSuccess(res, user);
    return;
  }
);

const updateProfile = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    const { name, bio, username }: { name?: string; bio?: string; username?: string } = req.body;
    if (!name && !bio && !username) {
      next(new AppError('name or bio or username is required', 400));
      return;
    }

    const user: IUser | null = await User.findOne({ email: req.user?.email });

    if (!user) {
      next(new AppError('User not found', 404));
      return;
    }
    if (username) {
      if (username !== 'testuser' && user.username === 'testuser') {
        next(new AppError('testuser username cannot be changed', 400));
        return;
      }
    }
    // Check if the changes are the same as the original values
    const noChangesDetected =
      (name === undefined || name === user.name) &&
      (bio === undefined || bio === user.bio) &&
      (username === undefined || username === user.username);
    if (noChangesDetected) {
      next(
        new AppError('No changes detected. The new values are the same as the original ones', 400)
      );
      return;
    }

    if (name) user.name = name;
    if (bio) user.bio = bio;
    if (username) user.username = username;
    await user.save();

    sendSuccess(
      res,
      {
        username: user.username,
        name: user.name,
        email: user.email,
        bio: user.bio,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      'Profile updated successfully'
    );
    return;
  }
);

const changePassword = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    const { password, newPassword }: { password?: string; newPassword?: string } = req.body;

    if (!password || !newPassword) {
      next(new AppError('Current password and new password are required', 400));
      return;
    }
    if (password === newPassword) {
      next(new AppError('New password cannot be the same as the current password', 400));
      return;
    }

    const user: IUser | null = await User.findOne({ email: req.user?.email }).select('+password');

    if (!user) {
      next(new AppError('User not found', 404));
      return;
    }

    if (user.username === 'testuser') {
      next(new AppError('testuser cannot change password', 400));
      return;
    }

    const isMatch: boolean = await comparePassword(password, user.password);
    if (!isMatch) {
      next(new AppError('Invalid password', 400));
      return;
    }

    user.password = await hashPassword(newPassword);
    user.lastPasswordReset = new Date(); // Update lastPasswordReset
    await user.save();

    // Send password change alert
    await sendPassChangeAlert(user.name || user.email, user.email);
    sendSuccess(res, null, 'Password changed successfully');
    return;
  }
);

const deleteAccount = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    const password = req.body.password;

    if (!password) {
      next(new AppError('Password is required', 400));
      return;
    }
    const user: IUser | null = await User.findOne({ email: req.user?.email }).select('+password');

    if (!user) {
      next(new AppError('User not found', 404));
      return;
    }

    const isMatch: boolean = await comparePassword(password, user.password);
    if (!isMatch) {
      next(new AppError('Invalid password', 400));
      return;
    }
    if (user.username === 'testuser') {
      next(new AppError('testuser cannot delete account', 400));
      return;
    }
    // Delete the user document
    await User.deleteOne({ _id: user?.id });

    // Clear the refresh token cookie if it exists
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    // Send success response
    sendSuccess(res, null, 'Account deleted successfully');
    return;
  }
);

export { completeProfile, me, updateProfile, changePassword, deleteAccount };
