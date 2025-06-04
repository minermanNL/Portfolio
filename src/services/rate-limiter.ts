// src/services/rate-limiter.ts
import { redisClient } from '../lib/redis';
import { rateLimitConfigs, ActionType, RateLimitConfig } from '../config/rate-limits';
import { NextApiResponse } from 'next'; // Assuming Next.js for response type

interface RateLimitCheckParams {
  actionType: ActionType;
  identifier: string; // User ID or IP Address
  res?: NextApiResponse; // Optional response object to send 429 directly
}

interface RateLimitResult {
  isAllowed: boolean;
  violatedLimit?: 'hourly' | 'daily';
  remainingHourly?: number;
  remainingDaily?: number;
}

// Simple logger for now
const logBlockedRequest = (params: {
  timestamp: string;
  ipAddress?: string;
  userId?: string;
  actionType: ActionType;
  reason: string;
}) => {
  console.log(`Blocked Request: ${JSON.stringify(params)}`);
  // In a real app, send this to a proper logging service
};

export class RateLimiter {
  private getActionConfig(actionType: ActionType): RateLimitConfig | undefined {
    return rateLimitConfigs[actionType as keyof typeof rateLimitConfigs] as RateLimitConfig | undefined;
  }

  private getRedisKeys(actionType: ActionType, identifier: string): { hourlyKey: string; dailyKey: string } {
    const now = new Date();
    const currentHour = now.toISOString().slice(0, 13); // YYYY-MM-DDTHH
    const currentDay = now.toISOString().slice(0, 10); // YYYY-MM-DD

    return {
      hourlyKey: `rate_limit:${identifier}:${actionType}:hourly:${currentHour}`,
      dailyKey: `rate_limit:${identifier}:${actionType}:daily:${currentDay}`,
    };
  }

  public async checkRateLimit({ actionType, identifier, res }: RateLimitCheckParams): Promise<RateLimitResult> {
    const config = this.getActionConfig(actionType);
    if (!config) {
      console.warn(`Rate limit config not found for action: ${actionType}`);
      return { isAllowed: true }; // Default to allow if no config
    }

    const { hourlyKey, dailyKey } = this.getRedisKeys(actionType, identifier);

    // Increment and check daily limit
    const dailyCount = await redisClient.incr(dailyKey);
    if (dailyCount === 1) { // First request of the day for this action
      await redisClient.expire(dailyKey, 24 * 60 * 60); // Expire in 24 hours
    }
    if (dailyCount > config.daily) {
      if (res) {
        res.status(429).json({
          error: 'Too Many Requests',
          message: `Daily limit for ${actionType} exceeded.`,
          limitType: 'daily',
        });
      }
      logBlockedRequest({
        timestamp: new Date().toISOString(),
        [identifier.includes('.') ? 'ipAddress' : 'userId']: identifier, // Basic check if it's an IP
        actionType,
        reason: `Daily limit exceeded (${dailyCount}/${config.daily})`,
      });
      return { isAllowed: false, violatedLimit: 'daily' };
    }

    // Increment and check hourly limit
    const hourlyCount = await redisClient.incr(hourlyKey);
    if (hourlyCount === 1) { // First request of the hour for this action
      await redisClient.expire(hourlyKey, 60 * 60); // Expire in 1 hour
    }
    if (hourlyCount > config.hourly) {
      if (res) {
        res.status(429).json({
          error: 'Too Many Requests',
          message: `Hourly limit for ${actionType} exceeded.`,
          limitType: 'hourly',
        });
      }
      logBlockedRequest({
        timestamp: new Date().toISOString(),
        [identifier.includes('.') ? 'ipAddress' : 'userId']: identifier,
        actionType,
        reason: `Hourly limit exceeded (${hourlyCount}/${config.hourly})`,
      });
      return { isAllowed: false, violatedLimit: 'hourly' };
    }

    return {
      isAllowed: true,
      remainingDaily: config.daily - dailyCount,
      remainingHourly: config.hourly - hourlyCount,
    };
  }

  // Basic method to get current usage - can be expanded for metrics
  public async getCurrentUsage(actionType: ActionType, identifier: string): Promise<{ hourly: number; daily: number }> {
    const config = this.getActionConfig(actionType);
    if (!config) return { hourly: 0, daily: 0 };

    const { hourlyKey, dailyKey } = this.getRedisKeys(actionType, identifier);
    const hourlyCount = parseInt((await redisClient.get(hourlyKey)) || '0', 10);
    const dailyCount = parseInt((await redisClient.get(dailyKey)) || '0', 10);
    return { hourly: hourlyCount, daily: dailyCount };
  }
}

export const rateLimiter = new RateLimiter();

// --- Middleware for Next.js API routes (example) ---
export function withRateLimit(
  handler: Function, // Adjust type as per your handler signature
  actionType: ActionType,
  getIdentifier: (req: any) => string | undefined // Function to extract user ID or IP
) {
  return async (req: any, res: NextApiResponse) => {
    const identifier = getIdentifier(req);
    if (!identifier) {
      console.warn('Rate limit identifier not found for request.');
       // Or return a 500 error, depending on how strict you want to be
      return handler(req, res); // Proceed if identifier is missing (e.g. for public endpoints not being rate limited by user)
    }

    const { isAllowed } = await rateLimiter.checkRateLimit({
      actionType,
      identifier,
      res, // Pass response to send 429 automatically
    });

    if (isAllowed) {
      return handler(req, res);
    }
    // Response already sent by checkRateLimit if not allowed
  };
}
