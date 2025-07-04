import { useState } from 'react';
import { Button } from "@/components/ui/button";
import useAuthStore from "@/stores/authStore";
import { Link, useNavigate } from "react-router-dom";
import { ModeToggle } from "@/components/shared/mode-toggle";
import { Lock, Loader2, LogOut } from "lucide-react";
import { toast } from 'sonner';

export const Header = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to log out. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center space-x-2">
          <Lock className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            AuthFlow
          </span>
        </Link>
        
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-2">
            {user ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="min-w-[80px]"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging out...
                  </>
                ) : (
                  <>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/register">Sign up</Link>
                </Button>
              </>
            )}
            <ModeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
