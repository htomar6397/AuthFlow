import User from "../models/User.js";
import bcrypt from 'bcrypt';
import { 
    generateAuthTokens,
    refreshTokens,
    invalidateRefreshToken, 
} from '../services/jwtService.js';
import { sendCookie , deleteCookie } from '../services/cookieService.js';
import  { sendPass, sendOtp } from "../services/emailService.js";
import otpManager from "../utils/otpStore.js";
import { hashPassword } from "../utils/hashed.js";
import asyncHandler from "../utils/asyncHandler.js";
import { AppError } from "../middleware/errorMiddleware.js";
import { sendSuccess } from "../utils/responseHandler.js";


// Login with email or username
const login = asyncHandler(async (req, res, next) => {
    const { identifier, password } = req.body;

    // Find user by email or username
    const user = await User.findOne({
        $or: [
            { email: identifier },
            { username: identifier }
        ]
    });

    if (!user) {
        return next(new AppError('No account found, create an account first', 400));
    }

    // Check if account was locked but lockout period has expired
    if (user.accountLockedUntil) {
        if (user.accountLockedUntil > new Date()) {
            const remainingTime = Math.ceil((user.accountLockedUntil - new Date()) / 60000);
            return next(new AppError(`Account temporarily locked. Try again in ${remainingTime} minutes.`, 429));
        } else {
            // Reset login attempts if lockout period has expired
            user.loginAttempts = 0;
            user.accountLockedUntil = null;
            await user.save();
        }
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        // Increment failed login attempts
        user.loginAttempts += 1;
        user.lastLoginAttempt = new Date();
        const ACCOUNT_LOCKOUT_ATTEMPTS = process.env.ACCOUNT_LOCKOUT_ATTEMPTS || 5; // default 5 attempts
        const ACCOUNT_LOCKOUT_TIME = process.env.ACCOUNT_LOCKOUT_TIME || 30; // default 30 minutes
        
        // Lock account after 5 failed attempts for 30 minutes
        if (user.loginAttempts >= ACCOUNT_LOCKOUT_ATTEMPTS) {
            user.accountLockedUntil = new Date(Date.now() + ACCOUNT_LOCKOUT_TIME * 60 * 1000);
            await user.save();
            
            return next(new AppError(`Account locked for ${ACCOUNT_LOCKOUT_TIME} minutes due to too many failed attempts.`, 429));
        }
        
        await user.save();
        return next(new AppError(`Invalid password. ${ACCOUNT_LOCKOUT_ATTEMPTS - user.loginAttempts} attempts remaining.`, 400));
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
        return sendSuccess(res, { 
            redirect: '/verify-otp',
            accessToken,
            user : {
                email : user.email,
                isEmailVerified : user.isEmailVerified,
                username : user.username,
            }
         }, 'Login successful. Please verify your email.');
    }
    if(!user.username){
        return sendSuccess(res, { 
            redirect: '/complete-profile',
            accessToken,
            user : {
                email : user.email,
                isEmailVerified : user.isEmailVerified,
                username : user.username,
            }
         }, 'Login successful. Please complete your profile.');
    }

    sendSuccess(res, {
        accessToken,
        user : {
            username: user.username,
            name: user.name,
            bio: user.bio,
            isEmailVerified: user.isEmailVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }
    }, 'Login successful');
});

// Register new user
const register = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({
        email
    });

    if (existingUser) {
        return next(new AppError('User with this email already exists', 400));
    }

    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create new user
    const user = new User({
        email: email.toLowerCase(),
        password: hashedPassword
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = await generateAuthTokens(user);
    // Set refresh token as httpOnly cookie
    sendCookie(res, refreshToken);
    // Send otp email
    await sendOtp(user.email);

    sendSuccess(res, {
        accessToken,
        user : {
            email : user.email,
            isEmailVerified : user.isEmailVerified,
            username : user.username,
        }
    }, 'Registration successful. Please check your email to verify your account.', 201);
});

// Verify OTP
const verifyOtp = asyncHandler(async (req, res, next) => {
    const { otp } = req.body;
    
    const user =  await User.findOne({ email: req.user.email });
    if (user.isEmailVerified) {
        return next(new AppError('Email is already verified', 400));
    }

    // Verify OTP
    const otpVerification = otpManager.verifyOTP(user.email, otp);
    if (!otpVerification.valid) {
        return next(new AppError(otpVerification.message, 400));
    }
    
    // Mark email as verified
    user.isEmailVerified = true;
    await user.save();
    
    sendSuccess(res, null, 'Email verified successfully');
});

// Resend OTP
const resendOtp = asyncHandler(async (req, res, next) => {
    const user = req.user;
   
    if (user.isEmailVerified) {
        return next(new AppError('Email is already verified', 400));
    }

    // Check if there's a recent OTP attempt
    const existingOtp = otpManager.getOtpData(user.email);
    if (existingOtp) {
        const timeSinceLastOtp = Date.now() - (existingOtp.expiresAt - (10 * 60 * 1000));
        if (timeSinceLastOtp < 60000) { // 1 minute cooldown
            return next(new AppError('Please wait before requesting a new OTP', 429));
        }
    }

   await sendOtp(user.email);

    sendSuccess(res, null, 'OTP sent to your email');
});

// Forgot password
const forgotPassword = asyncHandler(async (req, res, next) => {
    const { identifier } = req.body; // Can be email or username

    // Find user by email or username
    const user = await User.findOne({
        $or: [
            { email: identifier },
            { username: identifier }
        ]
    });

    if (!user) {
        return next(new AppError('No account found with that email or username', 404));
    }

    // Generate a secure random password
    const newPassword = Math.random().toString(36).substring(2, 15) + 
                      Math.random().toString(36).substring(2, 15) +
                      '!@#'; // Add some special characters
    
    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);
    
    // Update user's password and set reset token/expiry
    user.password = hashedPassword;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();
    
    // Send email with new password
   await sendPass(user.email ,newPassword);
    
    sendSuccess(res, null, 'A new password has been sent to your email address.');
});

// Refresh access token
const refreshAccessToken = asyncHandler(async (req, res, next) => {
    const { refreshToken } = req.cookies;
  
    if (!refreshToken) {
        return next(new AppError('Refresh token is required', 400));
    }

    const { accessToken , refreshToken : newRefreshToken} = await refreshTokens(refreshToken);
    
    // Set new refresh token as httpOnly cookie
    sendCookie(res, newRefreshToken);
    
    sendSuccess(res, { accessToken });
});

// Logout user (invalidate refresh token)
const logout = asyncHandler(async (req, res, next) => {
    const userId = req.user?.id;
    if (!userId) {
        return sendSuccess(res, null, 'Logged out successfully');
    }

    await invalidateRefreshToken(userId);
    
    // Clear refresh token cookie
    deleteCookie(res);
    
    sendSuccess(res, { redirect: '/login' }, 'Logged out successfully');
});

export {
    login,
    register,
    verifyOtp,
    resendOtp,
    forgotPassword,
    refreshAccessToken,
    logout
};
