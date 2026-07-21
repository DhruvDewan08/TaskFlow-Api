import createApp from './app.js'
import { connectRedis } from './lib/redis.js'

const PORT: number = Number(process.env.PORT) || 5003

async function start(): Promise<void> {
  await connectRedis()

  const app = createApp()

  app.listen(PORT, () => {
    console.log(`Server started on port: ${PORT}`)
  })
}

start().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
