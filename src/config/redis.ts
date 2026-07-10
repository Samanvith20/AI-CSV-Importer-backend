import RedisPkg from 'ioredis';
import { env } from './env.js';

const Redis = (RedisPkg as any).default ?? RedisPkg;

export const redisConnection = new Redis(env.UPSTASH_URL, {
  tls: {},
  maxRetriesPerRequest: null,
});

redisConnection.on('error', (err: any) => {
  console.log('Redis connection error:', err);
});
