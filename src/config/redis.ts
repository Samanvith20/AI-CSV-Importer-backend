import RedisPkg from 'ioredis';
import { env } from './env.js';

const Redis = (RedisPkg as any).default ?? RedisPkg;

const isUpstash = env.UPSTASH_URL.includes('upstash.io') || env.UPSTASH_URL.startsWith('rediss://');

export const redisConnection = new Redis(env.UPSTASH_URL, {
  ...(isUpstash ? { tls: {} } : {}),
  maxRetriesPerRequest: null,
});

redisConnection.on('error', (err: any) => {
  console.log('Redis connection error:', err);
});
