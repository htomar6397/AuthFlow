import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores';
import { PasswordInput } from '@/components/ui/Password-Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, checkPasswordStrength } from '@/lib/validations';
import { z } from 'zod';


type FormData = z.infer<typeof registerSchema>;


/**
 * @function RegisterPage
 * @description A React functional component that provides a user registration form.
 * It handles user input for email, password, and confirm password, interacts with the
 * authentication store for registration logic, and displays loading and error states.
 */
export function RegisterPage() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  type PasswordStrength = {
    strength: 'weak' | 'moderate' | 'strong';
    percentage: number;
    messages: string[];
  };

  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    strength: 'weak',
    percentage: 0,
    messages: []
  });
  
  const navigate = useNavigate();
  
  const { 
    register: registerField, 
    handleSubmit, 
    formState: { errors }, 
    watch, 
    setError: setFormError 
  } = useForm<FormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: ''
    }
  });
  
  const passwordValue = watch('password', '');
  
  useEffect(() => {
    if (passwordValue) {
      const strength = checkPasswordStrength(passwordValue);
      setPasswordStrength({
        strength: strength.strength as 'weak' | 'moderate' | 'strong',
        percentage: strength.percentage,
        messages: strength.messages
      });
    } else {
      setPasswordStrength({
        strength: 'weak',
        percentage: 0,
        messages: []
      });
    }
  }, [passwordValue]);

  // Destructure authentication state and actions from the Zustand store.
  const { register: registerUser, isLoading: loading, error: authError, clearError } = useAuthStore();

  /**
   * @useEffect
   * @description Synchronizes local error state with the global authentication error from the store.
   * When `authError` changes (e.g., after a failed registration attempt), it updates the local `error` state
   * and then clears the error in the store to prevent it from persisting across different components
   * or subsequent successful operations.
   */
  useEffect(() => {
    if (authError) {
      setFormError('root', { message: authError.message }); // Set local error to display in the form
      clearError(); // Clear the error from the global store
    }
  }, [authError, clearError, setFormError]); // Dependencies: re-run effect if authError or clearError changes
  
  /**
   * @function handleSubmit
   * @description Handles the form submission for user registration.
   * Performs client-side validation for password matching and length.
   * Calls the `register` action from the authentication store.
   * On successful registration, navigates to the email verification page.
   * On failure, sets a local error message.
   * @param {React.FormEvent} e - The form submission event.
   */
  const onSubmit = async (data: FormData) => {
    try {
      await registerUser({ email: data.email, password: data.password });
      navigate('/verify-email');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create an account';
      setFormError('root', { 
        type: 'manual',
        message: errorMessage 
      });
      console.error('Registration error caught in component:', err);
    }
  };

  /**
   * @function handleGoogleSignUp
   * @description Placeholder function for Google OAuth sign-up.
   * Currently, it just displays a toast and sets a local error indicating that the feature is not yet implemented.
   */
  const handleGoogleSignUp = async () => {
    try {
      setIsGoogleLoading(true);
      window.location.href = `http://localhost:3000/dev/api/auth/google`;
    } catch (error) {
      console.error('Google sign up error:', error);
      setFormError('root', { message: 'Failed to initiate Google sign up' });
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
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            disabled={loading}
            autoComplete="email"
            {...registerField('email')}
            className={errors.email ? 'border border-destructive' : ''}
          />
          {errors.email && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" />
              {errors.email.message}
            </p>
          )}
        </div>
        <div className="grid gap-3">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            placeholder="Enter your password"
            disabled={loading}
            autoComplete="new-password"
            {...registerField('password')}
            className={errors.password ? 'border border-destructive' : ''}
          />
          {errors.password && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" />
              {errors.password.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Must be at least 8 characters
          </p>
          {passwordStrength.strength !== 'weak' && (
            <div className="flex items-center gap-2">
              <div className="w-full h-2 bg-destructive/10 rounded-full">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${passwordStrength.percentage}%`,
                    backgroundColor: passwordStrength.strength === 'strong' ? 'green' : 'orange'
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {passwordStrength.strength === 'strong' ? 'Strong' : 'Fair'}
              </p>
            </div>
          )}
        </div>
        <div className="grid gap-3">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <PasswordInput
            id="confirmPassword"
            placeholder="Confirm your password"
            disabled={loading}
            autoComplete="new-password"
            {...registerField('confirmPassword')}
            className={errors.confirmPassword ? 'border border-destructive' : ''}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" />
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </Button>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleGoogleSignUp} 
          disabled={loading || isGoogleLoading}
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
        Already have an account?{" "}
        <Link to="/login" className="underline underline-offset-4">
          Sign in
        </Link>
      </div>
    </form>
  );
}