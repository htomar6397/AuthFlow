# AuthFlow Server

A secure authentication system with email verification and password reset functionality, built with Node.js, Express, and AWS services (DynamoDB, SES).

## Features

- User registration with email confirmation
- Login with email/username and password
- JWT-based authentication
- Password reset flow with temporary passwords
- Secure password hashing with bcrypt
- Input validation with Joi
- RESTful API design
- CORS support
- Environment-based configuration

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- AWS Account (for DynamoDB and SES)
- AWS CLI configured with appropriate credentials

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   cd server
   npm install
   ```
3. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
4. Update the `.env` file with your configuration

## Local Development

To run the server locally:

```bash
# Start the server with hot-reload
npm run dev

# Start the server in production mode
npm start
```

## Environment Variables

See `.env.example` for all available environment variables.

## API Endpoints

### POST /users
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "name": "John Doe",
  "bio": "Software Developer",
  "password": "SecurePassword123!"
}
```

### GET /users/confirm?email=user@example.com&token=abc123
Confirm a user's email address.

### POST /auth/login
Login with email/username and password.

**Request Body:**
```json
{
  "identifier": "user@example.com", // or "johndoe"
  "password": "SecurePassword123!"
}
```

### POST /auth/forgot-password
Request a password reset.

**Request Body:**
```json
{
  "identifier": "user@example.com" // or "johndoe"
}
```

### GET /auth/me
Get the current user's profile (requires authentication).

## Deployment

### Prerequisites
- AWS Account
- Serverless Framework installed globally (`npm install -g serverless`)

### Steps
1. Deploy the application:
   ```bash
   serverless deploy --stage production
   ```

2. The deployment will output the API Gateway endpoints.

## Testing

Run tests with:
```bash
npm test
```

## Security Considerations

- Always use HTTPS in production
- Keep your JWT_SECRET secure and never commit it to version control
- Implement rate limiting in production
- Use strong password policies
- Keep dependencies up to date

## License

MIT
