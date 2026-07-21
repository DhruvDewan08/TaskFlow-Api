import { Redis } from 'ioredis'

function createRedisClient(): Redis {
  if (process.env.REDIS_URL) {
    return new Redis(process.env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    })
  }

  return new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    lazyConnect: true,
    maxRetriesPerRequest: 3,
  })
}

const redis = createRedisClient()

redis.on('error', (err: Error) => {
  console.error('[Redis] Connection error:', err.message)
})

redis.on('connect', () => {
  console.log('[Redis] Connected')
})

export async function connectRedis(): Promise<void> {
  try {
    await redis.connect()
  } catch (err) {
    if (err instanceof Error) {
      console.warn('[Redis] Could not connect:', err.message)
    }
  }
}

export default redis
