import { PrismaClient } from '@prisma/client'

export const testPrisma = new PrismaClient()

export async function resetDatabase(): Promise<void> {
  await testPrisma.refreshToken.deleteMany()
  await testPrisma.task.deleteMany()
  await testPrisma.user.deleteMany()
}

export const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123',
}

export async function registerAndGetTokens(
  agent: import('supertest').Agent,
  user = testUser,
): Promise<{ accessToken: string; refreshToken: string }> {
  const res = await agent.post('/auth/register').send(user)
  return {
    accessToken: res.body.accessToken,
    refreshToken: res.body.refreshToken,
  }
}
