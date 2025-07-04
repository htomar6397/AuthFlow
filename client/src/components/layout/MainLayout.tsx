import type { ReactNode } from 'react';
import { Header } from './Header';

type MainLayoutProps = {
  children: ReactNode;
  showHeader?: boolean;
};

export const MainLayout = ({ children, showHeader = true }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {showHeader && <Header />}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
