import { describe, it, expect, beforeEach } from '@jest/globals'
import request from 'supertest'
import createApp from '../src/app.js'
import { resetDatabase, registerAndGetTokens } from './helpers.js'

const app = createApp()

beforeEach(async () => {
  await resetDatabase()
})

describe('Tasks', () => {
  let accessToken: string
  let otherAccessToken: string

  beforeEach(async () => {
    const tokens = await registerAndGetTokens(request(app))
    accessToken = tokens.accessToken

    const other = await request(app)
      .post('/auth/register')
      .send({ username: 'other', email: 'other@example.com', password: 'password123' })
    otherAccessToken = other.body.accessToken
  })

  describe('POST /tasks', () => {
    it('creates a task', async () => {
      const res = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Test task', priority: 'HIGH' })

      expect(res.status).toBe(201)
      expect(res.body.title).toBe('Test task')
      expect(res.body.priority).toBe('HIGH')
      expect(res.body.completed).toBe(false)
    })

    it('returns 400 for invalid input', async () => {
      const res = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: '' })

      expect(res.status).toBe(400)
    })

    it('returns 401 without token', async () => {
      const res = await request(app).post('/tasks').send({ title: 'No auth' })

      expect(res.status).toBe(401)
    })
  })

  describe('GET /tasks', () => {
    beforeEach(async () => {
      await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Open task' })

      await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Done task' })

      const tasks = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)

      const doneTask = tasks.body.find((t: { title: string }) => t.title === 'Done task')
      await request(app)
        .put(`/tasks/${doneTask.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ completed: true })
    })

    it('lists all tasks for the user', async () => {
      const res = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(2)
    })

    it('filters by completed status', async () => {
      const res = await request(app)
        .get('/tasks?completed=true')
        .set('Authorization', `Bearer ${accessToken}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(1)
      expect(res.body[0].title).toBe('Done task')
    })
  })

  describe('GET /tasks/:id', () => {
    it('returns a single task', async () => {
      const created = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Single task' })

      const res = await request(app)
        .get(`/tasks/${created.body.id}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(res.status).toBe(200)
      expect(res.body.title).toBe('Single task')
    })

    it('returns 404 for task owned by another user', async () => {
      const created = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Private task' })

      const res = await request(app)
        .get(`/tasks/${created.body.id}`)
        .set('Authorization', `Bearer ${otherAccessToken}`)

      expect(res.status).toBe(404)
    })
  })

  describe('PUT /tasks/:id', () => {
    it('updates a task', async () => {
      const created = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Update me' })

      const res = await request(app)
        .put(`/tasks/${created.body.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Updated', completed: true, priority: 'LOW' })

      expect(res.status).toBe(200)
      expect(res.body.title).toBe('Updated')
      expect(res.body.completed).toBe(true)
      expect(res.body.priority).toBe('LOW')
    })

    it('returns 404 when updating another user task', async () => {
      const created = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Not yours' })

      const res = await request(app)
        .put(`/tasks/${created.body.id}`)
        .set('Authorization', `Bearer ${otherAccessToken}`)
        .send({ completed: true })

      expect(res.status).toBe(404)
    })
  })

  describe('DELETE /tasks/:id', () => {
    it('deletes a task', async () => {
      const created = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Delete me' })

      const res = await request(app)
        .delete(`/tasks/${created.body.id}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(res.status).toBe(200)

      const getRes = await request(app)
        .get(`/tasks/${created.body.id}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(getRes.status).toBe(404)
    })

    it('returns 404 when deleting another user task', async () => {
      const created = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Protected' })

      const res = await request(app)
        .delete(`/tasks/${created.body.id}`)
        .set('Authorization', `Bearer ${otherAccessToken}`)

      expect(res.status).toBe(404)
    })
  })
})
