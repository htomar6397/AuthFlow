import { useState } from 'react';
import { Button } from "@/components/ui/button";
import useAuthStore from "@/stores/authStore";
import { Link, useNavigate } from "react-router-dom";
import { ModeToggle } from "@/components/shared/mode-toggle";
import { Lock, Loader2, LogOut, AlertCircle } from "lucide-react";
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const Header = () => {
  const { token, logout, isLoading : isLoggingOut } = useAuthStore();
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const scrollDirection = useScrollDirection();

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogout = async () => {
    try {
      // Add a small delay for better UX
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setShowLogoutDialog(false);
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-transform duration-300",
        scrollDirection === 'down' ? '-translate-y-full' : 'translate-y-0'
      )}
    >
      <div className="mx-auto container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center space-x-2">
          <Lock className="h-5 w-5 text-primary" />
          <span className="text-xl font-bold text-primary">
            AuthFlow
          </span>
        </Link>
        
        <div className="flex items-center gap-4 translate-x-2.5">
          <nav className="flex items-center gap-2">
            {token ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogoutClick}
                  disabled={isLoggingOut}
                  className="min-w-[80px]"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>

                <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-destructive/10 text-destructive">
                          <AlertCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <DialogTitle>Logout Confirmation</DialogTitle>
                          <DialogDescription className="mt-1">
                            Are you sure you want to log out?
                          </DialogDescription>
                        </div>
                      </div>
                    </DialogHeader>
                    <DialogFooter className="mt-6">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowLogoutDialog(false)}
                        disabled={isLoggingOut}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="button"
                        variant="destructive" 
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="min-w-[100px]"
                      >
                        {isLoggingOut ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Logging out...
                          </>
                        ) : (
                          'Logout'
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
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
