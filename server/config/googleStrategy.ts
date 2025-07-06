import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User';
import { hashPassword } from '../utils/hashed';

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    passReqToCallback: true,
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ email: profile.emails?.[0].value });

      if (!user) {
        // Generate a secure random password
        const newPassword =
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15) +
          '!@#'; // Add some special characters

        // Hash the new password
        const hashedPassword = await hashPassword(newPassword); // Create new user with Google auth
        user = new User({
          name: profile.displayName,
          email: profile.emails?.[0].value,
          isEmailVerified: true, // Google verifies the email
          googleId: profile.id,
          password: hashedPassword,
        });

        await user.save();
      } else if (user.googleId === profile.id) {
      } else {
        // User exists with local auth but trying to login with Google
        user.googleId = profile.id;
        await user.save();
      }

      return done(null, user);
    } catch (error) {
      return done(error as Error);
    }
  }
);

export default googleStrategy;
