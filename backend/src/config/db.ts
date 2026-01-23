import mysql from "mysql2/promise";
import dotenv from "dotenv";

import path from "path";
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASS || undefined,
  database: process.env.DB_NAME,
  timezone: "+07:00", // Fix timezone to Thailand/Local
  connectTimeout: 60000, // 60 seconds
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
});

export default pool;
