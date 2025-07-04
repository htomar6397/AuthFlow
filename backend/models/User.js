import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "Human Being",
    trim: true
  },
  username: {
    type: String,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9_]+$/,
    default: null,
    // ← **no** `unique` or `sparse` here
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  bio: {
    type: String,
    default: "I'm a human being on a mission to make the world a better place...",
    maxlength: 500
  },
  password: {
    type: String,
    required: true
  },
  refreshToken: {
    token: String,
    expires: Date,
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  lastLoginAttempt: {
    type: Date,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  accountLockedUntil: {
    type: Date,
    default: null
  },
  lastPasswordReset: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// **Create just one** sparse+unique index on username:
userSchema.index(
  { username: 1 },
  { unique: true, sparse: true }
);

const User = mongoose.model('User', userSchema);
export default User;
