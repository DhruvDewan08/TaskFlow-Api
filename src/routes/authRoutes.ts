import express, { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../prisma.js'

const router = express.Router()

// POST /auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body as { username: string; password: string }

  const hashedPassword: string = bcrypt.hashSync(password, 8)

  try {
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    })

    // Create a default todo for the new user
    const defaultTodo = `Hello :) Add your first todo!`
    await prisma.todo.create({
      data: {
        task: defaultTodo,
        userId: user.id,
      },
    })

    const token: string = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    )

    res.json({ token })
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message)
    }
    res.sendStatus(503)
  }
})

// POST /auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body as { username: string; password: string }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    })

    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    const passwordIsValid: boolean = bcrypt.compareSync(password, user.password)

    if (!passwordIsValid) {
      res.status(401).json({ message: 'Invalid password' })
      return
    }

    const token: string = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    )

    res.json({ token })
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message)
    }
    res.sendStatus(503)
  }
})

export default router
