const userService = require('../services/userService');
const authService = require('../services/authService');
const emailService = require('../services/emailService');
const { registerSchema } = require('../utils/validators');

module.exports.handler = async (event) => {
  try {
    const { email, username, name, bio, password } = await registerSchema.validateAsync(
      JSON.parse(event.body)
    );

    // Check if email or username already exists
    const [existingEmail, existingUsername] = await Promise.all([
      userService.getByEmail(email),
      userService.getByUsername(username),
    ]);

    if (existingEmail || existingUsername) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'ValidationError',
          message: 'Email or username already in use',
        }),
      };
    }

    // Hash password
    const passwordHash = await authService.hashPassword(password);
    
    // Create user with confirmation token
    const confirmToken = await emailService.sendConfirmationEmail(
      { email, username, name },
      process.env.BASE_URL
    );
    
    await userService.createUser({
      email,
      username,
      name,
      bio,
      passwordHash,
      confirmToken,
    });

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'Registration successful. Please check your email to confirm your account.',
      }),
    };
  } catch (error) {
    console.error('Registration error:', error);
    
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
        message: error.message || 'An error occurred during registration',
      }),
    };
  }
};
