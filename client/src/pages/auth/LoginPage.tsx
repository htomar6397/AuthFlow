import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores';
import { PasswordInput } from '@/components/ui/Password-Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/validations';
import { z } from 'zod';

type FormData = z.infer<typeof loginSchema>;

/**
 * @function LoginPage
 * @description A React functional component that provides a user login form.
 * It handles user input for email/username and password, interacts with the
 * authentication store for login logic, and displays loading and error states.
 */
export function LoginPage() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    setError: setFormError 
  } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: 'testUser1@gmail.com',
      password: 'testUser1@1'
    }
  });

  // Destructure authentication state and actions from the Zustand store.
  const { login: loginUser, isLoading, error: authError, clearError } = useAuthStore();

  /**
   * @useEffect
   * @description Synchronizes local error state with the global authentication error from the store.
   * When `authError` changes (e.g., after a failed login attempt), it updates the local `error` state
   * and then clears the error in the store to prevent it from persisting across different components
   * or subsequent successful operations.
   */
  useEffect(() => {
    if (authError) {
      setFormError('root', { 
        type: 'manual',
        message: authError?.message ?? 'An unknown error occurred' 
      }); // Set local error to display in the form
      clearError(); // Clear the error from the global store
    }
  }, [authError, clearError, setFormError]); // Dependencies: re-run effect if authError or clearError changes

  /**
   * @function handleSubmit
   * @description Handles the form submission for user login.
   * Prevents default form submission, clears previous errors, and calls the login action from the store.
   * Error handling is primarily managed by the `useAuthStore` and propagated via `authError`.
   * @param {React.FormEvent} e - The form submission event.
   */
  const onSubmit = async (data: FormData) => {
    try {
      await loginUser({ identifier: data.identifier, password: data.password });
      // Redirection to protected routes is handled by the router's ProtectedRoute logic
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to log in';
      setFormError('root', { 
        type: 'manual',
        message: errorMessage 
      });
   }
  };

  /**
   * @function handleGoogleLogin
   * @description Placeholder function for Google OAuth login.
   * Currently, it just sets a local error indicating that the feature is not yet implemented.
   */
  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;
    } catch (error) {
      console.error('Google login error:', error);
      setFormError('root', { message: 'Failed to initiate Google login' });
      setIsGoogleLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {errors.root?.message && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {errors.root.message}
        </div>
      )}
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="identifier">Email or Username</Label>
          <Input
            id="identifier"
            type="text"
            placeholder="Enter your email or username"
            disabled={isLoading}
            autoComplete="username"
            {...register('identifier')}
            className={errors.identifier ? 'border border-destructive' : ''}
          />
          {errors.identifier && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" />
              {errors.identifier.message}
            </p>
          )}
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline cursor-pointer"
            >
              Forgot your password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            placeholder="Enter your password"
            disabled={isLoading}
            autoComplete="current-password"
            {...register('password')}
            className={errors.password ? 'border border-destructive' : ''}
          />
          {errors.password && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" />
              {errors.password.message}
            </p>
          )}
        </div>
        <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging in...
            </>
          ) : (
            'Sign in'
          )}
        </Button>
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            Or continue with
          </span>
        </div>
        <Button 
          variant="outline" 
          className="w-full cursor-pointer" 
          onClick={handleGoogleLogin} 
          disabled={isLoading || isGoogleLoading}
          type="button"
        >
          {isGoogleLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Redirecting to Google...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </>
          )}
        </Button>
      </div>
      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="underline underline-offset-4 cursor-pointer">
          Sign up
        </Link>
      </div>
    </form>
  );
}

export default LoginPage;