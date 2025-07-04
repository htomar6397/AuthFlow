interface User {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  emailVerified: boolean;
  authToken?: string;
  refreshToken?: string;
}

// Mock database
let users: User[] = [];
let sessions: Record<string, User> = {};

// Helper to generate tokens
const generateToken = (length = 32): string => {
  return Array.from({ length }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
};

// Mock API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockAuth = {
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('authToken');
    return !!token && !!sessions[token];
  },

  // Get current user
  getCurrentUser: (): User | null => {
    const token = localStorage.getItem('authToken');
    return token ? sessions[token] || null : null;
  },

  // Login with email/username and password
  login: async (identifier: string, _password: string): Promise<{ user: User; token: string }> => {
    await delay(500); // Simulate network delay
    
    // In a real app, you would verify the password hash here
    // The underscore prefix indicates this parameter is intentionally unused in this mock implementation
    
    // Find user by email or username
    const user = users.find(u => 
      u.email === identifier || u.username === identifier
    );

    if (!user) {
      throw new Error('Invalid email/username or password');
    }
    
    // In a real app, you would verify the password hash here
    console.log('Skipping password verification in mock implementation');
    
    const token = generateToken();
    const userWithToken = { 
      ...user,
      id: user.id || `user_${Date.now()}`,
      email: user.email || '',
      emailVerified: user.emailVerified || false,
      authToken: token 
    };
    
    sessions[token] = userWithToken;
    localStorage.setItem('authToken', token);
    
    return { 
      user: userWithToken, 
      token 
    };
  },

  // Register new user
  register: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    await delay(500);
    
    if (users.some(u => u.email === email)) {
      throw new Error('Email already registered');
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      email,
      emailVerified: false,
    };

    const token = generateToken();
    const userWithToken = { ...newUser, authToken: token };
    
    users.push(newUser);
    sessions[token] = userWithToken;
    localStorage.setItem('authToken', token);
    
    return { user: userWithToken, token };
  },

  // Send verification email
  sendVerificationEmail: async (email: string): Promise<void> => {
    await delay(500);
    console.log(`Verification email sent to ${email}`);
    // In a real app, this would send an email with a verification link
  },

  // Set current user (for testing)
  setCurrentUser: (user: User): void => {
    const token = localStorage.getItem('authToken');
    if (token) {
      sessions[token] = user;
      // Update the user in the users array
      const userIndex = users.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = user;
      } else {
        users.push(user);
      }
    }
  },

  // Verify email with OTP
  verifyEmail: async (code: string): Promise<boolean> => {
    await delay(500);
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    
    const user = sessions[token];
    if (user) {
      // In a real app, verify the OTP code here
      // For this mock, we'll just check if it's a 6-digit number
      const isValidOTP = /^\d{6}$/.test(code);
      if (isValidOTP) {
        user.emailVerified = true;
        // Update the user in the users array
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
          users[userIndex] = user;
        }
        return true;
      }
    }
    return false;
  },

  // Check if username is available
  checkUsernameAvailability: async (username: string): Promise<boolean> => {
    await delay(300); // Simulate network delay
    return !users.some(u => u.username?.toLowerCase() === username.toLowerCase());
  },

  // Complete user profile
  completeProfile: async (data: {
    firstName: string;
    lastName: string;
    username: string;
    bio: string;
  }): Promise<User> => {
    await delay(500);
    const token = localStorage.getItem('authToken');
    const user = token ? sessions[token] : null;
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    if (users.some(u => u.username?.toLowerCase() === data.username.toLowerCase() && u.id !== user.id)) {
      throw new Error('Username already taken');
    }

    Object.assign(user, data);
    return { ...user };
  },

  // Forgot password - send reset email
  forgotPassword: async (_email: string): Promise<boolean> => {
    await delay(500);
    // In a real app, send a password reset email
    // The underscore prefix indicates this parameter is intentionally unused in this mock implementation
    console.log('Mock: Sending password reset email');
    return true;
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string): Promise<boolean> => {
    await delay(500);
    // In a real app, verify the reset token and update the password
    console.log('Resetting password with token:', token);
    console.log('New password length:', newPassword.length);
    
    // Find user by token (in a real app, you'd verify the token first)
    const userIndex = users.findIndex(u => u.authToken === token);
    
    if (userIndex === -1) {
      console.error('Invalid or expired token');
      return false;
    }
    
    // In a real app, you'd hash the password before saving
    console.log('Password reset successful for user:', users[userIndex].email);
    return true;
  },

  // Logout
  logout: (): void => {
    const token = localStorage.getItem('authToken');
    if (token) {
      delete sessions[token];
      localStorage.removeItem('authToken');
    }
  },

  // Google login
  loginWithGoogle: async (): Promise<{ user: User; token: string }> => {
    await delay(1000);
    
    // Simulate Google user
    const googleUser: User = {
      id: `google_${Date.now()}`,
      email: `user${Date.now()}@gmail.com`,
      firstName: 'Google',
      lastName: 'User',
      username: `googleuser${Date.now()}`,
      emailVerified: true,
    };

    const token = generateToken();
    const userWithToken = { ...googleUser, authToken: token };
    
    // Check if user already exists
    const existingUserIndex = users.findIndex(u => u.email === googleUser.email);
    if (existingUserIndex >= 0) {
      users[existingUserIndex] = { ...users[existingUserIndex], ...googleUser };
    } else {
      users.push(googleUser);
    }
    
    sessions[token] = userWithToken;
    localStorage.setItem('authToken', token);
    
    return { user: userWithToken, token };
  }
};
