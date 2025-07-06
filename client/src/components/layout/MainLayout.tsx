import type { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

type MainLayoutProps = {
  children: ReactNode;
  showHeader?: boolean;
};

export const MainLayout = ({ children, showHeader = true }: MainLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {showHeader && <Header />}
      <main className="flex-grow container mx-auto py-8 px-4 sm:px-6 lg:px-8 md:items-start flex justify-center items-center">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
