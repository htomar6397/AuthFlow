import mongoose, { Document, Schema } from 'mongoose';

interface IRefreshToken {
  token: string;
  expires: Date;
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  username?: string;
  email: string;
  bio: string;
  password: string;
  googleId?: string;
  refreshToken?: IRefreshToken;
  isEmailVerified: boolean;
  lastLoginAttempt: Date | null;
  loginAttempts: number;
  accountLockedUntil: Date | null;
  lastPasswordReset: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: 'Human Being',
    },
    googleId: {
      type: String,
      select: false,
    },
    password: {
      type: String,
      required: true,
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false,
    },
    username: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-zA-Z0-9_]+$/,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    bio: {
      type: String,
      default: "I'm a human being on a mission to make the world a better place...",
      maxlength: 500,
    },
    refreshToken: {
      token: String,
      expires: Date,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    lastLoginAttempt: {
      type: Date,
      default: null,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    accountLockedUntil: {
      type: Date,
      default: null,
    },
    lastPasswordReset: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for unique constraints, only applied when field exists and is string
userSchema.index(
  { username: 1 },
  {
    unique: true,
    partialFilterExpression: { username: { $type: 'string' } },
  }
);

userSchema.index(
  { googleId: 1 },
  {
    unique: true,
    partialFilterExpression: { googleId: { $type: 'string' } },
  }
);

const User = mongoose.model<IUser>('User', userSchema);
export default User;
