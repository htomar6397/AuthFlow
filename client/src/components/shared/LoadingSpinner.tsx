// Loading component for Suspense fallback
interface LoadingSpinnerProps {
  className?: string;
}

export const LoadingSpinner = ({ className = '' }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-12 w-12 border-t-2 border-b-2',
    lg: 'h-16 w-16 border-t-4 border-b-4',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div 
        className={`animate-spin rounded-full border-primary ${sizeClasses.md}`}
        aria-label="Loading..."
      ></div>
    </div>
  );
};

export default LoadingSpinner;