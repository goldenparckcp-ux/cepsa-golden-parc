// Redis-based Rate Limiting Utility using Upstash REST API

export async function rateLimit(
  ip: string,
  limit: number = 100, // max requests
  windowMs: number = 60000 // timeframe in milliseconds (e.g., 1 minute)
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const now = Date.now();
  const windowSeconds = Math.ceil(windowMs / 1000);
  const key = `ratelimit:${ip}:${windowSeconds}`;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn("Upstash Redis credentials missing. Falling back to fail-open.");
    return {
      success: true,
      limit,
      remaining: limit,
      reset: now + windowMs,
    };
  }

  try {
    // Run an atomic Lua script to increment and set expiration if it's the first request
    const response = await fetch(`${url}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        "EVAL",
        "local c = redis.call('incr', KEYS[1]); if c == 1 then redis.call('expire', KEYS[1], ARGV[1]) end; return c;",
        "1",
        key,
        windowSeconds.toString()
      ]),
    });

    if (!response.ok) {
      throw new Error(`Upstash response status: ${response.status}`);
    }

    const data = await response.json();
    const count = parseInt(data.result ?? "0", 10);

    const remaining = Math.max(0, limit - count);
    const success = count <= limit;
    const reset = now + windowMs;

    return {
      success,
      limit,
      remaining,
      reset,
    };
  } catch (err) {
    console.error("Rate limiter Redis call failed, failing open:", err);
    return {
      success: true,
      limit,
      remaining: limit,
      reset: now + windowMs,
    };
  }
}
