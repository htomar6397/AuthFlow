# AuthFlow API Documentation

This document provides a comprehensive and detailed overview of all AuthFlow API endpoints. It covers request formats, validation rules, authentication requirements, and all possible success and error responses, including specific error messages and HTTP status codes.

**Base URL:** `/api`

---

## Standard Response Formats

### Success Response

All successful responses share a consistent structure:

```json
{
  "status": "success",
  "message": "A descriptive message about the successful operation.",
  "data": { ... } // The response payload, which can be an object or null
}
```

### Error Response

All error responses also follow a standardized format:

```json
{
  "status": "fail", // Used for client-side errors (e.g., validation, bad request)
  "message": "A clear description of the error."
}
```

Or for server-side errors or unhandled exceptions:

```json
{
  "status": "error", // Used for server-side errors (e.g., internal server error)
  "message": "A clear description of the error.",
  "stack": "..." // Only in development environment
}
```

### Validation Error Response

When input validation fails, the response will be a `400 Bad Request` with a specific `errors` array:

```json
{
  "errors": [
    {
      "type": "field",
      "msg": "Validation error message",
      "path": "field_name",
      "location": "body" // or "query", "params"
    }
  ]
}
```

---

## Authentication Endpoints

### 1. Register a New User

*   **Endpoint:** `POST /auth/register`
*   **Description:** Creates a new user account. Upon successful registration, an OTP is sent to the user's email for verification, and an access token is returned.
*   **Authentication:** None

#### Request Body

| Field      | Type     | Validation                               | Description                                      |
| :--------- | :------- | :--------------------------------------- | :----------------------------------------------- |
| `email`    | `String` | Required, valid email format             | The user's email address.                        |
| `password` | `String` | Required, minimum 8 characters           | The user's password.                             |

#### Responses

*   **`201 Created` (Success)**
    *   **Description:** User account created successfully, OTP sent, and access token provided.
    *   **Example JSON:**
        ```json
        {
            "status": "success",
            "message": "Registration successful. Please check your email to verify your account.",
            "data": {
                "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "user": {
                    "email": "user@example.com",
                    "isEmailVerified": false,
                    "username": null
                }
            }
        }
        ```

*   **`400 Bad Request` (Validation Error)**
    *   **Description:** Occurs when `email` or `password` do not meet validation criteria.
    *   **Example JSON:**
        ```json
        {
            "errors": [
                {
                    "type": "field",
                    "msg": "Please enter a valid email address",
                    "path": "email",
                    "location": "body"
                },
                {
                    "type": "field",
                    "msg": "Password must be at least 8 characters long",
                    "path": "password",
                    "location": "body"
                }
            ]
        }
        ```

*   **`400 Bad Request` (User Already Exists)**
    *   **Description:** Occurs when an account with the provided email already exists.
    *   **Example JSON:**
        ```json
        {
            "status": "fail",
            "message": "User with this email already exists"
        }
        ```

*   **`429 Too Many Requests` (Rate Limit Exceeded)**
    *   **Description:** Occurs when the account creation rate limit (5 requests/hour per IP) is exceeded.
    *   **Example JSON:**
        ```json
        {
            "status": "error",
            "message": "Too many requests, please slow down",
            "retryAfter": 300,
            "retryAfterFormatted": "5 minutes"
        }
        ```

### 2. User Login

*   **Endpoint:** `POST /auth/login`
*   **Description:** Authenticates a user with their email/username and password. Returns an access token and user details. May redirect to email verification or profile completion if necessary.
*   **Authentication:** None

#### Request Body

| Field        | Type     | Validation | Description                                      |
| :----------- | :------- | :--------- | :----------------------------------------------- |
| `identifier` | `String` | Required   | The user's email address or username.            |
| `password`   | `String` | Required   | The user's password.                             |

#### Responses

*   **`200 OK` (Success - Profile Complete & Email Verified)**
    *   **Description:** User successfully logged in, email is verified, and profile is complete.
    *   **Example JSON:**
        ```json
        {
            "status": "success",
            "message": "Login successful",
            "data": {
                "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "user": {
                    "username": "johndoe",
                    "name": "John Doe",
                    "bio": "I'm a developer",
                    "isEmailVerified": true,
                    "createdAt": "2023-01-01T00:00:00.000Z",
                    "updatedAt": "2023-01-01T00:00:00.000Z"
                }
            }
        }
        ```

*   **`200 OK` (Success - Email Not Verified)**
    *   **Description:** User successfully logged in, but email is not yet verified. Client should redirect to OTP verification flow.
    *   **Example JSON:**
        ```json
        {
            "status": "success",
            "message": "Login successful. Please verify your email.",
            "data": {
                "redirect": "/verify-otp",
                "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "user": {
                    "email": "user@example.com",
                    "isEmailVerified": false,
                    "username": null
                }
            }
        }
        ```

*   **`200 OK` (Success - Profile Incomplete)**
    *   **Description:** User successfully logged in, email is verified, but profile is incomplete. Client should redirect to profile completion flow.
    *   **Example JSON:**
        ```json
        {
            "status": "success",
            "message": "Login successful. Please complete your profile.",
            "data": {
                "redirect": "/complete-profile",
                "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "user": {
                    "email": "user@example.com",
                    "isEmailVerified": true,
                    "username": null
                }
            }
        }
        ```

*   **`400 Bad Request` (Validation Error)**
    *   **Description:** Occurs when `identifier` or `password` are missing or invalid.
    *   **Example JSON:**
        ```json
        {
            "errors": [
                {
                    "type": "field",
                    "msg": "Identifier is required",
                    "path": "identifier",
                    "location": "body"
                }
            ]
        }
        ```

*   **`400 Bad Request` (No Account Found)**
    *   **Description:** Occurs when no user is found with the provided identifier.
    *   **Example JSON:**
        ```json
        {
            "status": "fail",
            "message": "No account found, create an account first"
        }
        ```

*   **`400 Bad Request` (Invalid Password)**
    *   **Description:** Occurs when the provided password does not match the user's record. Includes remaining attempts before lockout.
    *   **Example JSON:**
        ```json
        {
            "status": "fail",
            "message": "Invalid password. 4 attempts remaining."
        }
        ```

*   **`429 Too Many Requests` (Account Locked)**
    *   **Description:** Occurs when an account is temporarily locked due to too many failed login attempts.
    *   **Example JSON:**
        ```json
        {
            "status": "fail",
            "message": "Account locked for 30 minutes due to too many failed attempts."
        }
        ```

*   **`429 Too Many Requests` (Rate Limit Exceeded)**
    *   **Description:** Occurs when the general authentication rate limit (20 requests/15 min per IP) is exceeded.
    *   **Example JSON:**
        ```json
        {
            "status": "error",
            "message": "Too many requests, please slow down",
            "retryAfter": 300,
            "retryAfterFormatted": "5 minutes"
        }
        ```

### 3. Verify Email with OTP

*   **Endpoint:** `POST /auth/verify-otp`
*   **Description:** Verifies a user's email address using a 6-digit One-Time Password (OTP).
*   **Authentication:** Required (Access Token)

#### Request Body

| Field | Type     | Validation                  | Description                          |
| :---- | :------- | :-------------------------- | :----------------------------------- |
| `otp` | `String` | Required, 6 digits          | The One-Time Password from the email.|

#### Responses

*   **`200 OK` (Success)**
    *   **Description:** Email successfully verified.
    *   **Example JSON:**
        ```json
        {
            "status": "success",
            "message": "Email verified successfully",
            "data": null
        }
        ```

*   **`400 Bad Request` (Validation Error)**
    *   **Description:** Occurs when `otp` is missing or not 6 digits.
    *   **Example JSON:**
        ```json
        {
            "errors": [
                {
                    "type": "field",
                    "msg": "OTP must be 6 digits",
                    "path": "otp",
                    "location": "body"
                }
            ]
        }
        ```

*   **`400 Bad Request` (Email Already Verified)**
    *   **Description:** Occurs if the user's email is already marked as verified.
    *   **Example JSON:**
        ```json
        {
            "status": "fail",
            "message": "Email is already verified"
        }
        ```

*   **`400 Bad Request` (Invalid OTP)**
    *   **Description:** Occurs when the provided OTP is incorrect. Includes remaining attempts.
    *   **Example JSON:**
        ```json
        {
            "status": "fail",
            "message": "Invalid OTP. 2 attempts remaining."
        }
        ```

*   **`400 Bad Request` (OTP Expired/Not Found)**
    *   **Description:** Occurs if the OTP has expired or was never generated for the user.
    *   **Example JSON:**
        ```json
        {
            "status": "fail",
            "message": "OTP not found or expired"
        }
        ```

*   **`400 Bad Request` (Too Many OTP Attempts)**
    *   **Description:** Occurs if too many incorrect OTP attempts have been made for the user.
    *   **Example JSON:**
        ```json
        {
            "status": "fail",
            "message": "Too many attempts. Please request a new OTP."
        }
        ```

*   **`401 Unauthorized` (Authentication Failed)**
    *   **Description:** Occurs if the access token is missing, invalid, or expired.
    *   **Example JSON:**
        ```json
        {
            "status": "error",
            "message": "You are not logged in. Please log in to get access."
        }
        ```

*   **`429 Too Many Requests` (Rate Limit Exceeded)**
    *   **Description:** Occurs when the OTP verification rate limit (5 requests/hour per IP) is exceeded.
    *   **Example JSON:**
        ```json
        {
            "status": "error",
            "message": "Too many OTP attempts, try again later",
            "retryAfter": 300,
            "retryAfterFormatted": "5 minutes"
        }
        ```

### 4. Resend OTP

*   **Endpoint:** `GET /auth/resend-otp`
*   **Description:** Requests a new OTP to be sent to the user's registered email address.
*   **Authentication:** Required (Access Token)

#### Responses

*   **`200 OK` (Success)**
    *   **Description:** New OTP successfully sent.
    *   **Example JSON:**
        ```json
        {
            "status": "success",
            "message": "OTP sent to your email",
            "data": null
        }
        ```

*   **`400 Bad Request` (Email Already Verified)**
    *   **Description:** Occurs if the user's email is already marked as verified.
    *   **Example JSON:**
        ```json
        {
            "status": "fail",
            "message": "Email is already verified"
        }
        ```

*   **`401 Unauthorized` (Authentication Failed)**
    *   **Description:** Occurs if the access token is missing, invalid, or expired.
    *   **Example JSON:**
        ```json
        {
            "status": "error",
            "message": "You are not logged in. Please log in to get access."
        }
        ```

*   **`429 Too Many Requests` (Rate Limit Exceeded)**
    *   **Description:** Occurs when the resend OTP rate limit (3 requests/hour per IP) is exceeded.
    *   **Example JSON:**
        ```json
        {
            "status": "error",
            "message": "Please wait before requesting a new OTP",
            "retryAfter": 60,
            "retryAfterFormatted": "1 minute"
        }
        ```

### 5. Forgot Password

*   **Endpoint:** `POST /auth/forgot-password`
*   **Description:** Initiates a password reset by sending a new temporary password to the user's registered email address.
*   **Authentication:** None

#### Request Body

| Field        | Type     | Validation | Description                                      |
| :----------- | :------- | :--------- | :----------------------------------------------- |
| `identifier` | `String` | Required   | The user's email address or username.            |

#### Responses

*   **`200 OK` (Success)**
    *   **Description:** A new temporary password has been sent to the user's email.
    *   **Example JSON:**
        ```json
        {
            "status": "success",
            "message": "A new password has been sent to your email address.",
            "data": null
        }
        ```

*   **`400 Bad Request` (Validation Error)**
    *   **Description:** Occurs when `identifier` is missing.
    *   **Example JSON:**
        ```json
        {
            "errors": [
                {
                    "type": "field",
                    "msg": "Identifier is required",
                    "path": "identifier",
                    "location": "body"
                }
            ]
        }
        ```

*   **`404 Not Found` (User Not Found)**
    *   **Description:** Occurs when no account is found with the provided identifier.
    *   **Example JSON:**
        ```json
        {
            "status": "fail",
            "message": "No account found with that email or username"
        }
        ```

*   **`429 Too Many Requests` (Rate Limit Exceeded)**
    *   **Description:** Occurs when the password reset rate limit (3 requests/hour per IP) is exceeded.
    *   **Example JSON:**
        ```json
        {
            "status": "error",
            "message": "Too many requests, please slow down",
            "retryAfter": 300,
            "retryAfterFormatted": "5 minutes"
        }
        ```

### 6. Refresh Access Token

*   **Endpoint:** `GET /auth/refresh-token`
*   **Description:** Issues a new access token using a valid refresh token, which is expected to be sent as an `httpOnly` cookie.
*   **Authentication:** Via Refresh Token (Cookie)

#### Responses

*   **`200 OK` (Success)**
    *   **Description:** A new access token is successfully issued.
    *   **Example JSON:**
        ```json
        {
            "status": "success",
            "message": "Success",
            "data": {
                "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            }
        }
        ```

*   **`400 Bad Request` (Refresh Token Missing)**
    *   **Description:** Occurs if the `refreshToken` cookie is not present in the request.
    *   **Example JSON:**
        ```json
        {
            "status": "fail",
            "message": "Refresh token is required"
        }
        ```

*   **`401 Unauthorized` (Invalid/Expired Refresh Token)**
    *   **Description:** Occurs if the refresh token is invalid, expired, or does not belong to an existing user.
    *   **Example JSON:**
        ```json
        {
            "status": "error",
            "message": "Invalid or expired refresh token"
        }
        ```

### 7. Check Username Availability

*   **Endpoint:** `GET /auth/check-username`
*   **Description:** Checks if a given username is available for registration.
*   **Authentication:** None

#### Query Parameters

| Field      | Type     | Validation                               | Description                                      |
| :--------- | :------- | :--------------------------------------- | :----------------------------------------------- |
| `username` | `String` | Required, 3-30 chars, alphanumeric + underscore | The username to check for availability.          |

#### Responses

*   **`200 OK` (Success - Available)**
    *   **Description:** The username is available.
    *   **Example JSON:**
        ```json
        {
            "status": "success",
            "available": true,
            "message": "Username is available"
        }
        ```

*   **`200 OK` (Success - Not Available)**
    *   **Description:** The username is already taken.
    *   **Example JSON:**
        ```json
        {
            "status": "error",
            "available": false,
            "message": "Username is already taken."
        }
        ```

*   **`400 Bad Request` (Validation Error)**
    *   **Description:** Occurs when `username` is missing or does not meet format requirements.
    *   **Example JSON:**
        ```json
        {
            "errors": [
                {
                    "type": "field",
                    "msg": "Username is required.",
                    "path": "username",
                    "location": "query"
                }
            ]
        }
        ```

*   **`429 Too Many Requests` (Rate Limit Exceeded)**
    *   **Description:** Occurs when the username check rate limit (30 requests/minute per IP) is exceeded.
    *   **Example JSON:**
        ```json
        {
            "status": "error",
            "message": "Too many username checks, wait a minute",
            "retryAfter": 60,
            "retryAfterFormatted": "1 minute"
        }
        ```

### 8. Logout

*   **Endpoint:** `POST /auth/logout`
*   **Description:** Invalidates the user's refresh token (stored in cookie) and clears the cookie, effectively logging them out.
*   **Authentication:** Required (Access Token)

#### Responses

*   **`200 OK` (Success)**
    *   **Description:** User successfully logged out. Client should redirect to login page.
    *   **Example JSON:**
        ```json
        {
            "status": "success",
            "message": "Logged out successfully",
            "data": {
                "redirect": "/login"
            }
        }
        ```

*   **`401 Unauthorized` (Authentication Failed)**
    *   **Description:** Occurs if the access token is missing, invalid, or expired.
    *   **Example JSON:**
        ```json
        {
            "status": "error",
            "message": "You are not logged in. Please log in to get access."
        }
        ```

---

## User Endpoints

### 1. Get User Profile

*   **Endpoint:** `GET /user/profile`
*   **Description:** Retrieves the profile details of the currently authenticated user.
*   **Authentication:** Required (Access Token)

#### Responses

*   **`200 OK` (Success)**
    *   **Description:** User profile data successfully retrieved.
    *   **Example JSON:**
        ```json
        {
            "status": "success",
            "message": "Success",
            "data": {
                "email": "user@example.com",
                "username": "johndoe",
                "name": "John Doe",
                "bio": "I'm a developer",
                "isEmailVerified": true,
                "createdAt": "2023-01-01T00:00:00.000Z",
                "updatedAt": "2023-01-01T00:00:00.000Z"
            }
        }
        ```

*   **`400 Bad Request` (User Not Found)**
    *   **Description:** Occurs if the authenticated user's record cannot be found in the database.
    *   **Example JSON:**
        ```json
        {
            "status": "fail",
            "message": "User not found"
        }
        ```

*   **`401 Unauthorized` (Authentication Failed)**
    *   **Description:** Occurs if the access token is missing, invalid, or expired.
    *   **Example JSON:**
        ```json
        {
            "status": "error",
            "message": "You are not logged in. Please log in to get access."
        }
        ```

### 2. Complete User Profile

*   **Endpoint:** `POST /user/complete-profile`
*   **Description:** Allows a newly registered user (or one without a username) to set their `username`, `name`, and optionally `bio` for the first time. Requires email verification.
*   **Authentication:** Required (Access Token)

#### Request Body

| Field      | Type     | Validation                               | Description                                      |
| :--------- | :------- | :--------------------------------------- | :----------------------------------------------- |
| `username` | `String` | Required, 3-30 chars, alphanumeric + underscore | The desired username for the user.               |
| `name`     | `String` | Required, min: 2 characters              | The full name of the user.                       |
| `bio`      | `String` | Optional, max: 500 characters            | A short biography for the user.                  |

#### Responses

*   **`200 OK` (Success)**
    *   **Description:** User profile successfully completed.
    *   **Example JSON:**
        ```json
        {
            "status": "success",
            "message": "Profile completed successfully",
            "data": {
                "user": {
                    "username": "johndoe",
                    "name": "John Doe",
                    "email": "user@example.com",
                    "bio": "I'm a developer",
                    "isEmailVerified": true,
                    "createdAt": "2023-01-01T00:00:00.000Z",
                    "updatedAt": "2023-01-01T00:00:00.000Z"
                }
            }
        }
        ```

*   **`400 Bad Request` (Validation Error)**
    *   **Description:** Occurs when `username` or `name` are missing or invalid.
    *   **Example JSON:**
        ```json
        {
            "errors": [
                {
                    "type": "field",
                    "msg": "Username must be at least 3 characters long",
                    "path": "username",
                    "location": "body"
                }
            ]
        }
        ```

*   **`401 Unauthorized` (Authentication Failed)**
    *   **Description:** Occurs if the access token is missing, invalid, or expired.
    *   **Example JSON:**
        ```json
        {
            "status": "error",
            "message": "You are not logged in. Please log in to get access."
        }
        ```

*   **`403 Forbidden` (Email Not Verified)**
    *   **Description:** Occurs if the user's email is not verified, preventing profile completion.
    *   **Example JSON:**
        ```json
        {
            "status": "error",
            "redirect": "/verify-email",
            "message": "Email is not verified. Please verify your email first."
        }
        ```

### 3. Update User Profile

*   **Endpoint:** `POST /user/update-profile`
*   **Description:** Allows an authenticated user to update their `name` and/or `bio`.
*   **Authentication:** Required (Access Token)

#### Request Body

| Field  | Type     | Validation                     | Description                                      |
| :----- | :------- | :----------------------------- | :----------------------------------------------- |
| `name` | `String` | Optional, min: 2 characters    | The updated full name of the user.               |
| `bio`  | `String` | Optional, max: 500 characters  | The updated biography for the user.              |

#### Responses

*   **`200 OK` (Success)**
    *   **Description:** User profile successfully updated.
    *   **Example JSON:**
        ```json
        {
            "status": "success",
            "message": "Profile updated successfully",
            "data": {
                "user": {
                    "username": "johndoe",
                    "name": "Updated Name",
                    "email": "user@example.com",
                    "bio": "An updated bio.",
                    "isEmailVerified": true,
                    "createdAt": "2023-01-01T00:00:00.000Z",
                    "updatedAt": "2023-01-01T00:00:00.000Z"
                }
            }
        }
        ```

*   **`400 Bad Request` (No Fields Provided)**
    *   **Description:** Occurs if neither `name` nor `bio` are provided in the request body.
    *   **Example JSON:**
        ```json
        {
            "status": "fail",
            "message": "name or bio is required"
        }
        ```

*   **`401 Unauthorized` (Authentication Failed)**
    *   **Description:** Occurs if the access token is missing, invalid, or expired.
    *   **Example JSON:**
        ```json
        {
            "status": "error",
            "message": "You are not logged in. Please log in to get access."
        }
        ```

*   **`403 Forbidden` (Profile Incomplete)**
    *   **Description:** Occurs if the user has not completed their profile (i.e., set a username).
    *   **Example JSON:**
        ```json
        {
            "status": "error",
            "redirect": "/complete-profile",
            "message": "Profile is incomplete. Please complete your profile."
        }
        ```

### 4. Change Password

*   **Endpoint:** `POST /user/change-password`
*   **Description:** Allows an authenticated user to change their password. Requires the current password and a new password.
*   **Authentication:** Required (Access Token)

#### Request Body

| Field         | Type     | Validation                     | Description                                      |
| :------------ | :------- | :----------------------------- | :----------------------------------------------- |
| `password`    | `String` | Required, min: 8 characters    | The user's current password.                     |
| `newPassword` | `String` | Required, min: 8 characters    | The user's new desired password.                 |

#### Responses

*   **`200 OK` (Success)**
    *   **Description:** Password successfully changed.
    *   **Example JSON:**
        ```json
        {
            "status": "success",
            "message": "Password changed successfully",
            "data": null
        }
        ```

*   **`400 Bad Request` (Validation Error)**
    *   **Description:** Occurs when `password` or `newPassword` are missing or do not meet length requirements.
    *   **Example JSON:**
        ```json
        {
            "errors": [
                {
                    "type": "field",
                    "msg": "Password must be at least 8 characters long",
                    "path": "password",
                    "location": "body"
                }
            ]
        }
        ```

*   **`400 Bad Request` (Invalid Current Password)**
    *   **Description:** Occurs if the provided current password does not match the user's record.
    *   **Example JSON:**
        ```json
        {
            "status": "fail",
            "message": "Invalid password"
        }
        ```

*   **`401 Unauthorized` (Authentication Failed)**
    *   **Description:** Occurs if the access token is missing, invalid, or expired.
    *   **Example JSON:**
        ```json
        {
            "status": "error",
            "message": "You are not logged in. Please log in to get access."
        }
        ```

*   **`403 Forbidden` (Profile Incomplete)**
    *   **Description:** Occurs if the user has not completed their profile (i.e., set a username).
    *   **Example JSON:**
        ```json
        {
            "status": "error",
            "redirect": "/complete-profile",
            "message": "Profile is incomplete. Please complete your profile."
        }
        ```
