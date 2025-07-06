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
import { Alert, AlertDescription } from './components/shared/Alert';
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
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 mt-0.5 text-destructive flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Oops! Something went wrong
                </h3>
                <AlertDescription className="mt-2 text-foreground/80">
                  {error?.message || 'An unexpected error occurred. Please try again.'}
                  {error?.code && (
                    <span className="block mt-1 text-sm text-muted-foreground">
                      Error code: {error.code}
                      {error.statusCode && ` (Status: ${error.statusCode})`}
                    </span>
                  )}
                </AlertDescription>
                <div className="flex flex-wrap gap-3 mt-4">
                  <Button 
                    variant="outline" 
                    onClick={handleReset}
                    className="flex-1 min-w-[120px]"
                  >
                    Reload Page
                  </Button>
                  <Button 
                    variant="default" 
                    onClick={() => navigate('/')}
                    className="flex-1 min-w-[120px]"
                  >
                    Go to Home
                  </Button>
                </div>
              </div>
            </div>
          </Alert>
          {process.env.NODE_ENV === 'development' && error?.stack && (
            <details className="mt-4 p-3 bg-muted/50 rounded-md text-sm overflow-auto max-h-60">
              <summary className="font-medium cursor-pointer text-muted-foreground">
                Error details
              </summary>
              <pre className="mt-2 p-2 bg-background rounded text-xs overflow-auto">
                {error.stack}
              </pre>
            </details>
          )}
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
      <div className="min-h-screen bg-background text-foreground">
        <MainLayout showHeader={true}>
          {element}
        </MainLayout>
      </div>
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
