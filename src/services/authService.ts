import { randomUUID } from 'crypto'
import prisma from '../prisma.js'
import { hashPassword, verifyPassword } from '../lib/password.js'
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../lib/tokens.js'
import { AppError } from '../middleware/errorHandler.js'
import type { RegisterInput, LoginInput } from '../schemas/authSchemas.js'

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000

async function createTokenPair(userId: number): Promise<TokenPair> {
  const jti = randomUUID()
  const accessToken = signAccessToken(userId)
  const refreshToken = signRefreshToken(userId, jti)

  await prisma.refreshToken.create({
    data: {
      token: jti,
      userId,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  })

  return { accessToken, refreshToken }
}

export async function registerUser(input: RegisterInput): Promise<TokenPair> {
  const hashedPassword = await hashPassword(input.password)

  const user = await prisma.user.create({
    data: {
      username: input.username,
      email: input.email,
      password: hashedPassword,
    },
  })

  return createTokenPair(user.id)
}

export async function loginUser(input: LoginInput): Promise<TokenPair> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  })

  if (!user) {
    throw new AppError(401, 'Invalid email or password')
  }

  const valid = await verifyPassword(input.password, user.password)
  if (!valid) {
    throw new AppError(401, 'Invalid email or password')
  }

  return createTokenPair(user.id)
}

export async function refreshTokens(refreshToken: string): Promise<TokenPair> {
  let payload
  try {
    payload = verifyRefreshToken(refreshToken)
  } catch {
    throw new AppError(401, 'Invalid or expired refresh token')
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { token: payload.jti },
  })

  if (!stored || stored.userId !== payload.sub) {
    throw new AppError(401, 'Invalid or expired refresh token')
  }

  if (stored.expiresAt < new Date()) {
    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    })
    throw new AppError(401, 'Refresh token expired')
  }

  // Reuse detection: replay of a revoked token invalidates all sessions
  if (stored.revoked) {
    await prisma.refreshToken.updateMany({
      where: { userId: stored.userId, revoked: false },
      data: { revoked: true },
    })
    throw new AppError(401, 'Refresh token reuse detected — all sessions invalidated')
  }

  // Rotate: revoke current token, issue new pair
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revoked: true },
  })

  return createTokenPair(stored.userId)
}

export async function logoutUser(refreshToken: string): Promise<void> {
  try {
    const payload = verifyRefreshToken(refreshToken)
    await prisma.refreshToken.updateMany({
      where: { token: payload.jti, userId: payload.sub, revoked: false },
      data: { revoked: true },
    })
  } catch {
    // Silently succeed — token may already be invalid
  }
}
