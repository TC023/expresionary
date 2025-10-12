import { config } from 'dotenv'
import MySQLStore from 'express-mysql-session';
import { createPool, Pool, QueryResult, RowDataPacket } from 'mysql2/promise'

config();

// Config from env vars with sensible defaults for local development
const DB_HOST = process.env.DB_HOST || 'localhost'
const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306
const DB_USER = process.env.DB_USER || 'root'
const DB_PASSWORD = process.env.DB_PASSWORD || ''
const DB_NAME = process.env.DB_NAME || 'test'

export const connection = {
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME
}

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

export async function query(sql: string, params?: any[]): Promise<QueryResult> {
  const [rows] = (await pool.query(sql, params))
  return rows as QueryResult
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
