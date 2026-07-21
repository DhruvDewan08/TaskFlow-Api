import express, { Request, Response } from 'express'
import prisma from '../prisma.js'

const router = express.Router()

// GET /todos — fetch all todos for the logged-in user
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const todos = await prisma.todo.findMany({
    where: { userId: req.userId },
  })
  res.json(todos)
})

// POST /todos — create a new todo
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { task } = req.body as { task: string }

  const todo = await prisma.todo.create({
    data: {
      task,
      userId: req.userId as number,
    },
  })
  res.json(todo)
})

// PUT /todos/:id — toggle completed status
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  const { completed } = req.body as { completed: boolean }
  const id: number = parseInt(req.params.id as string, 10)

  const updatedTodo = await prisma.todo.update({
    where: {
      id,
      userId: req.userId,
    },
    data: {
      completed: !!completed,
    },
  })
  res.json(updatedTodo)
})

// DELETE /todos/:id — delete a todo
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const id: number = parseInt(req.params.id as string, 10)
  const userId = req.userId

  await prisma.todo.delete({
    where: { id, userId },
  })
  res.json({ message: 'Todo deleted' })
})

export default router
