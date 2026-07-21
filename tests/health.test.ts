import { describe, it, expect } from '@jest/globals'
import request from 'supertest'
import createApp from '../src/app.js'

const app = createApp()

describe('Health', () => {
  it('GET /health returns 200 with status ok', async () => {
    const res = await request(app).get('/health')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })
})

describe('Swagger', () => {
  it('GET /api-docs.json returns OpenAPI spec', async () => {
    const res = await request(app).get('/api-docs.json')

    expect(res.status).toBe(200)
    expect(res.body.openapi).toBe('3.0.0')
    expect(res.body.info.title).toBe('TaskFlow API')
  })
})
