import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import useAuthStore from '@/stores/authStore';
import useUserStore from '@/stores/userStore';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  

  useEffect(() => {
    const processOAuth = async () => {
      try {
        const accessToken = searchParams.get('access_token');
        const userData = searchParams.get('user');
        const error = searchParams.get('error');

       if (error) {
          toast.error(`Authentication error: ${error}`);
          setTimeout(() => navigate('/login'), 1000);
          return;
        }

        if (!accessToken || !userData) {
          throw new Error('Missing authentication data');
        }

        const user = JSON.parse(decodeURIComponent(userData));
        useUserStore.setState({ user})
        useAuthStore.setState({ token: accessToken });
        
        toast.success('Successfully logged in! Redirecting...');
        setTimeout(() => navigate('/'), 1000);
        
      } catch (error) {
        console.error('OAuth Error:', error);
        toast.error('Authentication failed. Please try again.');
        setTimeout(() => navigate('/login'), 1000);
      } finally {
        setIsProcessing(false);
      }
    };

    processOAuth();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center p-6 max-w-md w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">
          {isProcessing ? 'Completing Authentication' : 'Redirecting...'}
        </h2>
        <p className="text-muted-foreground">
          {isProcessing 
            ? 'Please wait while we sign you in...' 
            : 'You will be redirected shortly...'}
        </p>
      </div>
    </div>
  );
};

// This is a workaround to ensure the component is not wrapped in Suspense
export default function OAuthCallbackWrapper() {
  return <OAuthCallback />;
}
