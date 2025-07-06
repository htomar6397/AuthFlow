declare module 'rate-limiter-flexible/lib/rateLimiterRedis' {
  import { Redis, Cluster } from 'ioredis';
  import { RateLimiterAbstract, RateLimiterRes } from 'rate-limiter-flexible';

  export default class RateLimiterRedis extends RateLimiterAbstract {
    constructor(options: {
      storeClient: Redis | Cluster;
      points?: number;
      duration?: number;
      blockDuration?: number;
      keyPrefix?: string;
      inmemoryBlockOnConsumed?: number;
      inmemoryBlockDuration?: number;
      insuranceLimiter?: RateLimiterAbstract;
      storeType?: string;
      dbName?: string;
      tableName?: string;
      tableCreated?: boolean;
      clearExpiredByTimeout?: boolean;
      execEvenly?: boolean;
      execEvenlyMinDelayMs?: number;
      indexKeyPrefix?: Record<string, string>;
      maxQueueSize?: number;
      omitResponseHeaders?: boolean;
      errorMessage?: string;
      customResponseSchema?: (limiterResponse: any) => any;
    });
  }
}
