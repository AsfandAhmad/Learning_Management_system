#!/usr/bin/env node
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function initializeNexLernDb() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "nexlern321-nexlern321.l.aivencloud.com",
    port: Number(process.env.DB_PORT) || 27794,
    user: process.env.DB_USER || "avnadmin",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "NexLern",
    ssl: { rejectUnauthorized: false },
  });

  console.log(`🔗 Connected to ${process.env.DB_NAME || "NexLern"}\n`);

  // Disable foreign key checks during initialization
  await conn.query("SET FOREIGN_KEY_CHECKS=0");
  console.log("⚙️  Foreign key checks disabled\n");

  const schemaPath = path.resolve(__dirname, "../../COMPLETE_DATABASE_SCHEMA.sql");
  let schema = fs.readFileSync(schemaPath, "utf-8");

  // Remove comment lines
  schema = schema
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");

  // Parse statements properly, handling DELIMITER
  const statements = [];
  let current = "";
  let inDelimiter = false;
  let delimiterChar = ";";

  for (const line of schema.split("\n")) {
    const trimmed = line.trim();

    if (trimmed.startsWith("DELIMITER")) {
      delimiterChar = trimmed.replace("DELIMITER", "").trim();
      inDelimiter = true;
      continue;
    }

    if (inDelimiter) {
      current += line + "\n";
      if (line.includes(delimiterChar)) {
        statements.push(current.trim());
        current = "";
        if (trimmed === "DELIMITER ;") {
          inDelimiter = false;
          delimiterChar = ";";
        }
      }
    } else {
      current += line + "\n";
      if (line.trim().endsWith(";")) {
        const stmt = current.trim().replace(/;$/, "");
        if (stmt.length > 0) {
          statements.push(stmt);
        }
        current = "";
      }
    }
  }

  const validStatements = statements.filter((s) => s.trim().length > 0);

  console.log(`📋 Found ${validStatements.length} SQL statements\n`);

  let success = 0,
    skip = 0,
    error = 0;

  for (const stmt of validStatements) {
    if (stmt.startsWith("DELIMITER") || stmt.length === 0) continue;

    try {
      await conn.query(stmt);
      success++;
      const preview = stmt.substring(0, 60).replace(/\n/g, " ");
      console.log("✅", preview + "...");
    } catch (e) {
      if (
        e.message.includes("already exists") ||
        e.code === "ER_DUP_KEYNAME"
      ) {
        skip++;
      } else if (e.message.includes("syntax") || e.message.includes("DECLARE")) {
        skip++;
      } else {
        error++;
        console.log("❌", e.message.substring(0, 100));
      }
    }
  }

  await conn.end();

  console.log("\n" + "=".repeat(60));
  console.log("📊 INITIALIZATION SUMMARY");
  console.log("=".repeat(60));
  console.log("✅ Success:", success);
  console.log("⚠️  Skipped:", skip);
  console.log("❌ Errors:", error);
  console.log("=".repeat(60));

  if (error === 0) {
    console.log("\n🎉 Database initialization complete!");
  }
}

initializeNexLernDb().catch((e) => {
  console.error("Fatal error:", e.message);
  process.exit(1);
});
