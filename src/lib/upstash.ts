import { Redis } from '@upstash/redis';

// Initialize the Upstash Redis instance
// We check for process.env because these might be missing in local dev unless configured
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || 'https://placeholder.upstash.io',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || 'placeholder-token',
});
