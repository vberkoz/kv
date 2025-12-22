import { RateLimiterMemory } from 'rate-limiter-flexible';
import { RateLimitError } from './errors';
import { logger } from './logger';

const PLAN_RATE_LIMITS = {
  free: { points: 10, duration: 1, burst: 20 },
  starter: { points: 50, duration: 1, burst: 100 },
  pro: { points: 100, duration: 1, burst: 200 },
  scale: { points: 500, duration: 1, burst: 1000 },
  business: { points: 1000, duration: 1, burst: 2000 }
};

const limiters = new Map<string, RateLimiterMemory>();

function getLimiter(plan: string): RateLimiterMemory {
  if (!limiters.has(plan)) {
    const config = PLAN_RATE_LIMITS[plan as keyof typeof PLAN_RATE_LIMITS] || PLAN_RATE_LIMITS.free;
    limiters.set(plan, new RateLimiterMemory({
      points: config.points,
      duration: config.duration
    }));
  }
  return limiters.get(plan)!;
}

export async function checkRateLimitPerSecond(userId: string, plan: string): Promise<{ allowed: boolean; headers: Record<string, string> }> {
  const limiter = getLimiter(plan);
  const config = PLAN_RATE_LIMITS[plan as keyof typeof PLAN_RATE_LIMITS] || PLAN_RATE_LIMITS.free;
  
  try {
    const result = await limiter.consume(userId, 1);
    
    return {
      allowed: true,
      headers: {
        'X-RateLimit-Limit': String(config.points),
        'X-RateLimit-Remaining': String(result.remainingPoints),
        'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + result.msBeforeNext / 1000)
      }
    };
  } catch (error: any) {
    logger.warn('Rate limit exceeded', { userId, plan });
    
    return {
      allowed: false,
      headers: {
        'X-RateLimit-Limit': String(config.points),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + (error.msBeforeNext || 1000) / 1000),
        'Retry-After': String(Math.ceil((error.msBeforeNext || 1000) / 1000))
      }
    };
  }
}
