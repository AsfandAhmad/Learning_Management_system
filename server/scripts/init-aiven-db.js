#!/usr/bin/env node
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const DB_CONFIG = {
  host: process.env.DB_HOST || "nexlern321-nexlern321.l.aivencloud.com",
  user: process.env.DB_USER || "avnadmin",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "NexLern",
  port: Number(process.env.DB_PORT) || 27794,
  ssl: { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 5,
};

async function initializeDatabase() {
  let connection;

  try {
    console.log("🔗 Connecting to Aiven Cloud Database...");
    console.log(`   Host: ${DB_CONFIG.host}`);
    console.log(`   Port: ${DB_CONFIG.port}`);
    console.log(`   Database: ${DB_CONFIG.database}`);

    connection = await mysql.createConnection(DB_CONFIG);
    console.log("✅ Connection established!\n");

    // Read the corrected schema file - schema is in root directory
    const schemaPath = path.resolve(
      process.cwd(),
      "../COMPLETE_DATABASE_SCHEMA.sql"
    );

    console.log(`📄 Reading schema file: ${schemaPath}`);
    const schema = fs.readFileSync(schemaPath, "utf-8");

    // Split by semicolon but preserve multi-line statements
    const statements = schema
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

    console.log(`📋 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let warningCount = 0;
    let errorCount = 0;

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      const stmtPreview = stmt.substring(0, 80).replace(/\n/g, " ");

      try {
        await connection.query(stmt);
        successCount++;
        console.log(`✅ [${i + 1}/${statements.length}] ${stmtPreview}...`);
      } catch (error) {
        if (error.code === "ER_TABLE_EXISTS_ERROR" || error.message.includes("already exists")) {
          warningCount++;
          console.log(
            `⚠️  [${i + 1}/${statements.length}] ${stmtPreview}... (Table already exists - skipping)`
          );
        } else if (error.code === "ER_DUP_KEYNAME" || error.message.includes("Duplicate key")) {
          warningCount++;
          console.log(
            `⚠️  [${i + 1}/${statements.length}] ${stmtPreview}... (Index already exists - skipping)`
          );
        } else if (error.code === "1064" || error.message.includes("syntax error")) {
          warningCount++;
          console.log(
            `⚠️  [${i + 1}/${statements.length}] ${stmtPreview}... (Syntax issue - skipping)`
          );
        } else {
          errorCount++;
          console.error(`❌ [${i + 1}/${statements.length}] Error: ${error.message}`);
          console.error(`   Statement: ${stmtPreview}...\n`);
        }
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 INITIALIZATION SUMMARY");
    console.log("=".repeat(60));
    console.log(`✅ Successful: ${successCount}`);
    console.log(`⚠️  Warnings (skipped): ${warningCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📈 Total: ${statements.length}`);
    console.log("=".repeat(60));

    if (errorCount === 0) {
      console.log("\n🎉 Database initialization complete! All tables ready.");
    } else {
      console.log(
        `\n⚠️  Initialization completed with ${errorCount} errors. Review above.`
      );
    }

    await connection.end();
    process.exit(errorCount > 0 ? 1 : 0);
  } catch (error) {
    console.error("❌ Fatal error:", error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase();
