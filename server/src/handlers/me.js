const userService = require('../services/userService');
const authService = require('../services/authService');

module.exports.handler = async (event) => {
  try {
    // Get the token from the Authorization header
    const authHeader = event.headers.Authorization || event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: 'Unauthorized',
          message: 'No token provided',
        }),
      };
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token
    let decoded;
    try {
      decoded = authService.verifyJWT(token);
    } catch (error) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: 'Unauthorized',
          message: 'Invalid or expired token',
        }),
      };
    }

    // Get the user from the database
    const user = await userService.getByEmail(decoded.email);
    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'NotFound',
          message: 'User not found',
        }),
      };
    }

    // Return user data (excluding sensitive information)
    const userData = {
      id: user.email,
      email: user.email,
      username: user.username,
      name: user.name,
      bio: user.bio,
      confirmed: user.confirmed,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return {
      statusCode: 200,
      body: JSON.stringify({
        user: userData,
      }),
    };
  } catch (error) {
    console.error('Get current user error:', error);
    
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({
        error: error.name || 'InternalServerError',
        message: 'An error occurred while fetching user data',
      }),
    };
  }
};
