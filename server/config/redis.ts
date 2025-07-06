import Redis from 'ioredis';

// Parse the Redis URL
const redisUrl = new URL(process.env.REDIS_URL || 'redis://localhost:6379');

// Extract connection details
const redisConfig = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port),
  username: redisUrl.username,
  password: redisUrl.password,
  tls: {
    // Required for Upstash Redis
    rejectUnauthorized: false,
  },
  // Better handling for timeouts
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  // Better error handling
  reconnectOnError: (err: Error) => {
    console.error('Redis connection error:', err.message);
    return true; // Will reconnect
  },
};

// Create Redis client
const client = new Redis(redisConfig);

// Handle connection events
client.on('connect', () => {
  console.log('Redis client connected');
});

client.on('error', err => {
  console.error('Redis error:', err.message);
});

// Handle process termination
process.on('SIGINT', async () => {
  await client.quit();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await client.quit();
  process.exit(0);
});

export { client };
