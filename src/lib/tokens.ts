import jwt from 'jsonwebtoken'

export interface AccessTokenPayload {
  sub: number
  type: 'access'
}

export interface RefreshTokenPayload {
  sub: number
  type: 'refresh'
  jti: string
}

/**
 * Signs a short-lived access token (15 minutes).
 */
export function signAccessToken(userId: number): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not configured')

  const payload: AccessTokenPayload = { sub: userId, type: 'access' }
  return jwt.sign(payload, secret, { expiresIn: '15m' })
}

/**
 * Signs a long-lived refresh token (7 days).
 * The jti (JWT ID) is stored in the DB for reuse detection.
 */
export function signRefreshToken(userId: number, jti: string): string {
  const secret = process.env.REFRESH_SECRET
  if (!secret) throw new Error('REFRESH_SECRET is not configured')

  const payload: RefreshTokenPayload = { sub: userId, type: 'refresh', jti }
  return jwt.sign(payload, secret, { expiresIn: '7d' })
}

/**
 * Verifies an access token and returns the decoded payload.
 */
export function verifyAccessToken(token: string): AccessTokenPayload {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not configured')

  const decoded = jwt.verify(token, secret) as AccessTokenPayload
  if (decoded.type !== 'access') {
    throw new Error('Invalid token type')
  }
  return decoded
}

/**
 * Verifies a refresh token and returns the decoded payload.
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const secret = process.env.REFRESH_SECRET
  if (!secret) throw new Error('REFRESH_SECRET is not configured')

  const decoded = jwt.verify(token, secret) as RefreshTokenPayload
  if (decoded.type !== 'refresh') {
    throw new Error('Invalid token type')
  }
  return decoded
}
