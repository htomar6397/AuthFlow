import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { changePasswordSchema, type ChangePasswordFormData } from '@/lib/validations';
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

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  // Removed isFormValid check to always enable the button and show inline errors

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await form.trigger();
    if (!result) return;
    
    const { currentPassword, newPassword } = form.getValues();
    
    try {
      setIsLoading(true);
      await changePassword(currentPassword, newPassword);
      form.reset();
    } catch (error) {
      console.error('Failed to change password:', error);
      } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
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
                      {...field}
                    />
                  </FormControl>
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
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
                      {...field}
                    />
                  </FormControl>
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
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
            name="confirmNewPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your new password"
                      {...field}
                    />
                  </FormControl>
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
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
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Changing...
              </>
            ) : 'Change Password'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
