import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import { ThemeProvider } from './context/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { routes } from './routes';
import { MainLayout } from './components/layout/MainLayout';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import { useEffect, useState } from 'react';
import useAuthStore from './stores/authStore';

function AppContent() {
  const element = useRoutes(routes);
  
  return (
    <MainLayout>
      {element}
      <Toaster position="top-right" />
    </MainLayout>
  );
}

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const { initialize } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      try {
        await initialize();
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, [initialize]);

  if (!isInitialized) {
    return <LoadingSpinner />;
  }

  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
