import express, { Application } from 'express'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/authRoutes.js'
import todoRoutes from './routes/todoRoutes.js'
import authMiddleware from './middleware/authMiddleware.js'

const app: Application = express()
const PORT: number = Number(process.env.PORT) || 5003

const __filename: string = fileURLToPath(import.meta.url)
const __dirname: string = dirname(__filename)

// Middleware
app.use(express.json())
app.use(express.static(path.join(__dirname, '../public')))

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'))
})

// Routes
app.use('/auth', authRoutes)
app.use('/todos', authMiddleware, todoRoutes)

app.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`)
})
