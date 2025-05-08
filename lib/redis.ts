import { Redis } from "@upstash/redis";

// Initialize Redis from environment variables (UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN)
const redis = Redis.fromEnv();

export default redis; 