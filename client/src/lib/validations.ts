import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().min(1, { message: 'Email or username is required' }),
  password: z.string().min(1, { message: 'Password is required' })
});

export const registerSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' })
    .regex(/[^a-zA-Z0-9]/, { message: 'Password must contain at least one special character' }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

// Profile update validation
export const updateProfileSchema = z.object({
  name: z.string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(50, { message: 'Name must be less than 50 characters' })
    .optional(),
  username: z.string()
    .min(3, { message: 'Username must be at least 3 characters' })
    .max(20, { message: 'Username must be less than 20 characters' })
    .regex(/^[a-zA-Z0-9_]+$/, { 
      message: 'Username can only contain letters, numbers, and underscores' 
    })
    .optional(),
  bio: z.string()
    .max(200, { message: 'Bio must be less than 200 characters' })
    .optional(),
  avatar: z.string().url({ message: 'Avatar must be a valid URL' }).optional()
});

// Password change validation
export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, { message: 'Current password is required' })
    .min(8, { message: 'Current password must be at least 8 characters' }),
  newPassword: z.string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[a-z]/, { message: 'Must contain at least one lowercase letter' })
    .regex(/[A-Z]/, { message: 'Must contain at least one uppercase letter' })
    .regex(/[0-9]/, { message: 'Must contain at least one number' })
    .regex(/[^a-zA-Z0-9]/, { message: 'Must contain at least one special character' }),
  confirmNewPassword: z.string()
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"]
});

// Export types
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export const checkPasswordStrength = (password: string) => {
  let strength = 0;
  const requirements = [
    { regex: /.{8,}/, message: 'At least 8 characters' }, // min 8 chars
    { regex: /[a-z]/, message: 'Lowercase letter' }, // lowercase
    { regex: /[A-Z]/, message: 'Uppercase letter' }, // uppercase
    { regex: /[0-9]/, message: 'Number' }, // number
    { regex: /[^a-zA-Z0-9]/, message: 'Special character' } // special char
  ];

  const messages: string[] = [];
  
  requirements.forEach(requirement => {
    if (requirement.regex.test(password)) {
      strength++;
    } else {
      messages.push(requirement.message);
    }
  });

  // Calculate strength percentage
  const strengthPercentage = (strength / requirements.length) * 100;
  
  // Determine strength level
  let strengthLevel = 'weak';
  if (strengthPercentage >= 80) {
    strengthLevel = 'strong';
  } else if (strengthPercentage >= 50) {
    strengthLevel = 'moderate';
  }

  return {
    strength: strengthLevel,
    percentage: strengthPercentage,
    messages: messages.length > 0 ? messages : ['Strong password!']
  };
};
