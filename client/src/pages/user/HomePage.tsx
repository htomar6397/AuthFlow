import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Mail, User, Key, UserCog, AlertTriangle } from 'lucide-react';
import useAuthStore from '@/stores/authStore';
import useUserStore from '@/stores/userStore';
import { Button } from '@/components/ui/button';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { UpdateProfileForm } from '@/components/user/UpdateProfileForm';
import { ChangePasswordForm } from '@/components/user/ChangePasswordForm';

function DeleteAccountDialog() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { logout } = useAuthStore();
  const { deleteAccount } = useUserStore();

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error('Please enter your password');
      return;
    }

    try {
      setIsLoading(true);
      await deleteAccount(password);
      await logout();
    } catch (error) {
      console.error('Failed to delete account:', error);
   } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive" className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Delete Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleDeleteAccount}>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account and all of your data.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3"
                placeholder="Enter your password to confirm"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button 
              type="submit" 
              variant="destructive"
              disabled={isLoading || !password}
            >
              {isLoading ? 'Deleting...' : 'Delete Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function HomePage() {
  const { user } = useUserStore();

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <main className="mx-auto min-h-[calc(100vh-160px)] flex items-center">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Sidebar - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-background/80 border border-border/40 dark:border-border/60 backdrop-blur-sm rounded-xl p-6 shadow-sm">
              <div className="flex flex-col items-center space-y-4 text-center">
                <Avatar className="h-32 w-32 border-4 border-primary/10">
                  <AvatarImage src="" alt={user?.name || user?.email} />
                  <AvatarFallback className="text-4xl bg-primary/10">
                    {getInitials(`${user?.name}`.trim() || user?.email || '')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold">
                    {user?.name || 'Welcome to AuthFlow'}
                  </h1>
                  {user?.username && (
                    <p className="text-muted-foreground">@{user.username}</p>
                  )}
                </div>
                
                <div className="w-full space-y-3 pt-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <UserCog className="mr-2 h-4 w-4" />
                        Update Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Update Profile</DialogTitle>
                        <DialogDescription>
                          Make changes to your profile here. Click save when you're done.
                        </DialogDescription>
                      </DialogHeader>
                      <UpdateProfileForm 
                        initialData={{
                          name: user?.name || '',
                          username: user?.username || '',
                          bio: user?.bio || ''
                        }}
                        onClose={() => {}}
                      />
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Key className="mr-2 h-4 w-4" />
                        Change Password
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                          Enter your current password and set a new one.
                        </DialogDescription>
                      </DialogHeader>
                      <ChangePasswordForm onClose={() => {}} />
                    </DialogContent>
                  </Dialog>

                  <div className="pt-2 border-t border-border/40">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10">
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Delete Account
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle className="text-destructive">Delete Account</DialogTitle>
                          <DialogDescription>
                            This action cannot be undone. This will permanently delete your account and all associated data.
                          </DialogDescription>
                        </DialogHeader>
                        <DeleteAccountDialog />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Information */}
            <div className="bg-background/80 border border-border/40 dark:border-border/60 backdrop-blur-sm rounded-xl p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl font-semibold">Account Information</h2>
                <p className="text-sm text-muted-foreground">Your account details and activity</p>
              </div>
              
              <div className="space-y-8">
                {/* Email Section */}
                <div className="flex items-start space-x-4 p-3 rounded-lg border border-border/20 dark:border-border/30 bg-muted/10">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Email Address</h3>
                      {user?.isEmailVerified ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                          Not Verified
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground">{user?.email || 'Not provided'}</p>
                  </div>
                </div>
                
                {/* Account Activity */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 p-3 rounded-lg border border-border/20 dark:border-border/30 bg-muted/10">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">Account Activity</h3>
                      <div className="grid gap-4 mt-3 sm:grid-cols-2">
                        <div className="bg-muted/30 border border-border/20 dark:border-border/30 p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Member since</p>
                          <p className="font-medium">{formatDate(user?.createdAt)}</p>
                        </div>
                        {user?.updatedAt && (
                          <div className="bg-muted/30 border border-border/20 dark:border-border/30 p-3 rounded-lg">
                            <p className="text-sm text-muted-foreground">Last updated</p>
                            <p className="font-medium">{formatDate(user.updatedAt)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Bio Section */}
                {user?.bio && (
                  <div className="flex items-start space-x-4 p-3 rounded-lg border border-border/20 dark:border-border/30 bg-muted/10">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-2">About</h3>
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <p className="whitespace-pre-line text-muted-foreground">{user.bio}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          </div>
        </div>
      </main>
  );
}
