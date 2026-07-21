import { describe, it, expect, beforeAll, jest } from '@jest/globals'
import { Request, Response, NextFunction } from 'express'
import authMiddleware from '../../src/middleware/authMiddleware.js'
import { signAccessToken } from '../../src/lib/tokens.js'

describe('authMiddleware', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-access-secret-minimum-32-characters-long'
  })

  it('rejects requests without Bearer token', () => {
    const req = { headers: {} } as Request
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
    } as unknown as Response
    const next = jest.fn()

    authMiddleware(req, res, next as NextFunction)
    expect(res.statusCode).toBe(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('sets userId from valid access token', () => {
    const token = signAccessToken(99)
    const req = { headers: { authorization: `Bearer ${token}` } } as Request
    const res = {} as Response
    const next = jest.fn()

    authMiddleware(req, res, next as NextFunction)
    expect(req.userId).toBe(99)
    expect(next).toHaveBeenCalled()
  })

  it('rejects invalid token', () => {
    const req = { headers: { authorization: 'Bearer invalid' } } as Request
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
    } as unknown as Response
    const next = jest.fn()

    authMiddleware(req, res, next as NextFunction)
    expect(res.statusCode).toBe(401)
  })
})
