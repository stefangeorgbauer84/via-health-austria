import { Pool } from 'pg'

// Singleton-Pool für alle Server Components
let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URI })
  }
  return pool
}
