import Redis from "ioredis";
import { config } from "@/app/api/config";

const redis = new Redis({
  username: config.redis.username,
  password: config.redis.password,
  host: config.redis.host,
  port: config.redis.port,
});

export const redisClient = redis;
