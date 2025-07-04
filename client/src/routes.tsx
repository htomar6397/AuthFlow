// src/routes.tsx
import React, { lazy, Suspense } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '@/stores/authStore';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

// Lazy-loaded pages
const LoginForm = lazy(() => import('@/components/auth/LoginForm').then(m => ({ default: m.LoginForm })));
const RegisterForm = lazy(() => import('@/components/auth/RegisterForm').then(m => ({ default: m.RegisterForm })));
const VerifyEmail = lazy(() => import('@/components/auth/verify-otp-form').then(m => ({ default: m.VerifyOtpForm })));
const CompleteProfile = lazy(() => import('@/components/auth/CompleteProfile').then(m => ({ default: m.CompleteProfile })));
const ForgotPassword = lazy(() => import('@/components/auth/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('@/components/user/ResetPassword').then(m => ({ default: m.ResetPassword })));
const Home = lazy(() => import('@/components/user/Home').then(m => ({ default: m.Home })));

// Suspense fallback wrapper
const withSuspense = (Component: React.ReactNode) => (
  <Suspense fallback={<LoadingSpinner />}>{Component}</Suspense>
);

// Protected route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = React.memo(({ children }) => {
  const location = useLocation();
  const { user } = useAuthStore();

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
  const { user } = useAuthStore();
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

// Memoize the auth layout to prevent unnecessary re-renders
const MemoizedAuthLayout = React.memo(({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4 w-full">
    <div className="w-full max-w-md">{children}</div>
  </div>
));

// Auth page layout (kept for backward compatibility)
const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MemoizedAuthLayout>{children}</MemoizedAuthLayout>
);

// Route definitions
export const publicRoutes = [
  {
    path: '/login',
    element: withSuspense(
      <PublicRoute>
        <AuthLayout>
          <LoginForm />
        </AuthLayout>
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: withSuspense(
      <PublicRoute>
        <AuthLayout>
          <RegisterForm />
        </AuthLayout>
      </PublicRoute>
    ),
  },
  {
    path: '/forgot-password',
    element: withSuspense(
      <PublicRoute>
        <AuthLayout>
          <ForgotPassword />
        </AuthLayout>
      </PublicRoute>
    ),
  }
];

export const protectedRoutes = [
  {
    path: '/',
    element: withSuspense(
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: '/verify-email',
    element: withSuspense(
      <ProtectedRoute>
        <AuthLayout>
          <VerifyEmail />
        </AuthLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/complete-profile',
    element: withSuspense(
      <ProtectedRoute>
        <AuthLayout>
          <CompleteProfile />
        </AuthLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/reset-password',
    element: withSuspense(
      <ProtectedRoute>
        <AuthLayout>
          <ResetPassword />
        </AuthLayout>
      </ProtectedRoute>
    ),
  },
];

export const routes = [
  ...publicRoutes,
  ...protectedRoutes,
  { path: '*', element: <Navigate to="/" replace /> },
];
