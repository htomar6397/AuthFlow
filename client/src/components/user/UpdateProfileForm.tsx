import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/stores';
import { toast } from 'sonner';
import { Loader2, Check, X } from 'lucide-react';
import { updateProfileSchema, type UpdateProfileFormData } from '@/lib/validations';
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
import { Textarea } from '@/components/ui/textarea';

interface UpdateProfileFormProps {
  initialData: {
    name: string;
    username: string;
    bio?: string;
  };
  onClose: () => void;
}

export function UpdateProfileForm({ initialData, onClose }: UpdateProfileFormProps) {
  const { updateProfile, checkUsernameAvailability, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  const form = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: initialData.name,
      username: initialData.username,
      bio: initialData.bio || '',
    },
  });

  const currentUsername = form.watch('username');
  const isOwnUsername = currentUsername === user?.username;
  
  // Username availability check state
  const [isChecking, setIsChecking] = useState(false);
  const [typingTimer, setTypingTimer] = useState<NodeJS.Timeout | null>(null);

  // Handle username input changes
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
    form.setValue('username', value, { shouldValidate: true });
    
    // Clear any existing timer
    if (typingTimer) {
      clearTimeout(typingTimer);
      setIsChecking(false);
    }
    
    if (value.length === 0) {
      setUsernameAvailable(null);
      return;
    }
    
    // Don't check if it's the user's current username
    if (value === user?.username) {
      setUsernameAvailable(true);
      return;
    }
    
    // Start checking
    setIsChecking(true);
    
    // Set a new timer
    const timer = setTimeout(async () => {
      if (value.length < 3) {
        setUsernameAvailable(null);
        setIsChecking(false);
        return;
      }

      try {
        const available = await checkUsernameAvailability(value);
        setUsernameAvailable(available);
      } catch (error) {
        console.error('Error checking username:', error);
        setUsernameAvailable(false);
      } finally {
        setIsChecking(false);
      }
    }, 500);
    
    setTypingTimer(timer);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (typingTimer) {
        clearTimeout(typingTimer);
      }
    };
  }, [typingTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await form.trigger();
    if (!result) return;
    
    const formData = form.getValues();
    
    try {
      setIsLoading(true);
      await updateProfile(formData);
      toast.success('Profile updated successfully');
      if (onClose) {
        onClose();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      toast.error(errorMessage);
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-muted-foreground pointer-events-none">@</span>
                      <Input
                        {...field}
                        value={field.value}
                        placeholder="username"
                        className="pl-8 pr-8"
                        onChange={handleUsernameChange}
                      />
                    </div>
                    {field.value && field.value.length > 0 && !isOwnUsername && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        {isChecking ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : usernameAvailable === true ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : usernameAvailable === false ? (
                          <X className="h-4 w-4 text-destructive" />
                        ) : null}
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us a little bit about yourself"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="min-w-24"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : 'Update Profile'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
