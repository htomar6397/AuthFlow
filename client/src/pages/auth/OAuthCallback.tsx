import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import useAuthStore from '@/stores/authStore';
import useUserStore from '@/stores/userStore';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const { token } = useAuthStore();
  const { user } = useUserStore();

  useEffect(() => {
    // If user is already logged in, redirect to home
    if (token && user) {
      navigate('/');
      return;
    }

    const processOAuth = async () => {
      try {
        const accessToken = searchParams.get('access_token');
        const userData = searchParams.get('user');
        const error = searchParams.get('error');

        if (error) {
          console.error('OAuth Error:', error);
          navigate('/login', { replace: true });
          return;
        }

        if (!accessToken || !userData) {
          console.error('Missing authentication data from OAuth provider');
          navigate('/login', { replace: true });
          return;
        }

        // Parse the user data
        const user = JSON.parse(decodeURIComponent(userData));
        
        // Update the stores
        useUserStore.setState({ user });
        useAuthStore.getState().setToken(accessToken);
        
        // Store the token in localStorage for persistence
        localStorage.setItem('authToken', accessToken);
        
        // Show success message and redirect
        
       
          navigate('/', { replace: true });
        
        
      } catch (error) {
        console.error('OAuth Processing Error:', error);
        navigate('/login', { replace: true });
      } finally {
        setIsProcessing(false);
      }
    };

    // Only process OAuth if we're not already logged in
    if (!token) {
      processOAuth();
    }
  }, [searchParams, navigate, token, user]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      {isProcessing ? (
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner className="min-h-[60vh]" />
          <p className="text-muted-foreground">Completing authentication...</p>
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Authentication Complete</h2>
          <p className="text-muted-foreground">You're being redirected...</p>
        </div>
      )}
    </div>
  );
};

export default OAuthCallback;
