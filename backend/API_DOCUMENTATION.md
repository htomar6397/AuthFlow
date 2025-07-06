# AuthFlow API Documentation

> **Base URL:** `http://localhost:5000/api`  
> **Content Type:** `application/json`  
> **Authentication:**
>
> - JWT Bearer Token (Authorization header)
> - Refresh Token (HTTP-only cookie)
> - Google OAuth

## Table of Contents

- [Authentication Endpoints](#authentication-endpoints)
- [User Endpoints](#user-endpoints)
- [Request Validation](#request-validation)
- [Error Handling](#error-handling)
- [Response Format](#response-format)

---

## Authentication Endpoints

### 1. Register User

**Endpoint:** `POST /auth/register`  
**Authentication:** Not required  
**Rate Limit:** 5 requests per hour

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "OTP sent to email"
}
```

### 2. Login

**Endpoint:** `POST /auth/login`  
**Authentication:** Not required  
**Rate Limit:** 20 requests per 15 minutes

**Request Body:**

```json
{
  "identifier": "user@example.com or username",
  "password": "password123"
}
```

**Successful Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "accessToken": "jwt.token.here",
    "user": {
      "email": "user@example.com",
      "isEmailVerified": false
    }
  },
  "message": "Login successful. Please verify your email."
}
```

### 3. Verify OTP

**Endpoint:** `POST /auth/verify-otp`  
**Authentication:** Not required  
**Rate Limit:** 5 attempts per hour (1-hour block on exceeding)

**Request Body:**

```json
{
  "otp": "123456"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "accessToken": "new.jwt.token.here"
  },
  "message": "Email verified successfully"
}
```

### 4. Resend OTP

**Endpoint:** `GET /auth/resend-otp`  
**Authentication:** Not required, but requires valid JWT token  
**Rate Limit:** 3 attempts per hour (1-hour block on exceeding)

**Response (200 OK):**

```json
{
  "success": true,
  "message": "OTP sent to email"
}
```

### 5. Forgot Password

**Endpoint:** `POST /auth/forgot-password`  
**Authentication:** Not required  
**Rate Limit:** 5 requests per hour

**Request Body:**

```json
{
  "identifier": "user@example.com or username"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Password reset OTP sent to email"
}
```

### 6. Google OAuth

**Endpoint:** `GET /auth/google`  
**Authentication:** Not required

Initiates Google OAuth flow. Redirects to Google's consent screen.

### 7. Google OAuth Callback

**Endpoint:** `GET /auth/google/callback`  
**Authentication:** Not required

Handles the OAuth callback from Google. Not meant to be called directly.

### 8. Check Username Availability

**Endpoint:** `GET /auth/check-username?username=desired`  
**Authentication:** Not required  
**Rate Limit:** 30 requests per minute

**Response (200 OK):**

```json
{
  "success": true,
  "available": true
}
```

### 9. Refresh Token

**Endpoint:** `GET /auth/refresh-token`  
**Authentication:** Refresh token in HTTP-only cookie  
**Rate Limit:** 100 requests per 15 minutes (default limit)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "accessToken": "new.jwt.token.here"
  }
}
```

### 10. Logout

**Endpoint:** `POST /auth/logout`  
**Authentication:** Required (Bearer token)  
**Rate Limit:** 100 requests per 15 minutes (default limit)

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## User Endpoints

### 1. Get Current User

**Endpoint:** `GET /users/profile`  
**Authentication:** Required (Bearer token)  
**Rate Limit:** 100 requests per 15 minutes (default limit)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "email": "user@example.com",
    "username": "username",
    "name": "User Name",
    "bio": "User bio",
    "isEmailVerified": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### 2. Complete Profile

**Endpoint:** `POST /users/complete-profile`  
**Authentication:** Required (Bearer token) + Email must be verified  
**Rate Limit:** 100 requests per 15 minutes (default limit)

**Request Body:**

```json
{
  "username": "username",
  "name": "User Name"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "username": "username",
    "name": "User Name",
    "email": "user@example.com",
    "isEmailVerified": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "message": "Profile completed successfully"
}
```

### 3. Update Profile

**Endpoint:** `POST /users/update-profile`  
**Authentication:** Required (Bearer token) + Profile must be completed  
**Rate Limit:** 100 requests per 15 minutes (default limit)

**Request Body (at least one field required):**

```json
{
  "name": "Updated Name",
  "bio": "Updated bio",
  "username": "newusername"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "email": "user@example.com",
    "username": "newusername",
    "name": "Updated Name",
    "bio": "Updated bio",
    "isEmailVerified": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "message": "Profile updated successfully"
}
```

### 4. Change Password

**Endpoint:** `POST /users/change-password`  
**Authentication:** Required (Bearer token) + Profile must be completed  
**Rate Limit:** 100 requests per 15 minutes (default limit)

**Request Body:**

```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### 5. Delete Account

**Endpoint:** `DELETE /users/delete-account`  
**Authentication:** Required (Bearer token) + Profile must be completed  
**Rate Limit:** 100 requests per 15 minutes (default limit)

**Request Body:**

```json
{
  "password": "currentPassword123"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

## Request Validation

### Register

- `email`: Valid email address
- `password`: Minimum 8 characters

### Login

- `identifier`: Email or username (required)
- `password`: Required

### Complete Profile

- `username`: Minimum 3 characters, alphanumeric + underscore only
- `name`: Minimum 2 characters

### Change Password

- `currentPassword`: Current password
- `newPassword`: Minimum 8 characters

### Verify OTP

- `otp`: Exactly 6 digits

## Rate Limiting

### Rate Limit Headers

All rate-limited responses include the following headers:

- `X-RateLimit-Limit`: Maximum number of requests allowed in the time window
- `X-RateLimit-Remaining`: Number of requests remaining in the current window
- `X-RateLimit-Reset`: Timestamp when the rate limit will reset
- `Retry-After`: Time to wait before making another request (in minutes, only when rate limited)

### Rate Limited Response (429)

When a rate limit is exceeded, the API will respond with a 429 status code and the following format:

```json
{
  "success": false,
  "message": "Rate limit exceeded message",
  "error": "Error details"
}
```

## Error Handling

### Error Response Format:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Error details"
}
```

### Common Status Codes:

- 400: Bad Request (validation errors, missing fields)
- 401: Unauthorized (invalid or missing token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (user not found)
- 409: Conflict (duplicate email/username)
- 429: Too Many Requests (rate limiting, account locked)
- 500: Internal Server Error

### Example Error Responses:

**Validation Error (400):**

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters"
  }
}
```

**Account Locked (429):**

```json
{
  "success": false,
  "message": "Account temporarily locked. Try again in 30 minutes.",
  "error": "Too many failed login attempts"
}
```
