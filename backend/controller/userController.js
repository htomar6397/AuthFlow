import User from "../models/User.js";
import { sendPassChangeAlert , sendWelcomeEmail } from "../services/EmailService.js";
import { comparePassword, hashPassword } from "../utils/hashed.js";

const completeProfile = async (req, res) => {
    const { username,name,bio } = req.body;
    if (!username || !name) {
        return res.status(400).json({ message: 'Username and name are required' });
    }

    const user = await User.findOne({ email: req.user.email });
    
    user.username = username;
    user.name = name;
    if(bio) user.bio = bio;
        try{
        await user.save();
    }catch(error){
        console.log(error);
        return res.status(500).json({ message: 'An error occurred while updating profile' });
    }
    // Send welcome email
    await sendWelcomeEmail(user.email , user.name);

    res.status(200).json({ message: 'Profile completed successfully' ,
        user : {
            username: username,
            name: name,
            email: user.email,
            bio: bio || user.bio,
            isEmailVerified: user.isEmailVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }

    });
}

const me = async (req, res) => {
    const user = await User.findOne(
        { email: req.user.email },
        'email username name bio isEmailVerified createdAt updatedAt'
    ).lean();
    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    res.status(200).json(user);
}

const updateProfile = async (req, res) => {
    const { name,bio} = req.body;
    if (!name && !bio) {
        return res.status(400).json({ message: 'name or bio is required' });
    }
    const user = await User.findOne({ email: req.user.email });

    if(name) user.name = name;
    if(bio) user.bio = bio;
    try{
        await user.save();
    }catch(error){
        console.log(error);
        return res.status(500).json({ message: 'An error occurred while updating profile' });
    }

    res.status(200).json({ message: 'Profile updated successfully' ,
        user : {
            username: user.username,
            name: name || user.name,
            email: user.email,
            bio: bio || user.bio,
            isEmailVerified: user.isEmailVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }

    });
}

const changePassword = async (req, res) => {
    const { password,newPassword } = req.body;
    if (!password && !newPassword) {
        return res.status(400).json({ message: 'password or new password is required' });
    }
    const user = await User.findOne({ email: req.user.email });
    const isMatch = await comparePassword(password,user.password);
    if(!isMatch) return res.status(400).json({ message: 'Invalid password' });
    user.password = await hashPassword(newPassword);
    try{
        await user.save();
    }catch(error){
        console.log(error);
        return res.status(500).json({ message: 'An error occurred while updating password' });
    }
    // Send password change alert
    await sendPassChangeAlert(user.name ,user.email);
    res.status(200).json({ message: 'Password changed successfully' });
}

export { completeProfile, me ,updateProfile ,changePassword };
