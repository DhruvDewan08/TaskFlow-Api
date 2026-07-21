import express, { Application } from 'express'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/authRoutes.js'
import taskRoutes from './routes/taskRoutes.js'
import authMiddleware from './middleware/authMiddleware.js'
import { authLimiter, apiLimiter } from './middleware/rateLimiter.js'
import { errorHandler } from './middleware/errorHandler.js'
import { setupSwagger } from './config/swagger.js'

const __filename: string = fileURLToPath(import.meta.url)
const __dirname: string = dirname(__filename)

export function createApp(): Application {
  const app: Application = express()

  app.use(express.json())
  app.use(express.static(path.join(__dirname, '../public')))

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  setupSwagger(app)

  app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'))
  })

  app.use('/auth', authLimiter, authRoutes)
  app.use('/tasks', apiLimiter, authMiddleware, taskRoutes)

  app.use(errorHandler)

  return app
}

export default createApp
