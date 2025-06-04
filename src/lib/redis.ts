// src/lib/redis.ts
import { Redis } from '@upstash/redis';

// Get Upstash connection details from environment variables
const upstashRedisRestUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashRedisRestToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!upstashRedisRestUrl || !upstashRedisRestToken) {
  console.error("UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN environment variable is not set. Upstash Redis client will not be initialized correctly.");
  // Depending on your application's needs, you might want to throw an error here
  // or handle the absence of credentials gracefully (e.g., use a fallback).
  // For this example, we'll proceed but the client won't work without the vars.
}

export const redisClient = new Redis({
  url: upstashRedisRestUrl,
  token: upstashRedisRestToken,
});

// Upstash Redis client does not have connection event listeners like ioredis
// as it's a REST client, not a persistent connection.

// You can now use redisClient for operations like:
// await redisClient.incr(key);
// await redisClient.expire(key, seconds);
// await redisClient.get(key);
