process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-access-secret-minimum-32-characters-long'
process.env.REFRESH_SECRET = 'test-refresh-secret-minimum-32-characters-long'
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/taskflow_test'
process.env.REDIS_HOST = process.env.REDIS_HOST || 'localhost'
process.env.REDIS_PORT = process.env.REDIS_PORT || '6379'
