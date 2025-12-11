// src/config/db.js
import dotenv from "dotenv";
dotenv.config();

import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
});
