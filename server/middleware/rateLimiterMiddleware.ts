import { Request, Response, NextFunction } from 'express';
import RateLimiterRedis from 'rate-limiter-flexible/lib/rateLimiterRedis';
import { client } from '../config/redis';
import AppError from './AppError';

// Helper function to format duration in milliseconds to human-readable format
const formatTime = (ms: number): string => {
  const seconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  return `${seconds} second${seconds !== 1 ? 's' : ''}`;
};

// Helper function to format duration in milliseconds to human-readable format
const formatDuration = (ms: number): string => {
  const seconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours >= 1) return `${hours} hour${hours > 1 ? 's' : ''}`;
  if (minutes >= 1) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  return `${seconds} second${seconds !== 1 ? 's' : ''}`;
};

interface RateLimitConfig {
  points: number;
  duration: number;
  message: string | ((this: RateLimitConfig, msBeforeNext: number) => string);
  blockDuration?: number;
}

interface RateLimitConfigs {
  default: RateLimitConfig;
  auth: RateLimitConfig;
  passwordReset: RateLimitConfig;
  usernameCheck: RateLimitConfig;
  accountCreation: RateLimitConfig;
  verifyotp: RateLimitConfig;
  resendOtp: RateLimitConfig;
}

// Your existing rate limit configurations
const rateLimitConfigs: RateLimitConfigs = {
  default: {
    points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900', 10),
    message: function(msBeforeNext: number) {
      const timeLeft = formatTime(msBeforeNext);
      const duration = this.duration * 1000;
      return `Too many requests. You can only make ${this.points} requests per ${formatDuration(duration)}. Try again in ${timeLeft}.`;
    },
  },
  auth: {
    points: 20,
    duration: 15 * 60,
    message: function(msBeforeNext: number) {
      const timeLeft = formatTime(msBeforeNext);
      const duration = this.duration * 1000;
      return `Too many login attempts. You can only try ${this.points} times every ${formatDuration(duration)}. Try again in ${timeLeft}.`;
    },
  },
  passwordReset: {
    points: 5,
    duration: 60 * 60,
    message: function(msBeforeNext: number) {
      const timeLeft = formatTime(msBeforeNext);
      const duration = this.duration * 1000;
      return `Too many password reset attempts. You can only request ${this.points} resets every ${formatDuration(duration)}. Try again in ${timeLeft}.`;
    },
  },
  usernameCheck: {
    points: 30,
    duration: 60,
    message: function(msBeforeNext: number) {
      const timeLeft = formatTime(msBeforeNext);
      const duration = this.duration * 1000;
      return `Too many username checks. You can check ${this.points} usernames per minute. Try again in ${timeLeft}.`;
    },
  },
  accountCreation: {
    points: 5,
    duration: 60 * 60,
    message: function(msBeforeNext: number) {
      const timeLeft = formatTime(msBeforeNext);
      return `Too many account creation attempts. You can only create ${this.points} accounts per hour. Try again in ${timeLeft}.`;
    },
  },
  verifyotp: {
    points: 5,
    duration: 60 * 60,
    blockDuration: 60 * 60,
    message: function(this: RateLimitConfig, msBeforeNext: number) {
      const timeLeft = formatTime(msBeforeNext);
      return `Too many OTP attempts. You can only try ${this.points} times. Try again in ${timeLeft}.`;
    },
  },
  resendOtp: {
    points: 3,
    duration: 60 * 5,
    blockDuration: 60 * 60,
    message: function(this: RateLimitConfig, msBeforeNext: number) {
      const timeLeft = formatTime(msBeforeNext);
      return `Too many OTP resend attempts. You can only request ${this.points} OTPs. Try again in ${timeLeft}.`;
    },
  },
};

// Create rate limiter instances
const rateLimiters = new Map<string, RateLimiterRedis>();

const getRateLimiter = (configKey: keyof typeof rateLimitConfigs): RateLimiterRedis => {
  if (!rateLimiters.has(configKey)) {
    const config = rateLimitConfigs[configKey];
    rateLimiters.set(
      configKey,
      new RateLimiterRedis({
        storeClient: client,
        keyPrefix: `rate_limit:${configKey}`,
        points: config.points,
        duration: config.duration,
        blockDuration: config.blockDuration,
        // Ensures we don't block the event loop
        execEvenly: false,
        // Ensures we don't queue requests
        inmemoryBlockOnConsumed: config.points + 1,
        inmemoryBlockDuration: 60, // Block for 60 seconds if Redis is down
      })
    );
  }
  return rateLimiters.get(configKey)!;
};

// The main rate limiting middleware
export const applyRateLimit = async (req: Request, res: Response, next: NextFunction) => {
  const path: string = req.path;
  const ip: string = req.ip || 'unknown';

  try {
    let configKey: keyof typeof rateLimitConfigs;

    // Your existing path matching logic
    if (path.startsWith('/api/auth/forgot-password')) {
      configKey = 'passwordReset';
    } else if (path.startsWith('/api/auth/register')) {
      configKey = 'accountCreation';
    } else if (path.startsWith('/api/auth/check-username')) {
      configKey = 'usernameCheck';
    } else if (path.startsWith('/api/auth/verify-otp')) {
      configKey = 'verifyotp';
    } else if (path.startsWith('/api/auth/resend-otp')) {
      configKey = 'resendOtp';
    } else if (path.startsWith('/api/auth')) {
      configKey = 'auth';
    } else {
      configKey = 'default';
    }

    const config = rateLimitConfigs[configKey];
    const rateLimiter = getRateLimiter(configKey);

    try {
      const rateLimitRes = await rateLimiter.consume(ip);

      // Set rate limit headers
      res.set({
        'X-RateLimit-Limit': config.points.toString(),
        'X-RateLimit-Remaining': rateLimitRes.remainingPoints.toString(),
        'X-RateLimit-Reset': new Date(Date.now() + rateLimitRes.msBeforeNext).toISOString(),
      });

      next();
    } catch (rateLimitRes: any) {
      const isOtpPath = path.startsWith('/api/auth/verify-otp');
      const retryAfter = Math.ceil(rateLimitRes.msBeforeNext / 1000);

      res.set('Retry-After', (retryAfter / 60).toString() + 'm');

      let errorMessage: string;
      if (isOtpPath) {
        const timeLeft = formatTime(rateLimitRes.msBeforeNext);
        errorMessage = `Too many OTP attempts. You can only try ${config.points} times. Try again in ${timeLeft}.`;
      } else if (typeof config.message === 'function') {
        errorMessage = config.message(rateLimitRes.msBeforeNext);
      } else {
        errorMessage = config.message;
      }
      next(new AppError(errorMessage, 429));
    }
  } catch (error) {
    console.error('Rate limiter error:', error);
    // If Redis is down, allow the request to proceed
    next();
  }
};

// Graceful shutdown
/**
 * Called when the process receives a SIGINT signal (e.g. Ctrl+C).
 * Closes the Redis client connection and exits the process with a status code of 0.
 */
process.on('SIGINT', async () => {
  await client.quit();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await client.quit();
  process.exit(0);
});

export default applyRateLimit;
