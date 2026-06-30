// src/config/db.js
import dotenv from "dotenv";
dotenv.config();

import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: process.env.DB_HOST || process.env.MYSQLHOST || "127.0.0.1",
  user: process.env.DB_USER || process.env.MYSQLUSER || process.env.DB_SER,
  password: process.env.DB_PASS || process.env.MYSQLPASSWORD,
  database: process.env.DB_NAME || process.env.MYSQLDATABASE,
  port: process.env.DB_PORT || process.env.MYSQLPORT || 3306,
  charset: "utf8mb4",
  connectionLimit: 10
});
