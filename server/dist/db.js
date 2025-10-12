"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = exports.connection = void 0;
exports.query = query;
exports.ping = ping;
const dotenv_1 = require("dotenv");
const promise_1 = require("mysql2/promise");
(0, dotenv_1.config)();
// Config from env vars with sensible defaults for local development
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'test';
exports.connection = {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME
};
exports.pool = (0, promise_1.createPool)({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
async function query(sql, params) {
    const [rows] = (await exports.pool.query(sql, params));
    return rows;
}
// Optional: simple ping helper used at startup
async function ping() {
    const conn = await exports.pool.getConnection();
    try {
        await conn.ping();
    }
    finally {
        conn.release();
    }
}
