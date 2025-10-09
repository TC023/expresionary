import { createPool, Pool } from 'mysql2/promise'

// Config from env vars with sensible defaults for local development
const DB_HOST = process.env.DB_HOST || 'localhost'
const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306
const DB_USER = process.env.DB_USER || 'root'
const DB_PASSWORD = process.env.DB_PASSWORD || ''
const DB_NAME = process.env.DB_NAME || 'test'

export const pool: Pool = createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  // mysql2's typed `query` generic is constrained to specific result shapes
  // which makes it inconvenient to forward a generic `T` from this helper.
  // Use an explicit cast from unknown to the expected tuple shape so callers
  // can request `T` and we return `T[]` without a type error.
  const [rows] = (await pool.query(sql, params)) as unknown as [T[], any]
  return rows
}

// Optional: simple ping helper used at startup
export async function ping() {
  const conn = await pool.getConnection()
  try {
    await conn.ping()
  } finally {
    conn.release()
  }
}
