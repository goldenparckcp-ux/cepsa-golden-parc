// Basic Rate Limiting Utility using an in-memory Map
// Note: For multi-region serverless or edge deployments, a Redis-based solution (like Upstash) is recommended.
// This in-memory solution works well for single-instance or basic protection.

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

export function rateLimit(
  ip: string,
  limit: number = 100, // max requests
  windowMs: number = 60000 // timeframe in milliseconds (e.g., 1 minute)
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  const windowData = rateLimitMap.get(ip) || { count: 0, lastReset: now };

  // Reset window if timeframe has passed
  if (now - windowData.lastReset > windowMs) {
    windowData.count = 0;
    windowData.lastReset = now;
  }

  // Increment request count
  windowData.count += 1;
  rateLimitMap.set(ip, windowData);

  const remaining = Math.max(0, limit - windowData.count);
  const success = windowData.count <= limit;
  const reset = windowData.lastReset + windowMs;

  return {
    success,
    limit,
    remaining,
    reset,
  };
}
