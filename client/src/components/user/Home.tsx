import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Mail, User, Edit, Lock } from 'lucide-react';
import { useAuthStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function Home() {
  const { user, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        name: formData.name,
        bio: formData.bio
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-8 px-4 md:px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Profile Header */}
          <div className="flex flex-col items-center text-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src="" alt={user?.name || user?.email} />
              <AvatarFallback className="text-2xl">
                {getInitials(`${user?.name}`.trim() || user?.email)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">
                {user?.name || 'Welcome to AuthFlow'}
              </h1>
              {user?.username && (
                <p className="text-muted-foreground">@{user?.username}</p>
              )}
            </div>
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditing(!isEditing);
                  setShowPasswordForm(false);
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setShowPasswordForm(!showPasswordForm);
                  if (showPasswordForm) setIsEditing(false);
                }}
              >
                <Lock className="mr-2 h-4 w-4" />
                {showPasswordForm ? 'Cancel' : 'Change Password'}
              </Button>
            </div>
          </div>

          {/* Edit Profile Form */}
          {isEditing && (
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Save Changes</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Change Password Form */}
          {showPasswordForm && (
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/reset-password')}
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Profile Information */}
          {!isEditing && !showPasswordForm && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  View your account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p>{user?.name || 'Not set'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p>{user?.email}</p>
                    <p className={`text-sm ${user?.isEmailVerified ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {user?.isEmailVerified ? 'Email verified' : 'Email not verified'}
                    </p>
                  </div>
                </div>

                {user?.username && (
                  <div className="flex items-center gap-4">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Username</p>
                      <p>@{user?.username}</p>
                    </div>
                  </div>
                )}

                {user?.bio && (
                  <div className="flex items-start gap-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mt-1 text-muted-foreground flex-shrink-0"
                    >
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" x2="8" y1="13" y2="13" />
                      <line x1="16" x2="8" y1="17" y2="17" />
                      <line x1="10" x2="8" y1="9" y2="9" />
                    </svg>
                    <div>
                      <p className="text-sm text-muted-foreground">Bio</p>
                      <p className="whitespace-pre-line">{user?.bio}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Member since</p>
                    <p>
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }) : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
