# AuthFlow Backend

A secure and robust authentication system with email verification, OTP-based login, and profile management, built with Node.js, Express, and MongoDB.

## Features

- 🔐 JWT-based authentication with access & refresh tokens
- ✉️ Email verification with OTP
- 🔄 Password reset functionality
- 🔑 Google OAuth 2.0 integration
- 🛡️ Rate limiting and brute-force protection
- 📝 User profile management
- 🔄 Token rotation and revocation
- 🚀 Serverless deployment ready

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT, Google OAuth 2.0
- **Email:** Nodemailer
- **Rate Limiting:** rate-limiter-flexible
- **Caching:** Redis
- **API Documentation:** OpenAPI (Swagger)
- **Linting & Formatting:** ESLint, Prettier
- **Testing:** Jest, Supertest

## Prerequisites

- Node.js 18 or higher
- MongoDB 6.0 or higher
- Redis 7.0 or higher (for rate limiting)
- SMTP server credentials (or use a service like SendGrid, Mailtrap, etc.)

## Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/AuthFlow.git
   cd AuthFlow/backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory and add the required environment variables (see [Environment Variables](#environment-variables) section).

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The server will start at `http://localhost:5000`

## Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/authflow

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRES_IN=7d

# Email (Example using Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_specific_password
SMTP_FROM=your_email@gmail.com

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Redis (for rate limiting)
REDIS_URL=redis://localhost:6379

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000 # 15 minutes

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

## API Documentation

For detailed API documentation, please refer to the [API_DOCUMENTATION.md](API_DOCUMENTATION.md) file.

### Base URL

```
http://localhost:5000/api
```

### Authentication

All protected routes require a valid JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Available Scripts

- `npm run dev` - Start the development server with hot-reload
- `npm run build` - Build the TypeScript project
- `npm start` - Start the production server
- `npm run deploy` - Deploy to serverless environment
- `npm run deploy:prod` - Deploy to serverless environment
- `npm run offline` - Run serverless offline for local development
- `npm run format` - Format code with Prettier

## Deployment

### Prerequisites

- AWS CLI configured with appropriate credentials
- Serverless Framework installed globally

### Steps

1. Install dependencies:

   ```bash
   npm install
   ```

2. Deploy to AWS Lambda:
   ```bash
   npm run deploy:prod  
   ```

## Security Best Practices

- Always use HTTPS in production
- Keep your dependencies up to date
- Use strong, unique secrets for JWT and other sensitive data
- Implement proper CORS policies
- Use environment variables for all sensitive configuration
- Regularly rotate your secrets and keys

## Troubleshooting

- **MongoDB connection issues**: Ensure MongoDB is running and the connection string is correct
- **Email delivery problems**: Check your SMTP credentials and ensure your email service allows less secure apps
- **Rate limiting**: If you hit rate limits, adjust the rate limiting configuration in `.env`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [JWT](https://jwt.io/)
- [Nodemailer](https://nodemailer.com/about/)

## Contact

Developed by **Mayank Tomar**

- **LinkedIn:** [mayank-tomar-10a049233](https://www.linkedin.com/in/mayank-tomar-10a049233/)
- **Twitter:** [@MayankToma63512](https://twitter.com/MayankToma63512)

---

## System Analysis and Design

This project is a well-architected and secure authentication service. It's built with a clear separation of concerns and includes multiple layers of security, making it suitable for a production environment.

### Architectural Pattern

The application follows a classic, service-oriented architecture to ensure the codebase is modular, scalable, and easy to maintain:

- **Routes (`/routes`):** Define the API endpoints and link them to the appropriate middleware and controllers.
- **Middleware (`/middleware`):** Handle cross-cutting concerns like authentication, rate limiting, input validation, and application-specific flow control.
- **Controllers (`/controller`):** Orchestrate the business logic by validating input, calling services, and formatting the final API response.
- **Services (`/services`):** Contain the core, reusable business logic (e.g., creating JWTs, sending emails), keeping the controllers lean.
- **Models (`/models`):** Define the database schemas using Mongoose, ensuring data consistency at the database level.

### Security Deep Dive

Security is a core feature, with several mechanisms working in concert to protect the application and its users:

- **Rate Limiting & Brute-Force Protection:** The API uses `rate-limiter-flexible` to apply strict, IP-based rate limits to sensitive endpoints. This is the first line of defense against automated attacks and API abuse. The current implementation is in-memory; for a multi-server deployment, this should be migrated to a distributed store like Redis.

  | Endpoint Category          | Rate Limit            | Description                                     |
  | :------------------------- | :-------------------- | :---------------------------------------------- |
  | General Auth (`/api/auth`) | 20 requests / 15 min  | Protects against general auth-related abuse.    |
  | Account Creation           | 5 requests / hour     | Prevents mass account creation.                 |
  | Password Reset             | 5 requests / hour     | Prevents email spam for password resets.        |
  | Verify OTP                 | 5 requests / hour     | Protects against OTP brute-force attacks.       |
  | Resend OTP                 | 3 requests / hour     | Prevents email flooding for OTP requests.       |
  | Username Check             | 30 requests / 1 min   | Allows for quick username availability checks.  |
  | Default (All Other APIs)   | 100 requests / 15 min | General API rate limit for authenticated users. |

- **Account Lockout:** As a secondary defense against brute-force attacks, user accounts are temporarily locked for 30 minutes after 5 consecutive failed login attempts.

- **Secure Authentication Flow:**
  - **JWT Strategy:** The system uses short-lived access tokens (15m) and long-lived refresh tokens (7d).
  - **Refresh Token Rotation:** Each time a refresh token is used, it is invalidated and a new one is issued. This helps detect token theft and enhances security.
  - **Secure Cookie Storage:** Refresh tokens are stored in `httpOnly` cookies, which prevents them from being accessed by client-side JavaScript and mitigates the risk of XSS attacks.

- **Data & Password Security:**
  - **Input Validation:** All incoming data is validated and sanitized using `express-validator` to prevent common vulnerabilities like XSS and injection attacks.
  - **Password Hashing:** User passwords are never stored in plaintext. They are securely hashed using `bcrypt`, the industry-standard algorithm for password storage.

### Developer Experience & Robustness

- **Centralized Error Handling:** A global error handler (`globalErrorHandler`) and a custom `AppError` class ensure that all errors are handled gracefully and returned in a consistent JSON format.
- **Consistent API Responses:** A standardized response format for both success (`sendSuccess`) and error messages simplifies client-side integration and improves the developer experience.

## API Endpoints Overview

| Endpoint                     | Method | Description                                  |
| :--------------------------- | :----- | :------------------------------------------- |
| `/api/auth/register`         | `POST` | Creates a new user account.                  |
| `/api/auth/login`            | `POST` | Authenticates a user and returns a JWT.      |
| `/api/auth/verify-otp`       | `POST` | Verifies a user's email with an OTP.         |
| `/api/auth/resend-otp`       | `GET`  | Resends the OTP to the user's email address. |
| `/api/auth/forgot-password`  | `POST` | Sends a password reset email.                |
| `/api/auth/refresh-token`    | `GET`  | Issues a new access token.                   |
| `/api/auth/check-username`   | `GET`  | Checks if a username is already in use.      |
| `/api/auth/logout`           | `POST` | Logs the user out.                           |
| `/api/user/profile`          | `GET`  | Retrieves the authenticated user's profile.  |
| `/api/user/complete-profile` | `POST` | Completes the profile for a new user.        |
| `/api/user/update-profile`   | `POST` | Updates the authenticated user's profile.    |
| `/api/user/change-password`  | `POST` | Changes the authenticated user's password.   |

For a detailed guide to all API endpoints, including request formats, validation rules, and all possible success and error responses, please see the [**Full API Documentation**](./API_DOCUMENTATION.md).

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + OTP
- **Validation**: `express-validator`
- **Email**: MailerSend integration
- **Security**: `bcrypt`, `rate-limiter-flexible`

## Installation

1.  Clone the repository

    ```bash
    git clone <repository-url>
    cd authflow/backend
    ```

2.  Install dependencies

    ```bash
    npm install
    ```

3.  Set up environment variables

    ```bash
    cp .env.example .env
    # Edit .env with your configuration
    ```

4.  Start the development server

    ```bash
    npm run dev
    ```
    or
    ```bash
    serverless offline start
    ```   

5.  Deploy the application
    ```bash
    npm run deploy:prod
    ```

## Contributing

1.  Fork the repository
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email htomar6397@gmail.com or open an issue in the repository.
