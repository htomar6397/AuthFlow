// src/routes.tsx
import React, { lazy, Suspense } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';


// Lazy-loaded pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage').then(m => ({ default: m.VerifyEmailPage })));
const CompleteProfilePage = lazy(() => import('@/pages/auth/CompleteProfilePage').then(m => ({ default: m.CompleteProfilePage })));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const HomePage = lazy(() => import('@/pages/user/HomePage').then(m => ({ default: m.default })));

// Suspense fallback wrapper
const withSuspense = (Component: React.ReactNode) => (
  <Suspense fallback={<LoadingSpinner />}>{Component}</Suspense>
);

// Protected route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = React.memo(({ children }) => {
  const location = useLocation();
  const { user } = useUserStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!user.isEmailVerified && location.pathname !== '/verify-email') {
    return <Navigate to="/verify-email" replace />;
  }
  if (user.isEmailVerified && !user.username && location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" replace />;
  }
  // If all checks pass, render the children
  return <>{children}</>;
});

// Public route wrapper
const PublicRoute: React.FC<{ children: React.ReactNode }> = React.memo(({ children }) => {
  const { user } = useUserStore();
   const location = useLocation();
   
  // If user is logged in, redirect based on their status
  if (user) {
    if (!user.isEmailVerified && location.pathname !== '/verify-email') {
      return <Navigate to="/verify-email" replace />;
    }
    if (user.isEmailVerified && !user.username && location.pathname !== '/complete-profile') {
      return <Navigate to="/complete-profile" replace />;
    }
    return <Navigate to="/" replace />;
  }
  
  // If no user, show the public route
  return <>{children}</>;
});

// Import the AuthLayout component from its new location
import { AuthLayoutSplit } from '@/components/layout/AuthLayoutSplit';
import OAuthCallback from './pages/auth/OAuthCallback';
import ErrorPage from './pages/ErrorPage';
import { Toaster } from './components/ui/sonner';
import useUserStore from './stores/userStore';

// Public routes that don't require initialization
export const publicNoInitRoutes = [
  {
    path: '/oauth/callback',
    element: (
      <>
        <OAuthCallback />
        <Toaster 
          position="top-right"
          toastOptions={{
            classNames: {
              description: '!text-foreground text-sm',
            },
            duration: 3000,
          }}
        />
      </>
    ),
  },
  {
    path: '/docs',
    element: withSuspense(
      <PublicRoute>
        <div className="prose max-w-4xl mx-auto p-8">
          <h1>API Documentation</h1>
          <p>Documentation for the AuthFlow API will be available here.</p>
        </div>
      </PublicRoute>
    ),
  },
  {
    path: '/health',
    element: withSuspense(
      <PublicRoute>
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Service Status</h1>
          <p className="text-green-600">✓ Service is operational</p>
        </div>
      </PublicRoute>
    ),
  },
];

// Public routes that require initialization
export const publicRoutes = [
  {
    path: '/login',
    element: withSuspense(
      <PublicRoute>
        <AuthLayoutSplit
          title="Login to your account"
          description="Enter your email below to login to your account"
        >
          <LoginPage />
        </AuthLayoutSplit>
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: withSuspense(
      <PublicRoute>
        <AuthLayoutSplit
          title="Create an account"
          description="Enter your details to get started"
          showBackButton={true}
        >
          <RegisterPage />
        </AuthLayoutSplit>
      </PublicRoute>
    ),
  },
  {
    path: '/forgot-password',
    element: withSuspense(
      <PublicRoute>
        <AuthLayoutSplit title="Forgot Password" description="Enter your email below to reset your password"
        showBackButton={true}
        >
          <ForgotPasswordPage />
        </AuthLayoutSplit>
      </PublicRoute>
    ),
  }
  
];

export const protectedRoutes = [
  {
    path: '/',
    element: withSuspense(
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/verify-email',
    element: withSuspense(
      <ProtectedRoute>
        <AuthLayoutSplit title="Verify your email" description="We've sent a verification code to your email." showBackButton={true} backButtonAction="logout">
          <VerifyEmailPage />
        </AuthLayoutSplit>
      </ProtectedRoute>
    ),
  },
  {
    path: '/complete-profile',
    element: withSuspense(
      <ProtectedRoute>
        <AuthLayoutSplit title="Complete Your Profile" description="Tell us a bit more about yourself." showBackButton={true} backButtonAction="logout">
          <CompleteProfilePage />
        </AuthLayoutSplit>
      </ProtectedRoute>
    ),
  },
 
];

export const routes = [
  ...publicNoInitRoutes,
  ...publicRoutes,
  ...protectedRoutes,
  { path: '*', element: <ErrorPage /> },
];
