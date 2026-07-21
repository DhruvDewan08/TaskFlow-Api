import { execSync } from 'child_process'

export default async function globalSetup(): Promise<void> {
  const databaseUrl =
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/taskflow_test'

  process.env.DATABASE_URL = databaseUrl
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-access-secret-minimum-32-characters-long'
  process.env.REFRESH_SECRET =
    process.env.REFRESH_SECRET || 'test-refresh-secret-minimum-32-characters-long'
  process.env.NODE_ENV = 'test'

  try {
    execSync('npx prisma migrate deploy', {
      stdio: 'pipe',
      env: { ...process.env, DATABASE_URL: databaseUrl },
    })
  } catch {
    console.warn(
      '[globalSetup] Database unavailable — integration tests will fail. Unit tests will still run.',
    )
  }
}
