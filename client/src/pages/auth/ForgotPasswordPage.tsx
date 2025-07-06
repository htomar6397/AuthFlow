import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores';

export function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { forgotPassword, isLoading, error: authError } = useAuthStore();

  useEffect(() => {
    if (authError) {
      setError(authError.message);
    }
  }, [authError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identifier) {
      setError('Please enter your email or username');
      return;
    }

    setError('');

    try {
      await forgotPassword(identifier);
      setIsSubmitted(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send temporary password';
      setError(errorMessage);
      console.error('Forgot password error:', err);
    }
  };

  if (isSubmitted) {
    return (
      <div className="space-y-6 text-center">
        <div className="rounded-lg bg-green-50 p-4 text-green-700 dark:bg-green-900/20 dark:text-green-400">
          <h3 className="mb-2 text-lg font-medium">Temporary Password Sent</h3>
          <div className="space-y-2 text-sm">
            <p>
              A temporary password has been sent to your registered email address.
              Please check your inbox and use it to log in.
            </p>
            <p className="text-destructive font-medium">
              Can't find the email? Please check your spam or junk folder.
            </p>
            <p className="text-xs">
              Don't forget to change your password after logging in.
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link to="/login">Back to Login</Link>
          </Button>
          
          <p className="text-sm text-muted-foreground">
            Didn't receive the email?{' '}
            <button
              type="button"
              onClick={() => setIsSubmitted(false)}
              className="text-primary underline-offset-4 hover:underline"
            >
              Try again
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="identifier">Email or Username</Label>
        <Input
          id="identifier"
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="Enter your email or username"
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <svg
              className="mr-2 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Sending...
          </>
        ) : (
          'Send Temporary Password'
        )}
      </Button>

      <div className="mt-4 text-center text-sm">
        Remember your password?{' '}
        <Link to="/login" className="text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </div>
    </form>
  );
}
