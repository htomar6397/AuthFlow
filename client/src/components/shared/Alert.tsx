import type { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface AlertProps {
  variant?: 'default' | 'destructive';
  children: ReactNode;
  className?: string;
}

export const Alert = ({ variant = 'default', children, className = '' }: AlertProps) => (
  <div 
    className={`p-4 rounded-md ${
      variant === 'destructive' 
        ? 'bg-red-50 text-red-800 border border-red-200' 
        : 'bg-blue-50 text-blue-800 border border-blue-200'
    } ${className}`}
  >
    {children}
  </div>
);

interface AlertTitleProps {
  children: ReactNode;
}

export const AlertTitle = ({ children }: AlertTitleProps) => (
  <h3 className="text-lg font-medium flex items-center gap-2">
    <AlertCircle className="h-5 w-5" />
    {children}
  </h3>
);

interface AlertDescriptionProps {
  children: ReactNode;
  className?: string;
}

export const AlertDescription = ({ 
  children, 
  className = '' 
}: AlertDescriptionProps) => (
  <div className={`mt-2 text-sm ${className}`}>
    {children}
  </div>
);
