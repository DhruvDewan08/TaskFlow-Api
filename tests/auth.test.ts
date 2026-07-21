import { describe, it, expect, beforeEach } from '@jest/globals'
import request from 'supertest'
import createApp from '../src/app.js'
import { resetDatabase, testUser, registerAndGetTokens } from './helpers.js'

const app = createApp()

beforeEach(async () => {
  await resetDatabase()
})

describe('Auth', () => {
  describe('POST /auth/register', () => {
    it('registers a user and returns token pair', async () => {
      const res = await request(app).post('/auth/register').send(testUser)

      expect(res.status).toBe(201)
      expect(res.body.accessToken).toBeDefined()
      expect(res.body.refreshToken).toBeDefined()
    })

    it('returns 400 for invalid input', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ username: 'ab', email: 'bad', password: '123' })

      expect(res.status).toBe(400)
      expect(res.body.message).toBe('Validation failed')
    })

    it('returns 409 for duplicate email', async () => {
      await request(app).post('/auth/register').send(testUser)

      const res = await request(app)
        .post('/auth/register')
        .send({ ...testUser, username: 'otheruser' })

      expect(res.status).toBe(409)
    })
  })

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/auth/register').send(testUser)
    })

    it('logs in with valid credentials', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password })

      expect(res.status).toBe(200)
      expect(res.body.accessToken).toBeDefined()
      expect(res.body.refreshToken).toBeDefined()
    })

    it('returns 401 for wrong password', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: testUser.email, password: 'wrongpassword' })

      expect(res.status).toBe(401)
    })

    it('returns 401 for unknown email', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'unknown@example.com', password: testUser.password })

      expect(res.status).toBe(401)
    })
  })

  describe('POST /auth/refresh', () => {
    it('rotates refresh token and returns new pair', async () => {
      const { refreshToken } = await registerAndGetTokens(request(app))

      const res = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken })

      expect(res.status).toBe(200)
      expect(res.body.accessToken).toBeDefined()
      expect(res.body.refreshToken).toBeDefined()
      expect(res.body.refreshToken).not.toBe(refreshToken)
    })

    it('detects refresh token reuse and invalidates all sessions', async () => {
      const { refreshToken: originalRefresh } = await registerAndGetTokens(request(app))

      const firstRefresh = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: originalRefresh })

      expect(firstRefresh.status).toBe(200)

      const reuseAttempt = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: originalRefresh })

      expect(reuseAttempt.status).toBe(401)
      expect(reuseAttempt.body.message).toContain('reuse detected')

      const validTokenAlsoBlocked = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: firstRefresh.body.refreshToken })

      expect(validTokenAlsoBlocked.status).toBe(401)
    })

    it('returns 401 for invalid refresh token', async () => {
      const res = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' })

      expect(res.status).toBe(401)
    })
  })

  describe('POST /auth/logout', () => {
    it('revokes refresh token', async () => {
      const { refreshToken } = await registerAndGetTokens(request(app))

      const logoutRes = await request(app)
        .post('/auth/logout')
        .send({ refreshToken })

      expect(logoutRes.status).toBe(200)

      const refreshRes = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken })

      expect(refreshRes.status).toBe(401)
    })
  })
})
