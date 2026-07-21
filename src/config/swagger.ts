import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { Application } from 'express'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TaskFlow API',
      version: '1.0.0',
      description:
        'A scalable task management REST API with JWT authentication, refresh token rotation, and Redis-backed rate limiting.',
    },
    servers: [{ url: '/', description: 'Current server' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        RegisterInput: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            username: { type: 'string', minLength: 3, maxLength: 30 },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8, maxLength: 100 },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        TokenPair: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
        Task: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            description: { type: 'string', nullable: true },
            completed: { type: 'boolean' },
            priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
            dueDate: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            userId: { type: 'integer' },
          },
        },
        CreateTaskInput: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string', maxLength: 200 },
            description: { type: 'string', maxLength: 2000 },
            priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
            dueDate: { type: 'string', format: 'date-time' },
          },
        },
        UpdateTaskInput: {
          type: 'object',
          properties: {
            title: { type: 'string', maxLength: 200 },
            description: { type: 'string', maxLength: 2000 },
            completed: { type: 'boolean' },
            priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
            dueDate: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
    paths: {
      '/health': {
        get: {
          summary: 'Health check',
          tags: ['System'],
          responses: {
            200: {
              description: 'Service is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'ok' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/auth/register': {
        post: {
          summary: 'Register a new user',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/RegisterInput' } },
            },
          },
          responses: {
            201: {
              description: 'User registered',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/TokenPair' } },
              },
            },
            400: { description: 'Validation error' },
            409: { description: 'Email or username already exists' },
          },
        },
      },
      '/auth/login': {
        post: {
          summary: 'Login',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/LoginInput' } },
            },
          },
          responses: {
            200: {
              description: 'Login successful',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/TokenPair' } },
              },
            },
            401: { description: 'Invalid credentials' },
          },
        },
      },
      '/auth/refresh': {
        post: {
          summary: 'Refresh access token',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['refreshToken'],
                  properties: { refreshToken: { type: 'string' } },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'New token pair',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/TokenPair' } },
              },
            },
            401: { description: 'Invalid or reused refresh token' },
          },
        },
      },
      '/auth/logout': {
        post: {
          summary: 'Logout and revoke refresh token',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['refreshToken'],
                  properties: { refreshToken: { type: 'string' } },
                },
              },
            },
          },
          responses: {
            200: { description: 'Logged out' },
          },
        },
      },
      '/tasks': {
        get: {
          summary: 'List tasks',
          tags: ['Tasks'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'completed', in: 'query', schema: { type: 'string', enum: ['true', 'false'] } },
            { name: 'priority', in: 'query', schema: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] } },
          ],
          responses: {
            200: {
              description: 'Task list',
              content: {
                'application/json': {
                  schema: { type: 'array', items: { $ref: '#/components/schemas/Task' } },
                },
              },
            },
            401: { description: 'Unauthorized' },
          },
        },
        post: {
          summary: 'Create a task',
          tags: ['Tasks'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/CreateTaskInput' } },
            },
          },
          responses: {
            201: {
              description: 'Task created',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/Task' } },
              },
            },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/tasks/{id}': {
        get: {
          summary: 'Get a task by ID',
          tags: ['Tasks'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: {
              description: 'Task details',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/Task' } },
              },
            },
            404: { description: 'Task not found' },
          },
        },
        put: {
          summary: 'Update a task',
          tags: ['Tasks'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/UpdateTaskInput' } },
            },
          },
          responses: {
            200: {
              description: 'Task updated',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/Task' } },
              },
            },
            404: { description: 'Task not found' },
          },
        },
        delete: {
          summary: 'Delete a task',
          tags: ['Tasks'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Task deleted' },
            404: { description: 'Task not found' },
          },
        },
      },
    },
  },
  apis: [],
}

const swaggerSpec = swaggerJsdoc(options)

export function setupSwagger(app: Application): void {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
  app.get('/api-docs.json', (_req, res) => {
    res.json(swaggerSpec)
  })
}
