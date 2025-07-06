import { Request, Response, NextFunction } from 'express';
import RateLimiterRedis from 'rate-limiter-flexible/lib/rateLimiterRedis';
import { client } from '../config/redis';
import AppError from './AppError';

interface RateLimitConfig {
  points: number;
  duration: number;
  message: string;
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
    message: 'Too many requests, try again later',
  },
  auth: {
    points: 20,
    duration: 15 * 60,
    message: 'Too many auth attempts, try again later',
  },
  passwordReset: {
    points: 5,
    duration: 60 * 60,
    message: 'Too many password resets, try again later',
  },
  usernameCheck: {
    points: 30,
    duration: 60,
    message: 'Too many username checks, wait a minute',
  },
  accountCreation: {
    points: 5,
    duration: 60 * 60,
    message: 'Too many accounts created, try again in an hour',
  },
  verifyotp: {
    points: 5,
    duration: 60 * 60,
    blockDuration: 60 * 60,
    message: 'Too many OTP attempts, try again later',
  },
  resendOtp: {
    points: 3,
    duration: 60 * 60,
    blockDuration: 60 * 60,
    message: 'Too many OTP resend attempts, try again later',
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

      next(
        new AppError(isOtpPath ? 'Too many OTP attempts, try again later' : config.message, 429)
      );
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
