import { describe, it, expect, jest } from '@jest/globals'
import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { validate } from '../../src/middleware/validate.js'
import { AppError, errorHandler } from '../../src/middleware/errorHandler.js'
import { Prisma } from '@prisma/client'
import jwt from 'jsonwebtoken'

function mockRes(): Response {
  const res = {
    statusCode: 200,
    body: null as unknown,
    status(code: number) {
      this.statusCode = code
      return this
    },
    json(data: unknown) {
      this.body = data
      return this
    },
  }
  return res as unknown as Response
}

describe('validate middleware', () => {
  it('passes valid body to next', () => {
    const schema = z.object({ name: z.string() })
    const req = { body: { name: 'test' } } as Request
    const res = mockRes()
    const next = jest.fn()

    validate(schema)(req, res, next as NextFunction)
    expect(next).toHaveBeenCalled()
    expect(req.body.name).toBe('test')
  })

  it('returns 400 for invalid body', () => {
    const schema = z.object({ name: z.string().min(3) })
    const req = { body: { name: 'ab' } } as Request
    const res = mockRes()
    const next = jest.fn()

    validate(schema)(req, res, next as NextFunction)
    expect(next).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(400)
  })
})

describe('errorHandler', () => {
  it('handles AppError', () => {
    const res = mockRes()
    errorHandler(new AppError(403, 'Forbidden'), {} as Request, res, jest.fn())
    expect(res.statusCode).toBe(403)
    expect(res.body).toEqual({ message: 'Forbidden' })
  })

  it('handles Prisma P2002 duplicate error', () => {
    const res = mockRes()
    const err = new Prisma.PrismaClientKnownRequestError('duplicate', {
      code: 'P2002',
      clientVersion: '5.0.0',
      meta: { target: ['email'] },
    })
    errorHandler(err, {} as Request, res, jest.fn())
    expect(res.statusCode).toBe(409)
  })

  it('handles Prisma P2025 not found error', () => {
    const res = mockRes()
    const err = new Prisma.PrismaClientKnownRequestError('not found', {
      code: 'P2025',
      clientVersion: '5.0.0',
    })
    errorHandler(err, {} as Request, res, jest.fn())
    expect(res.statusCode).toBe(404)
  })

  it('handles JWT errors', () => {
    const res = mockRes()
    errorHandler(new jwt.JsonWebTokenError('bad token'), {} as Request, res, jest.fn())
    expect(res.statusCode).toBe(401)
  })

  it('handles generic errors as 500', () => {
    const res = mockRes()
    errorHandler(new Error('unexpected'), {} as Request, res, jest.fn())
    expect(res.statusCode).toBe(500)
  })
})
