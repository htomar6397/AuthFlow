import { verifyAccessToken } from '../services/jwtService.js';
import User from '../models/User.js';

/**
 * Middleware to authenticate requests using JWT
 */
export const authenticate = async (req, res, next) => {
    try {
        // Get token from Authorization header
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } 

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'You are not logged in. Please log in to get access.'
            });
        }

        // Verify token
        const { valid, expired, decoded } = verifyAccessToken(token);

        if (!valid || !decoded) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid token or user no longer exists.'
            });
        }

        if (expired) {
            return res.status(401).json({
                status: 'error',
                message: 'Your token has expired. Please log in again.'
            });
        }

        // Check if user still exists
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return res.status(401).json({
                status: 'error',
                message: 'The user belonging to this token no longer exists.'
            });
        }

        // Grant access to protected route
        req.user = {
            id: currentUser._id,
            email: currentUser.email,
            isEmailVerified: currentUser.isEmailVerified,
            username: currentUser.username,
        };

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({
            status: 'error',
            message: 'Authentication failed. Please log in again.'
        });
    }
};


