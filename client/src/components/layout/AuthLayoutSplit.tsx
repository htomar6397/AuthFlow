import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, ShieldCheck, Zap } from 'lucide-react';
import useAuthStore from '@/stores/authStore';
import { Separator } from '@/components/ui/separator';

interface AuthLayoutSplitProps {
  children: React.ReactNode;
  title: string;
  description: string;
  showBackButton?: boolean;
  backButtonAction?: 'login' | 'logout';
}

export const AuthLayoutSplit: React.FC<AuthLayoutSplitProps> = ({
  children,
  title,
  description,
  showBackButton = false,
  backButtonAction = 'login',
}) => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'security' | 'rateLimiting'>('security');
const [isLoggingOut, setIsLoggingOut] = useState(false);
  const handleBackButtonClick = async () => {
    if (backButtonAction === 'logout') {
      setIsLoggingOut(true);
      await logout();
      setIsLoggingOut(false);
    } else {
      navigate(-1); // Go back to the previous page
    }
  };

  return (
    <div className="container relative min-h-[calc(100vh-20rem)] flex justify-center">
      
      <div className="grid lg:grid-cols-[auto_auto_auto] lg:gap-x-12">
        {/* Left Column */}
        <div className="p-8 relative hidden h-full lg:flex flex-col justify-start w-[420px]">
          <div className="mb-8 pt-1  ">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              AuthFlow 
            </h2>
            <p className="text-base text-muted-foreground">
              Secure authentication with email and OAuth 2.0
            </p>
          </div>

          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex space-x-1 bg-muted/20 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('security')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center space-x-2 transition-colors ${
                  activeTab === 'security' 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground/80'
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Security</span>
              </button>
              <button
                onClick={() => setActiveTab('rateLimiting')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center space-x-2 transition-colors ${
                  activeTab === 'rateLimiting' 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground/80'
                }`}
              >
                <Zap className="h-4 w-4" />
                <span>Rate Limits</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="space-y-3.5 mt-1">
              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="bg-muted/10 p-4 rounded-lg border border-muted/20 min-h-[360px]">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-primary/5 p-1.5 rounded-lg">
                      <ShieldCheck className="h-4 w-4 text-muted-foreground/90" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground/90">Security Features</h3>
                  </div>
                  <div className="space-y-3 mt-1">
                    <div className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <div>
                        <div className="text-base font-medium text-foreground/90">JWT Authentication</div>
                        <div className="text-muted-foreground/50 text-[13px] leading-tight">Secure token-based auth with HTTP-only cookies</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <div>
                        <div className="text-base font-medium text-foreground/90">CSRF Protection</div>
                        <div className="text-muted-foreground/50 text-[13px] leading-tight">Cross-Site Request Forgery prevention</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <div>
                        <div className="text-base font-medium text-foreground/90">Session Security</div>
                        <div className="text-muted-foreground/50 text-[13px] leading-tight">Secure, encrypted session management</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <div>
                        <div className="text-base font-medium text-foreground/90">Email Verification</div>
                        <div className="text-muted-foreground/50 text-[13px] leading-tight">Required for account activation</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <div>
                        <div className="text-base font-medium text-foreground/90">Password Security</div>
                        <div className="text-muted-foreground/50 text-[13px] leading-tight">Secure hashing and reset flow</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <div>
                        <div className="text-base font-medium text-foreground/90">OAuth 2.0</div>
                        <div className="text-muted-foreground/50 text-[13px] leading-tight">Google social login integration</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Rate Limiting Tab */}
              {activeTab === 'rateLimiting' && (
                <div className="bg-muted/10 p-4 rounded-lg border border-muted/20 min-h-[360px]">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-primary/5 p-1.5 rounded-lg">
                      <Zap className="h-4 w-4 text-muted-foreground/90" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground/90">Rate Limiting</h3>
                  </div>
                  <div className="space-y-3 mt-1">
                    <div className="flex justify-between items-center">
                      <span className="text-base text-foreground/90">Standard API requests</span>
                      <span className="font-mono bg-muted/50 px-2 py-0.5 rounded text-[13px] text-muted-foreground/80">100/15min</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base text-foreground/90">Authentication attempts</span>
                      <span className="font-mono bg-muted/50 px-2 py-0.5 rounded text-[13px] text-muted-foreground/80">20/15min</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base text-foreground/90">New account creation</span>
                      <span className="font-mono bg-muted/50 px-2 py-0.5 rounded text-[13px] text-muted-foreground/80">5/hour</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base text-foreground/90">Username availability</span>
                      <span className="font-mono bg-muted/50 px-2 py-0.5 rounded text-[13px] text-muted-foreground/80">30/min</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base text-foreground/90">Password reset requests</span>
                      <span className="font-mono bg-muted/50 px-2 py-0.5 rounded text-[13px] text-muted-foreground/80">5/hour</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base text-foreground/90">Verify otp requests</span>
                      <span className="font-mono bg-muted/50 px-2 py-0.5 rounded text-[13px] text-muted-foreground/80">5/hour</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base text-foreground/90">Resend otp requests</span>
                      <span className="font-mono bg-muted/50 px-2 py-0.5 rounded text-[13px] text-muted-foreground/80">5/hour</span>
                    </div>
                    <div className="pt-2 mt-3 border-t border-muted/30 text-[12px] text-muted-foreground/50">
                      Check <code className="bg-muted/30 px-1 rounded">X-RateLimit-*</code> headers for current usage
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Separator */}
        <Separator orientation="vertical" className="hidden lg:block self-stretch" />

        {/* Right Column (Form) */}
        <div className="lg:p-8 flex items-center relative">
          {/* Back Button */}
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackButtonClick}
              className="absolute left-1 top-8 z-10"
            >
           {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowLeft className="h-4 w-4" />}
            </Button>
          )}
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                {title}
              </h1>
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

