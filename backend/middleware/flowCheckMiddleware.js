import User from "../models/User.js";

/**
 * Middleware to check if user's email is verified.
 */
export const checkEmailVerification = (req, res, next) => {
  const user = req.user;

  if (!user?.isEmailVerified) {
    return res.status(403).json({
      status: 'error',
      redirect: '/verify-email',
      message: 'Email is not verified. Please verify your email first.',
      user: {
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        isProfileCompleted: user.isProfileCompleted,
      }
    });
  }

  next();
};

/**
 * Middleware to check if user has completed their profile.
 */
export const checkCompleteProfile = (req, res, next) => {
  const user = req.user;
  console.log(user);
  if (!user?.username) {
    return res.status(403).json({
      status: 'error',
      redirect: '/complete-profile',
      message: 'Profile is incomplete. Please complete your profile.',
      user: {
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        isProfileCompleted: user.isProfileCompleted,
      }
    });
  }

  next();
};

/**
 * Controller to check username availability.
 */
export const checkUsernameAvailability = async (req, res , next) => {
  try {
    let username = '';
    let fromBody = false;

    // Extract from different sources
    if (req.body?.username) {
      username = req.body.username;
      fromBody = true;
    } else if (req.query?.username) {
      username = req.query.username;
    } else if (req.params?.username) {
      username = req.params.username;
    }

    // Validate input
    if (!username) {
      return res.status(400).json({
        status: 'error',
        message: 'Username is required.',
      });
    }

    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        status: 'error',
        message: 'Username must be 3–30 characters long and can only contain letters, numbers, and underscores.',
      });
    }

    if (!fromBody) {
      const existingUser = await User.findOne({ username });

      return res.status(200).json({
        status: existingUser ? 'error' : 'success',
        available: !existingUser,
        message: existingUser ? 'Username is already taken.' : 'Username is available.',
      });
    }

    // For form submission, let it pass to next middleware
    next();
  } catch (err) {
    console.error('Username check error:', err.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to check username availability. Please try again.',
    });
  }
};
