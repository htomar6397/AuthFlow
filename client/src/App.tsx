import { useRoutes, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/theme-provider';
import { routes, publicNoInitRoutes } from './routes';
import { MainLayout } from './components/layout/MainLayout';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import { useEffect, useState } from 'react';
import { Toaster } from './components/ui/sonner';
import useUserStore from './stores/userStore';

function AppContent() {
  const element = useRoutes(routes);
  
  return (
    <MainLayout showHeader={true}>
      {element}
    </MainLayout>
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
