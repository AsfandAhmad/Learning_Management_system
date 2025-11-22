// import mysql from "mysql2/promise";
// import dotenv from "dotenv";
// dotenv.config();

// const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 20749;
// const useSsl = String(process.env.DB_SSL).toLowerCase() === "true" || process.env.DB_SSL === "1" || true;
// const sslRejectUnauthorized = String(process.env.DB_SSL_REJECT_UNAUTHORIZED).toLowerCase() !== "false";

// const sslOptions = useSsl ? { ssl: { rejectUnauthorized: false } } : {};

// export const pool = mysql.createPool({
//   host: process.env.DB_HOST || "localhost",
//   user: process.env.DB_USER || "root",
//   password: process.env.DB_PASSWORD || "",
//   database: process.env.DB_NAME || "LMS",
//   port,
//   waitForConnections: true,
//   connectionLimit: 10,
//   enableKeepAlive: true,
//   ...sslOptions,
// });

// // Backwards compatibility: some modules import `db`
// export const db = pool;

import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 20749;
// Force SSL for Aiven cloud database (required)
const useSsl = true;
const sslRejectUnauthorized = false;

const sslOptions = { ssl: { rejectUnauthorized: sslRejectUnauthorized } };

// Log DB config at startup (non-sensitive info only)
console.log(`📦 Database Configuration:`);
console.log(`   Host: ${process.env.DB_HOST || "mysql-b03eb11-nu-b92a.f.aivencloud.com"}`);
console.log(`   Port: ${port}`);
console.log(`   User: ${process.env.DB_USER || "avnadmin"}`);
console.log(`   Database: ${process.env.DB_NAME || "updated_lms"}`);
console.log(`   SSL Enabled: ${useSsl}`);
console.log(`   SSL Reject Unauthorized: ${sslRejectUnauthorized}`);

export const pool = mysql.createPool({
  host: process.env.DB_HOST || "mysql-b03eb11-nu-b92a.f.aivencloud.com",
  user: process.env.DB_USER || "avnadmin",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "updated_lms",
  port,
  waitForConnections: true,
  connectionLimit: 10,
  ...sslOptions,
});

// Backwards compatibility: some modules import `db`
export const db = pool;
