import { useRoutes, useLocation, useNavigate, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/theme-provider';
import { routes, publicNoInitRoutes } from './routes';
import { MainLayout } from './components/layout/MainLayout';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { useEffect, useState } from 'react';
import { Toaster } from './components/ui/sonner';
import useUserStore from './stores/userStore';
import { Button } from './components/ui/button';
import { Alert, AlertTitle, AlertDescription } from './components/shared/Alert';
import { AlertCircle } from 'lucide-react';

// Define custom error type with code property
interface CustomError extends Error {
  code?: string;
  statusCode?: number;
}

function AppContent() {
  const element = useRoutes(routes);
  const navigate = useNavigate();
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<CustomError | null>(null);

  // Handle network/CORS errors globally
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      setError(event.error);
      setHasError(true);
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled rejection:', event.reason);
      setError(event.reason);
      setHasError(true);
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  const handleReset = () => {
    setHasError(false);
    setError(null);
    window.location.reload();
  };

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription className="mb-4">
              {error?.message || 'An unexpected error occurred. Please try again.'}
              {error?.code && ` (${error.code})`}
            </AlertDescription>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset}>
                Reload Page
              </Button>
              <Button variant="outline" onClick={() => navigate('/')}>
                Go to Home
              </Button>
            </div>
          </Alert>
        </div>
      </div>
    );
  }
  
  return (
    <ErrorBoundary 
      onError={(error) => {
        console.error('Error caught by ErrorBoundary:', error);
        setError(error);
        setHasError(true);
      }}
    >
      <MainLayout showHeader={true}>
        {element}
      </MainLayout>
    </ErrorBoundary>
  );
}

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const { fetchUser } = useUserStore();
  const location = useLocation();
  const isNoInitRoute = publicNoInitRoutes.some(route => route.path === location.pathname);
  
  // Handle auth initialization
  useEffect(() => {
    // Skip initialization for no-init routes
    if (isNoInitRoute) {
      setIsInitialized(true);
      return;
    }

    // Add scrollbar class to body
    document.body.classList.add('scrollbar-overlay');
    
    const initAuth = async () => {
      try {
        await fetchUser();
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();

    // Cleanup function
    return () => {
      document.body.classList.remove('scrollbar-overlay');
    };
  }, [fetchUser, isNoInitRoute]);

  // Show loading spinner only for routes that require initialization
  if (!isInitialized && !isNoInitRoute) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // For no-init routes, render them directly without the app layout
  if (isNoInitRoute) {
    return (
      <ThemeProvider>
        <Routes>
          {publicNoInitRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Routes>
      </ThemeProvider>
    );
  }

  // For all other routes, use the normal app flow with layout
  return (
    <ThemeProvider>
      <div className="min-h-screen w-full overflow-x-hidden">
        <Toaster
          position="top-right"
          toastOptions={{
            classNames: {
              description: '!text-foreground text-sm',
            }
          }}
        />
        <AppContent />
      </div>
    </ThemeProvider>
  );
}

export default App;
