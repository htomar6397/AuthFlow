import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const JWT_ISSUER = process.env.JWT_ISSUER || 'authflow-app';
const REFRESH_EXPIRES_DAYS = process.env.REFRESH_EXPIRES_DAYS || 7; // configurable

// Generate access JWT
const generateAccessToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    username: user.username,
    type: 'access',
  };

  const options = {
    expiresIn: JWT_ACCESS_EXPIRES_IN,
    issuer: JWT_ISSUER,
    subject: user._id.toString(),
  };

  return jwt.sign(payload, JWT_SECRET, options);
};

// Generate opaque refresh token (random string)
const generateOpaqueToken = () => crypto.randomBytes(40).toString('hex');

// Save refresh token in DB
const saveRefreshToken = async (userId, token) => {
  const expires = new Date();
  expires.setDate(expires.getDate() + Number(REFRESH_EXPIRES_DAYS));

  await User.findByIdAndUpdate(userId, {
    refreshToken: {
      token,
      expires,
    },
  });
};

// Generate both tokens
const generateAuthTokens = async (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateOpaqueToken();
  await saveRefreshToken(user._id, refreshToken);

  return { accessToken, refreshToken };
};

// Verify access token
const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { issuer: JWT_ISSUER });
    if (decoded.type !== 'access') throw new Error('Invalid token type');
    return { valid: true, decoded };
  } catch (err) {
    return {
      valid: false,
      expired: err.name === 'TokenExpiredError',
      error: err.message,
    };
  }
};

// Refresh tokens
const refreshTokens = async (refreshToken) => {
  const user = await User.findOne({ 'refreshToken.token': refreshToken });
  if (!user || new Date(user.refreshToken.expires) < new Date()) {
    throw new Error('Invalid or expired refresh token');
  }

  // Generate new tokens
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateOpaqueToken();

  // Rotate refresh token
  await saveRefreshToken(user._id, newRefreshToken);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

// Logout
const invalidateRefreshToken = async (userId) => {
  await User.findByIdAndUpdate(userId, { $unset: { refreshToken: "" } });
};

export {
  generateAuthTokens,
  verifyAccessToken,
  refreshTokens,
  invalidateRefreshToken,
};
