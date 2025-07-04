# AuthFlow Backend

A secure authentication system with email verification, OTP-based login, and profile management built with Node.js, Express, and MongoDB.

## Features

- 🔐 JWT-based authentication
- ✉️ Email verification with OTP
- 🔄 Refresh token rotation
- 🛡️ Rate limiting and security middleware
- 📝 User profile management
- 📱 RESTful API design

## Rate Limiting

The API implements per-IP rate limiting to prevent abuse and ensure fair usage. The limits are applied as follows:

| Endpoint                   | Rate Limit           | Description                                    |
|----------------------------|----------------------|------------------------------------------------|
| `/api/auth/register`       | 5 requests/hour      | Prevents account enumeration                   |
| `/api/auth/login`          | 10 requests/15 min   | Protects against brute force attacks           |
| `/api/auth/forgot-password`| 3 requests/hour      | Prevents email spam                            |
| `/api/auth/verify-otp`     | 5 requests/15 min    | Protects against OTP brute force               |
| `/api/auth/resend-otp`     | 3 requests/hour      | Prevents email flooding                        |
| All other endpoints        | 100 requests/15 min  | General API rate limit                         |

### Rate Limit Headers
Responses include the following headers to help clients manage rate limits:

- `X-RateLimit-Limit`: Maximum requests allowed in the time window
- `X-RateLimit-Remaining`: Remaining requests in the current window
- `X-RateLimit-Reset`: Timestamp when the limit resets (UTC)
- `Retry-After`: Seconds until the limit resets (when rate limited)

### Rate Limit Response
When a rate limit is exceeded, the API responds with:

```json
{
  "status": "error",
  "message": "Too many requests, please try again later",
  "retryAfter": 300,
  "retryAfterFormatted": "5 minutes"
}
```

### Implementation Details
- Uses `rate-limiter-flexible` for efficient in-memory rate limiting
- Each IP gets its own rate limit counter
- Rate limiters are automatically cleaned up after 1 hour of inactivity
- The system tracks both successful and failed requests

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + OTP
- **Email**: MailerSend integration
- **Security**: bcrypt, rate limiting, input validation

## Project Structure

```
backend/
├── config/           # Configuration files
├── controller/       # Route controllers
├── middleware/       # Custom middleware
├── models/           # Database models
├── routes/           # Route definitions
├── services/         # Business logic
└── utils/            # Utility functions
```

## API Endpoints

### Authentication

#### 1. Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123!"
}
```

**Response (Success - 201 Created)**
```json
{
  "status": "success",
  "message": "Registration successful. Please verify your email.",
  "data": {
    "userId": "507f1f77bcf86cd799439011"
  }
}
```

#### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123!"
}
```

**Response (Success - 200 OK)**
```json
{
  "status": "success",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "507f1f77bcf86cd799439011",
  "user": {
    "username": "johndoe",
    "name": "John Doe",
    "email": "user@example.com",
    "isEmailVerified": true
  }
}
```

#### 3. Check Username Availability
```http
GET /api/auth/check-username?username=desired_username
```

**Response (Success - 200 OK)**
```json
{
  "status": "success",
  "available": true,
  "message": "Username is available"
}
```

#### 4. Refresh Access Token
```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "refresh-token-here"
}
```

**Response (Success - 200 OK)**
```json
{
  "status": "success",
  "accessToken": "new-access-token-here"
}
```

#### 5. Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response (Success - 200 OK)**
```json
{
  "status": "success",
  "message": "Password reset email sent"
}
```

#### 6. Logout
```http
POST /api/auth/logout
Authorization: Bearer <access-token>
```

**Response (Success - 200 OK)**
```json
{
  "status": "success",
  "message": "Successfully logged out"
}
```

#### 7. Verify OTP
```http
POST /api/auth/verify-otp
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "otp": "123456"
}
```

**Response (Success - 200 OK)**
```json
{
  "status": "success",
  "message": "Email verified successfully"
}
```

#### 8. Resend OTP
```http
POST /api/auth/resend-otp
Authorization: Bearer <access-token>
```

**Response (Success - 200 OK)**
```json
{
  "status": "success",
  "message": "OTP has been resent to your email"
}
```

### User Profile

#### 1. Complete Profile
```http
POST /api/user/complete-profile
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "username": "johndoe",
  "name": "John Doe",
  "bio": "I'm a developer"
}
```

**Response (Success - 200 OK)**
```json
{
  "status": "success",
  "message": "Profile completed successfully",
  "user": {
    "username": "johndoe",
    "name": "John Doe",
    "bio": "I'm a developer"
  }
}
```

#### 2. Get User Profile
```http
GET /api/user/profile
Authorization: Bearer <access-token>
```

**Response (Success - 200 OK)**
```json
{
  "status": "success",
  "data": {
    "username": "johndoe",
    "name": "John Doe",
    "email": "user@example.com",
    "bio": "I'm a developer",
    "isEmailVerified": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### 3. Update Profile
```http
POST /api/user/update-profile
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "name": "John Updated",
  "bio": "Updated bio",
  "password": "newSecurePassword123!"
}
```

**Response (Success - 200 OK)**
```json
{
  "status": "success",
  "message": "Profile updated successfully"
}
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/authflow

# JWT
JWT_SECRET=your-secret-key
JWT_ACCESS_EXPIRES_IN=15m
REFRESH_EXPIRES_DAYS=7

# OTP
OTP_ATTEMPTS=3
OTP_EXPIRY_MINUTES=10

# Email
MAILER_SEND_API_KEY=your-mailersend-api-key
APP_NAME=AuthFlow
```

## Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd authflow/backend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm test` - Run tests
- `npm run lint` - Run linter

### Dependencies

- express: ^4.18.2
- mongoose: ^7.0.0
- jsonwebtoken: ^9.0.0
- bcryptjs: ^2.4.3
- dotenv: ^16.0.3
- rate-limiter-flexible: ^2.4.1
- nodemailer: ^6.9.1

## Security

- Password hashing with bcrypt
- JWT token rotation
- Rate limiting
- Input validation
- Secure headers
- CSRF protection

## Error Handling

All error responses follow this format:

```json
{
  "status": "error",
  "message": "Error description"
}
```

### Common Error Responses

| Status Code | Description                  |
|-------------|------------------------------|
| 400         | Bad Request                  |
| 401         | Unauthorized                 |
| 403         | Forbidden                    |
| 404         | Not Found                    |
| 429         | Too Many Requests            |
| 500         | Internal Server Error        |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@example.com or open an issue in the repository.
