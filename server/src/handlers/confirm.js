const userService = require('../services/userService');
const { confirmSchema } = require('../utils/validators');

module.exports.handler = async (event) => {
  try {
    const { email, token } = await confirmSchema.validateAsync(event.queryStringParameters || {});

    // Get user by email
    const user = await userService.getByEmail(email);
    
    // Check if user exists, is not already confirmed, and token matches
    if (!user || user.confirmed || user.confirmToken !== token) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'InvalidRequestError',
          message: 'Invalid or expired confirmation token',
        }),
      };
    }

    // Confirm the user's email
    await userService.confirmUser(email);

    // Redirect to success page
    return {
      statusCode: 302,
      headers: {
        Location: `${process.env.FRONTEND_URL}/login?confirmed=true`,
      },
      body: '',
    };
  } catch (error) {
    console.error('Confirmation error:', error);
    
    if (error.isJoi) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'ValidationError',
          message: 'Invalid request parameters',
        }),
      };
    }

    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({
        error: error.name || 'InternalServerError',
        message: 'An error occurred while confirming your email',
      }),
    };
  }
};
