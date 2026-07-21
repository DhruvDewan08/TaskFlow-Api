import rateLimit from 'express-rate-limit'
import { RedisStore } from 'rate-limit-redis'
import redis from '../lib/redis.js'

function createLimiter(windowMs: number, max: number, prefix: string) {
  const config: Parameters<typeof rateLimit>[0] = {
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later' },
  }

  if (process.env.NODE_ENV !== 'test') {
    config.store = new RedisStore({
      sendCommand: (command: string, ...args: string[]) =>
        redis.call(command, ...args) as Promise<number>,
      prefix: `rl:${prefix}:`,
    })
  }

  return rateLimit(config)
}

export const authLimiter = createLimiter(15 * 60 * 1000, 10, 'auth')
export const apiLimiter = createLimiter(15 * 60 * 1000, 100, 'api')
