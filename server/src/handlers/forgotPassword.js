const userService = require('../services/userService');
const authService = require('../services/authService');
const emailService = require('../services/emailService');
const { forgotSchema } = require('../utils/validators');

module.exports.handler = async (event) => {
  try {
    const { identifier } = await forgotSchema.validateAsync(JSON.parse(event.body));

    // Check if identifier is email or username
    const isEmail = identifier.includes('@');
    const user = isEmail
      ? await userService.getByEmail(identifier)
      : await userService.getByUsername(identifier);

    // If user doesn't exist, return success to prevent user enumeration
    if (!user) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'If your account exists, you will receive a password reset email',
        }),
      };
    }

    // Generate a temporary password
    const tempPassword = authService.generateRandomPassword(12);
    
    // Hash the temporary password
    const passwordHash = await authService.hashPassword(tempPassword);
    
    // Update user's password
    await userService.updatePassword(user.email, passwordHash);

    // Send password reset email
    await emailService.sendPasswordResetEmail(
      user,
      tempPassword,
      process.env.FRONTEND_URL || 'http://localhost:3000'
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'If your account exists, you will receive a password reset email',
      }),
    };
  } catch (error) {
    console.error('Forgot password error:', error);
    
    if (error.isJoi) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'ValidationError',
          message: error.details[0].message,
        }),
      };
    }

    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({
        error: error.name || 'InternalServerError',
        message: 'An error occurred while processing your request',
      }),
    };
  }
};
