import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import User, { IUser } from '../models/User';
import mongoose from 'mongoose';

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key';
const JWT_ACCESS_EXPIRES_IN: string = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const JWT_ISSUER: string = process.env.JWT_ISSUER || 'authflow-app';
const REFRESH_EXPIRES_DAYS: number = parseInt(process.env.REFRESH_EXPIRES_DAYS || '7', 10); // configurable

interface AccessTokenPayload {
  id: string;
  email: string;
  username?: string | null;
  type: 'access';
}

interface DecodedToken {
  valid: boolean;
  expired?: boolean;
  error?: string;
  decoded?: AccessTokenPayload;
}

// Generate access JWT
const generateAccessToken = (user: IUser): string => {
  const payload: AccessTokenPayload = {
    id: (user._id as mongoose.Types.ObjectId).toString(),
    email: user.email,
    username: user.username,
    type: 'access',
  };

  const options: jwt.SignOptions = {
    expiresIn: JWT_ACCESS_EXPIRES_IN as unknown as number,
    issuer: JWT_ISSUER,
    subject: (user._id as mongoose.Types.ObjectId).toString(),
  };

  return jwt.sign(payload, JWT_SECRET, options);
};

// Generate opaque refresh token (random string)
const generateOpaqueToken = (): string => crypto.randomBytes(40).toString('hex');

// Save refresh token in DB
const saveRefreshToken = async (userId: string, token: string): Promise<void> => {
  const expires = Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000;

  await User.findByIdAndUpdate(new mongoose.Types.ObjectId(userId), {
    refreshToken: {
      token,
      expires,
    },
  });
};

// Generate both tokens
const generateAuthTokens = async (
  user: IUser
): Promise<{ accessToken: string; refreshToken: string }> => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateOpaqueToken();
  await saveRefreshToken(user._id.toString(), refreshToken);

  return { accessToken, refreshToken };
};

// Verify access token
const verifyAccessToken = (token: string): DecodedToken => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { issuer: JWT_ISSUER }) as AccessTokenPayload;
    if (decoded.type !== 'access') throw new Error('Invalid token type');
    return { valid: true, decoded };
  } catch (err: any) {
    return {
      valid: false,
      expired: err.name === 'TokenExpiredError',
      error: err.message,
    };
  }
};

// Refresh tokens
const refreshTokens = async (
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  const user = await User.findOne({ 'refreshToken.token': refreshToken });
  if (
    !user ||
    !user.refreshToken ||
    (user.refreshToken.expires as unknown as number) < Date.now()
  ) {
    throw new Error('Invalid or expired refresh token');
  }

  // Generate new tokens
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateOpaqueToken();

  // Rotate refresh token
  await saveRefreshToken(user._id.toString(), newRefreshToken);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

// Logout
const invalidateRefreshToken = async (userId: string): Promise<void> => {
  await User.findByIdAndUpdate(new mongoose.Types.ObjectId(userId), {
    $unset: { refreshToken: '' },
  });
};

export { generateAuthTokens, verifyAccessToken, refreshTokens, invalidateRefreshToken };
