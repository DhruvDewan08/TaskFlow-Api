import { describe, it, expect, beforeAll } from '@jest/globals'
import jwt from 'jsonwebtoken'
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../../src/lib/tokens.js'

describe('tokens', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-access-secret-minimum-32-characters-long'
    process.env.REFRESH_SECRET = 'test-refresh-secret-minimum-32-characters-long'
  })

  it('signs and verifies access token', () => {
    const token = signAccessToken(42)
    const payload = verifyAccessToken(token)
    expect(payload.sub).toBe(42)
    expect(payload.type).toBe('access')
  })

  it('signs and verifies refresh token with jti', () => {
    const token = signRefreshToken(42, 'unique-jti-123')
    const payload = verifyRefreshToken(token)
    expect(payload.sub).toBe(42)
    expect(payload.type).toBe('refresh')
    expect(payload.jti).toBe('unique-jti-123')
  })

  it('rejects refresh token used as access token', () => {
    const token = signRefreshToken(1, 'jti')
    expect(() => verifyAccessToken(token)).toThrow()
  })

  it('rejects access token used as refresh token', () => {
    const token = signAccessToken(1)
    expect(() => verifyRefreshToken(token)).toThrow()
  })

  it('rejects wrong type even with valid access secret signature', () => {
    const token = jwt.sign(
      { sub: 1, type: 'refresh' },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' },
    )
    expect(() => verifyAccessToken(token)).toThrow('Invalid token type')
  })

  it('rejects wrong type even with valid refresh secret signature', () => {
    const token = jwt.sign(
      { sub: 1, type: 'access', jti: 'x' },
      process.env.REFRESH_SECRET!,
      { expiresIn: '7d' },
    )
    expect(() => verifyRefreshToken(token)).toThrow('Invalid token type')
  })

  it('throws when secrets are missing', () => {
    const savedJwt = process.env.JWT_SECRET
    delete process.env.JWT_SECRET
    expect(() => signAccessToken(1)).toThrow('JWT_SECRET is not configured')
    process.env.JWT_SECRET = savedJwt
  })
})
