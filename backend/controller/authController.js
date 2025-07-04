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


// Login with email or username
const login = async (req, res) => {
    try {
        const { identifier, password } = req.body;
        if (!identifier || !password) {
            return res.status(400).json({ 
                status: 'error',
                message: 'Username/Email and password are required' 
            });
        }

        // Find user by email or username
        const user = await User.findOne({
            $or: [
                { email: identifier },
                { username: identifier }
            ]
        });

        if (!user) {
            return res.status(400).json({ 
                status: 'error',
                message: 'No account found , create an account first' 
            });
        }

        // Check if account was locked but lockout period has expired
        if (user.accountLockedUntil) {
            if (user.accountLockedUntil > new Date()) {
                const remainingTime = Math.ceil((user.accountLockedUntil - new Date()) / 60000);
                return res.status(429).json({
                    status: 'error',
                    message: `Account temporarily locked. Try again in ${remainingTime} minutes.`
                });
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
                
                return res.status(429).json({
                    status: 'error',
                    message: `Account locked for ${ACCOUNT_LOCKOUT_TIME} minutes due to too many failed attempts.`
                });
            }
            
            await user.save();
            return res.status(400).json({ 
                status: 'error',
                message: 'Invalid password',
                remainingAttempts: ACCOUNT_LOCKOUT_ATTEMPTS - user.loginAttempts
            });
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
            return res.status(200).json({
                status: 'success',
                redirect: '/verify-otp',
                message: 'Login successful. Please verify your email.',
                accessToken,
                user : {
                    email : user.email,
                    isEmailVerified : user.isEmailVerified,
                    username : user.username,
                }
            });
        }
        if(!user.username){
            return res.status(200).json({
                status: 'success',
                redirect: '/complete-profile',
                message: 'Login successful. Please complete your profile.',
                accessToken,
                user : {
                    email : user.email,
                    isEmailVerified : user.isEmailVerified,
                    username : user.username,
                }
            });  
        }

        res.status(200).json({
            status: 'success',
            message: 'Login successful',
            accessToken,
            user : {
                username: user.username,
                name: user.name,
                bio: user.bio,
                isEmailVerified: user.isEmailVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'An unexpected error occurred. Please try again.'
        });
    }
};

// Register new user
const register = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email);
        // Input validation
        if (!email || !password) {
            return res.status(400).json({ 
                status: 'error',
                message: 'Email and password are required' 
            });
        }

        // Check if email already exists
        const existingUser = await User.findOne({
            email
        });

        if (existingUser) {
            return res.status(400).json({ 
                status: 'error',
                message: `User with this email already exists` 
            });
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

        res.status(201).json({ 
            status: 'success',
            message: 'Registration successful. Please check your email to verify your account.',
            accessToken,
            user : {
                email : user.email,
                isEmailVerified : user.isEmailVerified,
                username : user.username,
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'An unexpected error occurred. Please try again.'
        });
    }
};

// Verify OTP
const verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        if (!otp) {
            return res.status(400).json({ 
                status: 'error',
                message: 'OTP is required' 
            });
        }
        
        const user =  await User.findOne({ email: req.user.email });
        if (user.isEmailVerified) {
            return res.status(400).json({ 
                status: 'error',
                message: 'Email is already verified' 
            });
        }

        // Verify OTP
        const otpVerification = otpManager.verifyOTP(user.email, otp);
        if (!otpVerification.valid) {
            return res.status(400).json({ 
                status: 'error',
                message: otpVerification.message 
            });
        }
        
        // Mark email as verified
        user.isEmailVerified = true;
        await user.save();
        
      

        res.status(200).json({
            status: 'success',
            message: 'Email verified successfully',
            });
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'An error occurred during verification' 
        });
    }
};

// Resend OTP
const resendOtp = async (req, res) => {
    try {
        
        if (!req.user.email) {
            return res.status(400).json({ 
                status: 'error',
                message: 'Email is required' 
            });
        }

        const user = req.user;
       
        if (user.isEmailVerified) {
            return res.status(400).json({ 
                status: 'error',
                message: 'Email is already verified' 
            });
        }

        // Check if there's a recent OTP attempt
        const existingOtp = otpManager.getOtpData(user.email);
        if (existingOtp) {
            const timeSinceLastOtp = Date.now() - (existingOtp.expiresAt - (10 * 60 * 1000));
            if (timeSinceLastOtp < 60000) { // 1 minute cooldown
                return res.status(429).json({
                    status: 'error',
                    message: 'Please wait before requesting a new OTP'
                });
            }
        }

       await sendOtp(user.email);

        res.json({ 
            status: 'success',
            message: 'OTP sent to your email'
        });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'An error occurred while processing your request' 
        });
    }
};

// Forgot password
const forgotPassword = async (req, res) => {
    try {
        const { identifier } = req.body; // Can be email or username
        
        if (!identifier) {
            return res.status(400).json({ 
                status: 'error',
                message: 'Email or username is required' 
            });
        }

        // Find user by email or username
        const user = await User.findOne({
            $or: [
                { email: identifier },
                { username: identifier }
            ]
        });

        if (!user) {
            return res.status(404).json({ 
                status: 'error',
                message: 'No account found with that email or username' 
            });
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
        
        res.json({ 
            status: 'success',
            message: 'A new password has been sent to your email address.' 
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'An error occurred while processing your request. Please try again later.' 
        });
    }
};

// Refresh access token
const refreshAccessToken = async (req, res) => {
    try {
     
        const { refreshToken } = req.cookies;
      
        if (!refreshToken) {
            return res.status(400).json({
                status: 'error',
                message: 'Refresh token is required'
            });
        }

        const { accessToken , refreshToken : newRefreshToken} = await refreshTokens(refreshToken);
        
        // Set new refresh token as httpOnly cookie
        sendCookie(res, newRefreshToken);
        
        res.status(200).json({
            status: 'success',
            accessToken
        });
    } catch (error) {
        res.status(401).json({
            status: 'error',
            message: error.message || 'Failed to refresh token'
        });
    }
};

// Logout user (invalidate refresh token)
const logout = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(200).json({
                status: 'success',
                message: 'Logged out successfully'
            });
        }

        await invalidateRefreshToken(userId);
        
        // Clear refresh token cookie
        deleteCookie(res);
        
        res.status(200).json({
            status: 'success',
            redirect: '/login',
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to logout'
        });
    }
};



export {
    login,
    register,
    verifyOtp,
    resendOtp,
    forgotPassword,
    refreshAccessToken,
    logout
};
