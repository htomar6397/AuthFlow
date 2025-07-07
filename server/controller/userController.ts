import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import { sendPassChangeAlert, sendWelcomeEmail } from '../services/emailService';
import { comparePassword, hashPassword } from '../utils/hashed';
import asyncHandler from '../utils/asyncHandler';
import AppError from '../middleware/AppError';
import { sendSuccess } from '../utils/responseHandler';
import { deleteCookie } from '../services/cookieService';
import { CustomRequest } from '../types/express';



const completeProfile = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    const { username, name, bio }: { username: string; name: string; bio?: string } = req.body;
    try {
    const user: IUser | null = await User.findById(req.user.id).select('+googleId');
   
    if (!user) {
      next(new AppError('User not found', 404));
      return;
    }

    if(user.username){
      next(new AppError('profile is already completed', 400));
      return;
    }
    const isUsernameTaken = await User.findOne({ username });
    if (isUsernameTaken && isUsernameTaken.email !== req.user?.email) {
      next(new AppError('Username is already taken', 400));
      return;
    }

    user.username = username;
    user.name = name || 'User';
    if(bio) user.bio = bio;

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
        isGoogleLinked: !!user.googleId,
      },
      'Profile completed successfully'
    );
    return;
  }
  catch (error : any) {
    next(new AppError(error.message || 'Failed to complete profile', 500));
    return;
    }
  }
);

const me = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await User.findById(req.user.id,
        'email username name bio isEmailVerified createdAt googleId'
      ).lean();
      
      if (!user) {
        next(new AppError('User not found', 404));
        return;
      }
      
      // Create a new object that matches the expected return type
      const userResponse = {
        ...user,
        isGoogleLinked: !!user.googleId
      };

      delete userResponse.googleId;
      
      sendSuccess(res, userResponse);
    } catch (error : any) {
      next(new AppError(error.message || 'Failed to fetch user', 500));
    }
  }
);

const updateProfile = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    const { name, bio, username }: { name?: string; bio?: string; username?: string } = req.body;
   try{
    if(username){
      const isUsernameTaken = await User.findOne({ username });
      if (isUsernameTaken && isUsernameTaken.email !== req.user?.email) {
        next(new AppError('Username is already taken', 400));
        return;
      }
    }

    const user: IUser | null = await User.findById(req.user.id).select('+googleId')

    if (!user) {
      next(new AppError('User not found', 404));
      return;
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
        isGoogleLinked: !!user.googleId,
      },
      'Profile updated successfully'
    );
    return;
  }
  catch (error : any) {
    next(new AppError(error.message || 'Failed to update profile', 500));
    return;
    }
  }
);

const changePassword = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    const { password, newPassword }: { password: string; newPassword: string } = req.body;

    if (req.user.email === 'testuser1@gmail.com') {
      next(new AppError('Test user cannot change password', 400));
      return;
    }

    if (password === newPassword) {
      next(new AppError('New password cannot be the same as the current password', 400));
      return;
    }
  try{
    const user: IUser | null = await User.findById(req.user.id).select('+password');

    if (!user) {
      next(new AppError('User not found', 404));
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
  catch (error : any) {
    next(new AppError(error.message || 'Failed to change password', 500));
    return;
    }
  }
);

const deleteAccount = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    const password = req.body.password;

    if (req.user.email === 'testuser1@gmail.com') {
      next(new AppError('Test user cannot delete account', 400));
      return;
    }
    try{
    const user: IUser | null = await User.findById(req.user.id).select('+password');

    if (!user) {
      next(new AppError('User not found', 404));
      return;
    }

    const isMatch: boolean = await comparePassword(password, user.password);
    if (!isMatch) {
      next(new AppError('Invalid password', 400));
      return;
    }
    // Delete the user document
    await User.deleteOne({ _id: user?.id });

    // Clear the refresh token cookie if it exists
    deleteCookie(res);

    // Send success response
    sendSuccess(res, null, 'Account deleted successfully');
    return;
  }
  catch (error : any) {
    next(new AppError(error.message || 'Failed to delete account', 500));
    return;
    }
    }
);

export { completeProfile, me, updateProfile, changePassword, deleteAccount };
