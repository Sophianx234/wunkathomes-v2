import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create once, reuse across your app
const redis = Redis.fromEnv();

export const rateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"), // 5 requests per 60 seconds
  analytics: true,
  prefix: "@upstash/ratelimit",
});
