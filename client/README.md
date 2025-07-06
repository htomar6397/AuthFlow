# AuthFlow - Modern Authentication Frontend

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-4.4.0-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.0-06B6D4?logo=tailwind-css)](https://tailwindcss.com/)

A modern, responsive authentication frontend built with React, TypeScript, and Vite. This application provides a complete authentication flow including login, registration, password reset, and email verification.

## ✨ Features

- 🔐 JWT-based authentication with refresh tokens
- 📱 Fully responsive design
- 🎨 Themed with dark/light mode support
- ⚡ Built with Vite for fast development and production builds
- 🛡️ Secure authentication flow with form validation
- 🔄 Token refresh mechanism
- ✉️ Email verification
- 🔄 Password reset functionality
- 🔍 Form validation with Zod
- 🎭 Role-based access control (RBAC)
- 🚀 Optimized production builds

## 📦 Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn
- Backend API (See [Backend Setup](#-backend-setup))

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/authflow-frontend.git
   cd authflow-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   VITE_GOOGLE_OAUTH_CLIENT_ID=your-google-oauth-client-id
   VITE_APP_NAME=AuthFlow
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Build for production**
   ```bash
   npm run build
   # or
   yarn build
   ```

## 🏗️ Project Structure

```
src/
├── api/               # API service layer
├── assets/            # Static assets
├── components/        # Reusable UI components
│   ├── auth/         # Authentication components
│   ├── layout/       # Layout components
│   └── ui/           # Base UI components
├── config/           # Application configuration
├── contexts/         # React contexts
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
├── pages/            # Page components
│   ├── auth/        # Authentication pages
│   └── dashboard/   # Authenticated pages
├── routes/          # Application routes
├── stores/          # State management
├── styles/          # Global styles
└── types/           # TypeScript type definitions
```

## 🔧 Backend Setup

This frontend requires a backend API to function. The backend should implement the following endpoints:

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh-token` - Refresh access token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password
- `POST /auth/verify-email` - Verify email address
- `GET /auth/me` - Get current user profile
- `PUT /auth/profile` - Update user profile

## 🛠️ Built With

- [React](https://reactjs.org/) - JavaScript library for building user interfaces
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling
- [React Router](https://reactrouter.com/) - Declarative routing for React
- [Zod](https://zod.dev/) - TypeScript-first schema validation
- [TanStack Query](https://tanstack.com/query) - Data fetching and state management
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components
- [React Hook Form](https://react-hook-form.com/) - Form state management
- [Sonner](https://sonner.emilkowal.ski/) - Toast notifications

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Vite](https://vitejs.dev/) for the amazing development experience
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- All the amazing open-source libraries used in this project
