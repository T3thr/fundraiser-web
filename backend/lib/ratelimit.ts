// @/backend/lib/rateLimit.ts
import { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Extend NextRequest to include the ip property
interface CustomNextRequest extends NextRequest {
  ip?: string; // Optional property
}

export async function rateLimit(req: CustomNextRequest) {
  const ip = req.ip ?? '127.0.0.1';
  const key = `ratelimit_${ip}`;
  
  const window = 60 * 1000; // 1 minute
  const limit = 10; // requests per window

  const current = await redis.get<number>(key) || 0;
  
  if (current > limit) {
    return { success: false };
  }

  await redis.pipeline()
    .incr(key)
    .expire(key, window)
    .exec();

  return { success: true };
}
