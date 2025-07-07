import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { changePasswordSchema, type ChangePasswordFormData, checkPasswordStrength } from '@/lib/validations';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useUserStore from '@/stores/userStore';
import { DialogClose } from '@radix-ui/react-dialog';

export function ChangePasswordForm() {
  const { changePassword } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    feedback: string;
  }>({ score: 0, feedback: '' });

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
    mode: 'onChange',
  });

  // Watch password changes for strength calculation
  const newPassword = form.watch('newPassword');

  // Update password strength on password change
  useEffect(() => {
    if (newPassword) {
      const result = checkPasswordStrength(newPassword);
      // Only consider it strong if it's at least 8 characters
      const isLongEnough = newPassword.length >= 8;
      const score = 
        result.strength === 'weak' ? 1 :
        result.strength === 'moderate' && !isLongEnough ? 1 :
        result.strength === 'moderate' ? 2 :
        isLongEnough ? 4 : 2; // Only give max score if it's long enough
        
      setPasswordStrength({ 
        score,
        feedback: getStrengthText(newPassword, score)
      });
    } else {
      setPasswordStrength({ score: 0, feedback: 'Enter a password to check strength' });
    }
  }, [newPassword]);

  // Password strength text based on score and missing requirements
  const getStrengthText = (password: string, score: number) => {
    if (!password) return 'Enter a password to check strength';
    
    // Check specific requirements
    const missing = [];
    if (password.length < 8) missing.push('at least 8 characters');
    if (!/[A-Z]/.test(password)) missing.push('an uppercase letter');
    if (!/[a-z]/.test(password)) missing.push('a lowercase letter');
    if (!/[0-9]/.test(password)) missing.push('a number');
    if (!/[^A-Za-z0-9]/.test(password)) missing.push('a special character');
    
    if (score <= 1) {
      return `Weak - Add ${missing.join(', ')}`;
    }
    if (score === 2) {
      return `Fair - Could be stronger. Add ${missing.join(', ')}`;
    }
    return 'Strong - Good job! Your password meets all requirements';
  };

  // Clear errors when form values change
  useEffect(() => {
    const subscription = form.watch((_, { name }) => {
      // Clear specific error when user types in the field
      if (name) {
        form.clearErrors(name);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    form.clearErrors();
    
    // Validate all fields
    const result = await form.trigger();
    if (!result) {
      // If validation fails, find the first error and focus on it
      const errorField = Object.keys(form.formState.errors)[0];
      if (errorField) {
        const element = document.querySelector(`[name="${errorField}"]`);
        if (element instanceof HTMLElement) {
          element.focus();
        }
      }
      return;
    }
    
    const { currentPassword, newPassword, confirmNewPassword } = form.getValues();
    
    // Check if new password matches confirmation
    if (newPassword !== confirmNewPassword) {
      form.setError('confirmNewPassword', {
        type: 'manual',
        message: 'Passwords do not match',
      });
      return;
    }
    
    // Check if new password is same as current password
    if (currentPassword === newPassword) {
      form.setError('newPassword', {
        type: 'manual',
        message: 'New password must be different from current password',
      });
      return;
    }
    
    try {
      setIsLoading(true);
      await changePassword(currentPassword, newPassword);
      form.reset();
    } catch (error) {
      console.error('Failed to change password:', error);
      // Set error on the form
      form.setError('root', {
        type: 'manual',
        message: error instanceof Error ? error.message : 'Failed to change password. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {form.formState.errors.root && (
          <div className="text-sm font-medium text-destructive">
            {form.formState.errors.root.message}
          </div>
        )}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={showCurrentPassword ? 'text' : 'password'}
                      placeholder="Enter your current password"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    disabled={isLoading}
                    aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Enter your new password"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    disabled={isLoading}
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <FormMessage />
                {field.value && (
                  <div className="mt-2 space-y-1">
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          passwordStrength.score <= 1 ? 'bg-red-500' :
                          passwordStrength.score === 2 ? 'bg-yellow-400' :
                          passwordStrength.score >= 3 ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                        style={{
                          width: `${(passwordStrength.score / 4) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs mt-1 text-muted-foreground">
                      {passwordStrength.feedback}
                    </p>
                  </div>
                )}
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmNewPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your new password"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end gap-3">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="flex-1" disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>
          
          <Button 
            type="submit" 
            className="flex-1" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Change Password'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
