const userService = require('../services/userService');
const authService = require('../services/authService');
const { loginSchema } = require('../utils/validators');

module.exports.handler = async (event) => {
  try {
    const { identifier, password } = await loginSchema.validateAsync(JSON.parse(event.body));

    // Check if identifier is email or username
    const isEmail = identifier.includes('@');
    const user = isEmail
      ? await userService.getByEmail(identifier)
      : await userService.getByUsername(identifier);

    // Check if user exists and is confirmed
    if (!user) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: 'AuthenticationError',
          message: 'Invalid email/username or password',
        }),
      };
    }

    if (!user.confirmed) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          error: 'AccountNotConfirmedError',
          message: 'Please confirm your email before logging in',
        }),
      };
    }

    // Verify password
    const isPasswordValid = await authService.verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: 'AuthenticationError',
          message: 'Invalid email/username or password',
        }),
      };
    }

    // Generate JWT token
    const token = authService.issueJWT({
      id: user.email,
      email: user.email,
      username: user.username,
      name: user.name,
    });

    // Return user data (excluding sensitive information)
    const userData = {
      id: user.email,
      email: user.email,
      username: user.username,
      name: user.name,
      bio: user.bio,
      confirmed: user.confirmed,
    };

    return {
      statusCode: 200,
      headers: {
        'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=86400; ${
          process.env.NODE_ENV === 'production' ? 'Secure; SameSite=None' : ''
        }`,
      },
      body: JSON.stringify({
        message: 'Login successful',
        user: userData,
        token,
      }),
    };
  } catch (error) {
    console.error('Login error:', error);
    
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
        message: 'An error occurred during login',
      }),
    };
  }
};
