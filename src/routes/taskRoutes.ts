import express, { Request, Response, NextFunction } from 'express'
import prisma from '../prisma.js'
import { validate } from '../middleware/validate.js'
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdSchema,
} from '../schemas/taskSchemas.js'
import { AppError } from '../middleware/errorHandler.js'
import { z } from 'zod'

const router = express.Router()

const listTasksQuerySchema = z.object({
  completed: z.enum(['true', 'false']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
})

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next)
  }
}

router.get(
  '/',
  validate(listTasksQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const { completed, priority } = req.query as z.infer<typeof listTasksQuerySchema>

    const tasks = await prisma.task.findMany({
      where: {
        userId: req.userId,
        ...(completed !== undefined && { completed: completed === 'true' }),
        ...(priority !== undefined && { priority }),
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(tasks)
  }),
)

router.post(
  '/',
  validate(createTaskSchema),
  asyncHandler(async (req, res) => {
    const { title, description, priority, dueDate } = req.body

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        userId: req.userId as number,
      },
    })

    res.status(201).json(task)
  }),
)

router.get(
  '/:id',
  validate(taskIdSchema, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params as unknown as z.infer<typeof taskIdSchema>

    const task = await prisma.task.findFirst({
      where: { id, userId: req.userId },
    })

    if (!task) {
      throw new AppError(404, 'Task not found')
    }

    res.json(task)
  }),
)

router.put(
  '/:id',
  validate(taskIdSchema, 'params'),
  validate(updateTaskSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params as unknown as z.infer<typeof taskIdSchema>
    const { title, description, completed, priority, dueDate } = req.body

    const existing = await prisma.task.findFirst({
      where: { id, userId: req.userId },
    })

    if (!existing) {
      throw new AppError(404, 'Task not found')
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(completed !== undefined && { completed }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && {
          dueDate: dueDate === null ? null : new Date(dueDate),
        }),
      },
    })

    res.json(task)
  }),
)

router.delete(
  '/:id',
  validate(taskIdSchema, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params as unknown as z.infer<typeof taskIdSchema>

    const existing = await prisma.task.findFirst({
      where: { id, userId: req.userId },
    })

    if (!existing) {
      throw new AppError(404, 'Task not found')
    }

    await prisma.task.delete({ where: { id } })
    res.json({ message: 'Task deleted' })
  }),
)

export default router
