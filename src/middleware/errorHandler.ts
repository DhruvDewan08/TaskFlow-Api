import { Request, Response, NextFunction } from 'express'
import { Prisma } from '@prisma/client'
import jwt from 'jsonwebtoken'

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message })
    return
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const field = (err.meta?.target as string[] | undefined)?.[0] ?? 'field'
      res.status(409).json({ message: `A record with this ${field} already exists` })
      return
    }
    if (err.code === 'P2025') {
      res.status(404).json({ message: 'Resource not found' })
      return
    }
  }

  if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
    res.status(401).json({ message: 'Invalid or expired token' })
    return
  }

  console.error('[Error]', err.message)
  const isDev = process.env.NODE_ENV !== 'production'
  res.status(500).json({
    message: 'Internal server error',
    ...(isDev && { detail: err.message }),
  })
}
