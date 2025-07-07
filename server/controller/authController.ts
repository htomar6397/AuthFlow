import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import { generateAuthTokens, refreshTokens, invalidateRefreshToken } from '../services/jwtService';
import { sendCookie, deleteCookie } from '../services/cookieService';
import { sendPass, sendOtp } from '../services/emailService';
import { otpManager } from '../utils/otpStore';
import { comparePassword, hashPassword } from '../utils/hashed';
import asyncHandler from '../utils/asyncHandler';
import AppError from '../middleware/AppError';
import { sendSuccess } from '../utils/responseHandler';
import { CustomRequest } from '../types/express';

// Login with email or username
const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { identifier, password }: { identifier: string; password: string } = req.body;

    // Find user by email or username
    const user: IUser | null = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    }).select('+password').select('+googleId'); // Explicitly include password

    if (!user) {
      next(new AppError('No account found, create an account first', 400));
      return;
    }

    // Check if account was locked but lockout period has expired
    if (user.accountLockedUntil) {
      if (user.accountLockedUntil > new Date()) {
        const remainingTime = Math.ceil(
          (user.accountLockedUntil.getTime() - new Date().getTime()) / 60000
        );
        next(
          new AppError(`Account temporarily locked. Try again in ${remainingTime} minutes.`, 429)
        );
        return;
      } else {
        // Reset login attempts if lockout period has expired
        user.loginAttempts = 0;
        user.accountLockedUntil = null;
        await user.save();
      }
    }

    const isMatch: boolean = await comparePassword(password, user.password || '');
    if (!isMatch) {
      // Increment failed login attempts
      user.loginAttempts += 1;
      user.lastLoginAttempt = new Date();
      const ACCOUNT_LOCKOUT_ATTEMPTS: number = parseInt(
        process.env.ACCOUNT_LOCKOUT_ATTEMPTS || '5',
        10
      );
      const ACCOUNT_LOCKOUT_TIME: number = parseInt(process.env.ACCOUNT_LOCKOUT_TIME || '30', 10);

      // Lock account after 5 failed attempts for 30 minutes
      if (user.loginAttempts >= ACCOUNT_LOCKOUT_ATTEMPTS) {
        user.accountLockedUntil = new Date(Date.now() + ACCOUNT_LOCKOUT_TIME * 60 * 1000);
        await user.save();

        next(
          new AppError(
            `Account locked for ${ACCOUNT_LOCKOUT_TIME} minutes due to too many failed attempts.`,
            429
          )
        );
        return;
      }

      await user.save();
      next(
        new AppError(
          `Invalid password. ${ACCOUNT_LOCKOUT_ATTEMPTS - user.loginAttempts} attempts remaining.`,
          400
        )
      );
      return;
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateAuthTokens(user);
    // Set refresh token as httpOnly cookie
    sendCookie(res, refreshToken);

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lastLoginAttempt = null;
    user.accountLockedUntil = null;
    await user.save();

    // Send verification email if not verified
    if (!user.isEmailVerified) {
      await sendOtp(user.email);
      sendSuccess(
        res,
        {
          accessToken,
          user: {
            email: user.email,
            isEmailVerified: user.isEmailVerified,
          },
        },
        'Login successful. Please verify your email.'
      );
      return;
    }
    if (!user.username) {
      sendSuccess(
        res,
        {
          accessToken,
          user: {
            email: user.email,
            isEmailVerified: user.isEmailVerified,
          },
        },
        'Login successful. Please complete your profile.'
      );
      return;
    }

    sendSuccess(
      res,
      {
        accessToken,
        user: {
          username: user.username,
          name: user.name,
          bio: user.bio,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt,
          isGoogleLinked: !!user.googleId,
        },
      },
      'Login successful'
    );
    return;
  }
);

// Register new user
const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password }: { email: string; password: string } = req.body;

    // Check if email already exists
    const existingUser: IUser | null = await User.findOne({
      email,
    });

    if (existingUser) {
      next(new AppError('User with this email already exists', 400));
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const user: IUser = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = await generateAuthTokens(user);
    // Set refresh token as httpOnly cookie
    sendCookie(res, refreshToken);
    // Send otp email
    await sendOtp(user.email);

    sendSuccess(
      res,
      {
        accessToken,
        user: {
          email: user.email,
          isEmailVerified: user.isEmailVerified,
        },
      },
      'Registration successful. Please check your email to verify your account.',
      201
    );
    return;
  }
);

// Verify OTP
const verifyOtp = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    const { otp }: { otp: string } = req.body;
    
    if (req.user.isEmailVerified) {
      next(new AppError('Email is already verified', 400));
      return;
    }
    try {
    const user: IUser | null = await User.findById(req.user.id);
    if (!user) {
      next(new AppError('User not found', 404));
      return;
    }


    // Verify OTP
    const otpVerification = otpManager.verifyOTP(user.email, otp);
    if (!otpVerification.valid) {
      next(new AppError(otpVerification.message || 'Invalid OTP', 400));
      return;
    }

    // Mark email as verified
    user.isEmailVerified = true;
    await user.save();

    sendSuccess(res, { message: 'OTP verified successfully' });
    return;
    }
    catch (err: any) {
      next(new AppError(err.message || 'Failed to verify OTP', 500));
      return;
    }
  }
);

// Resend OTP
const resendOtp = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    const user = req.user;

    if (user.isEmailVerified) {
      next(new AppError('Email is already verified', 400));
      return;
    }
    try {
    // Check if there's a recent OTP attempt
    const existingOtp = otpManager.getOtpData(user.email);
    if (existingOtp) {
      const timeSinceLastOtp = Date.now() - (existingOtp.expiresAt - 10 * 60 * 1000);
      if (timeSinceLastOtp < 60000) {
        // 1 minute cooldown
        next(new AppError('Please wait before requesting a new OTP', 429));
        return;
      }
    }

    await sendOtp(user.email);

    sendSuccess(res, null, 'OTP sent to your email');
    return;
    }
    catch (err: any) {
    next(new AppError(err.message || 'Failed to send OTP', 500));
    return;
    }
  }
);

// Forgot password
const forgotPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { identifier }: { identifier: string } = req.body;

    // Find user by email or username
    const user: IUser | null = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      next(new AppError('No account found with that email or username', 404));
      return;
    }

    if (user.email === 'testUser1@gmail.com') {
      next(new AppError('Test User cannot reset password', 400));
      return;
    }

    // Generate a secure random password
    const newPassword =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15) +
      '!@#'; // Add some special characters

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user's password and set reset token/expiry
    user.password = hashedPassword;
    user.lastPasswordReset = new Date(); // Update lastPasswordReset
    await user.save();

    // Send email with new password
    await sendPass(user.email, newPassword);

    sendSuccess(res, null, 'A new password has been sent to your email address.');
    return;
  }
);

// Refresh access token
const refreshAccessToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const refreshToken: string | undefined = req.cookies.refreshToken;

    if (!refreshToken) {
      next(new AppError('Refresh token is required', 400));
      return;
    }

    const { accessToken, refreshToken: newRefreshToken } = await refreshTokens(refreshToken);

    // Set new refresh token as httpOnly cookie
    sendCookie(res, newRefreshToken);

    sendSuccess(res, { accessToken });
    return;
  }
);

/**
 * Controller to check username availability.
 */
const checkUsernameAvailability = asyncHandler(
  async (req: Request,
  res: Response,
  next: NextFunction): Promise<void> => {
  const username = req.query.username || req.params.username;
  try {

    const existingUser: IUser | null = await User.findOne({ username });
  
      res.status(200).json({
        status: existingUser ? 'error' : 'success',
        data: {
          available: !existingUser,
        },
        message: existingUser ? 'Username is already taken.' : 'Username is available.',
      });
      return;
    }
    catch (err: any) {
    console.error('Username check error:', err.message);
    next(new AppError('Failed to check username availability. Please try again.', 500));
      return;
  }
});

// Logout user (invalidate refresh token)
const logout = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user.id;
 try {
    await invalidateRefreshToken(userId);

    // Clear refresh token cookie
    deleteCookie(res);

    sendSuccess(res, null, 'Logged out successfully');
    return;
  }
  catch (err: any) {
    console.error('Logout error:', err.message);
    next(new AppError('Failed to logout. Please try again.', 500));
    return;
    }
  }
);

// Google authentication callback
const googleAuthCallback = async (req: CustomRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/oauth-callback?error=Google authentication failed`
      );
    }

    const user = req.user as IUser;
    const { accessToken, refreshToken } = await generateAuthTokens(user);

    // Set refresh token in HTTP-only cookie
    sendCookie(res, refreshToken);

    // Redirect to frontend with access token and user data
    const redirectUrl = new URL(`${process.env.FRONTEND_URL}/oauth-callback`);
    redirectUrl.searchParams.set('access_token', accessToken);
    redirectUrl.searchParams.set(
      'user',
      JSON.stringify({
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        ...(user.username
          ? {
              username: user.username,
              bio: user.bio,
              createdAt: user.createdAt,
              isGoogleLinked: true,
            }
          : {}),
      })
    );

    return res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('Google OAuth error:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/oauth-callback?error=Authentication failed`);
  }
};

export {
  login,
  register,
  verifyOtp,
  resendOtp,
  forgotPassword,
  refreshAccessToken,
  checkUsernameAvailability,
  logout,
  googleAuthCallback,
};
