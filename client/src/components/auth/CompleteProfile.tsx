import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

export function CompleteProfile() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isChecking, setIsChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, completeProfile, checkUsernameAvailability } = useAuthStore();
  const navigate = useNavigate();
  console.log(user)
  // Debounce username availability check
  useEffect(() => {
    const checkUsername = async () => {
      if (formData.username.length < 3) {
        setUsernameAvailable(null);
        return;
      }

      setIsChecking(true);
      try {
        const available = await checkUsernameAvailability(formData.username);
        setUsernameAvailable(available);
        
        if (!available) {
          setErrors(prev => ({
            ...prev,
            username: 'Username is already taken'
          }));
        } else {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.username;
            return newErrors;
          });
        }
      } catch (error) {
        console.error('Error checking username:', error);
      } finally {
        setIsChecking(false);
      }
    };

    const timerId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timerId);
  }, [formData.username, checkUsernameAvailability]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (usernameAvailable === false) {
      newErrors.username = 'Username is already taken';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (usernameAvailable === false) {
      setErrors(prev => ({
        ...prev,
        username: 'Please choose an available username'
      }));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await completeProfile({
        name: formData.name,
        username: formData.username,
        bio: formData?.bio 
      });
      
      // Redirect to home after successful profile completion
      navigate('/');
    } catch (error) {
      console.error('Error completing profile:', error);
      setErrors({
        submit: 'Failed to complete profile. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Complete Your Profile</h1>
        <p className="text-muted-foreground">Tell us a bit more about yourself</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.submit && (
          <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
            {errors.submit}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Doe"
              required
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="username">Username</Label>
            {isChecking ? (
              <span className="text-xs text-muted-foreground flex items-center">
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                Checking...
              </span>
            ) : usernameAvailable === true ? (
              <span className="text-xs text-green-600 dark:text-green-400">
                ✓ Available
              </span>
            ) : usernameAvailable === false ? (
              <span className="text-xs text-destructive">
                ✗ Already taken
              </span>
            ) : null}
          </div>
          <Input
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="johndoe"
            required
            minLength={3}
            disabled={isSubmitting || isChecking}
          />
          {errors.username && (
            <p className="text-sm text-destructive">{errors.username}</p>
          )}
          <p className="text-xs text-muted-foreground">
            This will be your unique identifier on our platform
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio (Optional)</Label>
          <Textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us a bit about yourself..."
            rows={3}
            disabled={isSubmitting}
          />
          <p className="text-xs text-muted-foreground">
            Max 160 characters
          </p>
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting || isChecking || usernameAvailable === false}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Complete Profile'
          )}
        </Button>
      </form>
    </div>
  );
}
