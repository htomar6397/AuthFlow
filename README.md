# 🔐 AuthFlow - Full-Stack Authentication Solution

[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.18.2-000000?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?logo=mongodb)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A secure authentication system built with the MERN stack (MongoDB, Express, React, Node.js) and TypeScript. This project provides user registration, login, email verification, and password reset functionality.

## 🌟 Features

### Backend
- 🛡️ JWT-based authentication with access & refresh tokens
- 🔄 Token refresh mechanism
- ✉️ Email verification with OTP
- 🔄 Password reset functionality
- 🔒 Security middleware for protected routes
- 🚀 RESTful API design
- 📝 Comprehensive API documentation (see [API Documentation](server/API_DOCUMENTATION.md))
- 🛠️ Serverless deployment ready

### Frontend
- 📱 Responsive design with mobile support
- 🎨 Clean and modern UI components
- ⚡ Fast loading with Vite
- 🔄 State management with Zustand
- 📝 Form handling with React Hook Form
- 🔐 Protected routes and authentication flow
- 🌐 Google OAuth integration

## 🏗️ Project Structure

```
AuthFlow/
├── server/                  # Backend server (Node.js + Express + TypeScript)
│   ├── config/             # Configuration files
│   ├── controller/         # Request handlers
│   ├── middleware/         # Express middleware
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── utils/              # Utility functions
│   ├── server.ts           # Express application entry point
│   ├── serverless.yml      # Serverless configuration
│   └── package.json
│
├── client/                 # Frontend application (React + TypeScript)
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── api/          # API service layer
│   │   ├── assets/       # Static assets
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # React contexts
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions
│   │   ├── pages/        # Page components
│   │   ├── stores/       # Zustand stores
│   │   ├── App.tsx       # Main application component
│   │   └── main.tsx      # Application entry point
│   └── package.json
│
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/AuthFlow.git
   cd AuthFlow
   ```

2. **Set up the backend**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up the frontend**
   ```bash
   cd ../client
   npm install
   cp .env.example .env
   # Edit .env with your API URL (default: http://localhost:3000/api)
   ```

4. **Start the development servers**
   ```bash
   # In the server directory
   npm run dev
   
   # In a new terminal, in the client directory
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - API Base URL: http://localhost:3000/api

## 🔧 Environment Variables

### Backend (`.env` in `server/`)
```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/authflow

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email (for OTP and password reset)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_email_password
SMTP_FROM=no-reply@authflow.com

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173
```

### Frontend (`.env` in `client/`)
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api

# Google OAuth
VITE_GOOGLE_OAUTH_CLIENT_ID=your-google-oauth-client-id

# App Configuration
VITE_APP_NAME=AuthFlow
```

## 📚 Documentation

### Backend API
- [API Documentation](server/API_DOCUMENTATION.md) - Complete API reference with request/response examples
- [Backend README](server/README.md) - Detailed backend setup and configuration

### Frontend
- [Frontend README](client/README.md) - Frontend setup and development guide

## 🛠️ Built With

### Backend
- [Node.js](https://nodejs.org/) - JavaScript runtime
- [Express](https://expressjs.com/) - Web framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Mongoose](https://mongoosejs.com/) - MongoDB object modeling
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [JWT](https://jwt.io/) - JSON Web Tokens
- [Nodemailer](https://nodemailer.com/) - Email sending
- [Serverless](https://www.serverless.com/) - Serverless deployment

### Frontend
- [React](https://reactjs.org/) - UI library
- [Vite](https://vitejs.dev/) - Build tool
- [React Router](https://reactrouter.com/) - Routing
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [React Hook Form](https://react-hook-form.com/) - Form handling
- [Zod](https://zod.dev/) - Schema validation
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Sonner](https://sonner.emilkowal.ski/) - Toast notifications

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Vite](https://vitejs.dev/) for the amazing development experience
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- All the amazing open-source libraries used in this project
