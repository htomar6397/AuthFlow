import User from "../models/User.js";
import { sendPassChangeAlert , sendWelcomeEmail } from "../services/emailService.js";
import { comparePassword, hashPassword } from "../utils/hashed.js";
import asyncHandler from "../utils/asyncHandler.js";
import { AppError } from "../middleware/errorMiddleware.js";
import { sendSuccess } from "../utils/responseHandler.js";

const completeProfile = asyncHandler(async (req, res, next) => {
    const { username,name,bio } = req.body;

    const user = await User.findOne({ email: req.user.email });
    
    user.username = username;
    user.name = name;
    if(bio) user.bio = bio;
    
    await user.save();
    
    // Send welcome email
    await sendWelcomeEmail(user.email , user.name);

    sendSuccess(res, {
        user : {
            username: username,
            name: name,
            email: user.email,
            bio: bio || user.bio,
            isEmailVerified: user.isEmailVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }
    }, 'Profile completed successfully');
});

const me = asyncHandler(async (req, res, next) => {
    const user = await User.findOne(
        { email: req.user.email },
        'email username name bio isEmailVerified createdAt updatedAt'
    ).lean();
    if (!user) {
        return next(new AppError('User not found', 400));
    }

    sendSuccess(res, user);
});

const updateProfile = asyncHandler(async (req, res, next) => {
    const { name,bio} = req.body;
    if (!name && !bio) {
        return next(new AppError('name or bio is required', 400));
    }
    const user = await User.findOne({ email: req.user.email });

    if(name) user.name = name;
    if(bio) user.bio = bio;
    await user.save();

    sendSuccess(res, {
        user : {
            username: user.username,
            name: name || user.name,
            email: user.email,
            bio: bio || user.bio,
            isEmailVerified: user.isEmailVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }
    }, 'Profile updated successfully');
});

const changePassword = asyncHandler(async (req, res, next) => {
    const { password,newPassword } = req.body;
    const user = await User.findOne({ email: req.user.email });
    const isMatch = await comparePassword(password,user.password);
    if(!isMatch) return next(new AppError('Invalid password', 400));
    user.password = await hashPassword(newPassword);
    await user.save();
    // Send password change alert
    await sendPassChangeAlert(user.name ,user.email);
    sendSuccess(res, null, 'Password changed successfully');
});

export { completeProfile, me ,updateProfile ,changePassword };
