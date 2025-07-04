import { RateLimiterMemory } from 'rate-limiter-flexible';

// Store rate limiters per IP and endpoint
const rateLimiters = new Map();

// Rate limit configurations
const rateLimitConfigs = {
  // Standard API (100 reqs / 15m per IP)
  default: {
    points: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
    duration: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60, // 15 minutes in seconds
    message: 'Too many requests, try again later'
  },
  auth: {
    points: 20,
    duration: 15 * 60, // 15 minutes
    message: 'Too many auth attempts, try again later'
  },
  passwordReset: {
    points: 5,
    duration: 60 * 60, // 1 hour
    message: 'Too many password resets, try again later'
  },
  usernameCheck: {
    points: 30,
    duration: 60, // 1 minute
    message: 'Too many username checks, wait a minute'
  },
  accountCreation: {
    points: 5,
    duration: 60 * 60, // 1 hour
    message: 'Too many accounts created, try again in an hour'
  },
  verifyotp: {
    points: 5,
    duration: 60 * 60, // 1 hour
    blockDuration: 60 * 60, // 1 hour
    message: 'Too many OTP attempts, try again later'
  },
  resendOtp: {
    points: 3,
    duration: 60 * 60, // 1 hour
    blockDuration: 60 * 60, // 1 hour
    message: 'Too many OTP attempts, try again later'
  }
};

// Helper function to get or create a rate limiter for an IP and endpoint
function getRateLimiter(ip, options) {
  const { key, points, duration, blockDuration } = options;
  const cacheKey = `${ip}_${key}`;
  
  if (!rateLimiters.has(cacheKey)) {
    rateLimiters.set(cacheKey, new RateLimiterMemory({
      points,
      duration,
      blockDuration: blockDuration || duration,
      keyPrefix: cacheKey
    }));
  }
  
  return rateLimiters.get(cacheKey);
}

// Clean up old rate limiters periodically
setInterval(() => {
  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);
  
  for (const [key, limiter] of rateLimiters.entries()) {
    if (limiter.lastExpireTime && limiter.lastExpireTime < oneHourAgo) {
      rateLimiters.delete(key);
    }
  }
}, 60 * 60 * 1000); // Check every hour

// Export the rate limiting middleware
export const applyRateLimit = async (req, res, next) => {
  const path = req.path;
  const ip = req.ip;
  
  try {
    let config;
    let limiterKey;
    
    // Determine which rate limit config to use
    if (path.startsWith('/api/auth/forgot-password')) {
      config = rateLimitConfigs.passwordReset;
      limiterKey = 'passwordReset';
    } else if (path.startsWith('/api/auth/register')) {
      config = rateLimitConfigs.accountCreation;
      limiterKey = 'accountCreation';
    } else if (path.startsWith('/api/auth/check-username')) {
      config = rateLimitConfigs.usernameCheck;
      limiterKey = 'usernameCheck';
    } else if (path.startsWith('/api/auth/verify-otp')) {
      config = rateLimitConfigs.verifyotp;  
      limiterKey = 'verifyotp';
    } else if (path.startsWith('/api/auth/resend-otp')) {
      config = rateLimitConfigs.resendOtp;  
      limiterKey = 'resendOtp';
    } else if (path.startsWith('/api/auth')) {
      config = rateLimitConfigs.auth;
      limiterKey = 'auth';
    } else {
      // Default for all other /api routes
      config = rateLimitConfigs.default;
      limiterKey = 'default';
    }
    
    // Get or create rate limiter for this IP and endpoint
    const limiter = getRateLimiter(ip, {
      key: limiterKey,
      points: config.points,
      duration: config.duration,
      blockDuration: config.blockDuration
    });
    
    // Consume a point
    const rateLimitRes = await limiter.consume(ip);
    
    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': config.points,
      'X-RateLimit-Remaining': rateLimitRes.remainingPoints,
      'X-RateLimit-Reset': new Date(Date.now() + rateLimitRes.msBeforeNext).toISOString()
    });
    
    return next();
    
  } catch (rateLimitRes) {
    const isOtpPath = path.startsWith('/api/auth/verify-otp');
    const retryAfter = Math.ceil(rateLimitRes.msBeforeNext / 1000);
    
    res.set('Retry-After', retryAfter);
    
    return res.status(429).json({
      status: 'error',
      message: isOtpPath 
        ? 'Too many OTP attempts, try again later'
        : 'Too many requests, please slow down',
      retryAfter,
      retryAfterFormatted: retryAfter > 60 
        ? `${Math.ceil(retryAfter / 60)} minutes`
        : `${retryAfter} seconds`
    });
  }
};
