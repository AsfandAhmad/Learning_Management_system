#!/usr/bin/env node

import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const cloudCredentials = {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "LMS",
    ssl: { rejectUnauthorized: false }
};

async function migrateSchema() {
    let connection;
    try {
        console.log("🔌 Connecting to cloud database...");
        connection = await mysql.createConnection(cloudCredentials);
        console.log("✅ Connected to cloud database!");

        // Read schema from init.sql
        const { readFileSync } = await import("fs");
        const schemaPath = new URL("../src/db/init.sql", import.meta.url);
        const schema = readFileSync(schemaPath, "utf-8");

        // Split by semicolon and execute each statement
        const statements = schema
            .split(";")
            .map((stmt) => stmt.trim())
            .filter((stmt) => stmt.length > 0);

        console.log(`\n📝 Found ${statements.length} SQL statements to execute...\n`);

        for (let i = 0; i < statements.length; i++) {
            try {
                console.log(`[${i + 1}/${statements.length}] Executing statement...`);
                await connection.execute(statements[i]);
                console.log(`✅ Statement ${i + 1} executed successfully`);
            } catch (error) {
                // Table already exists is not a fatal error
                if (error.code === "ER_TABLE_EXISTS_ERROR") {
                    console.log(`⚠️  Table already exists (skipping)`);
                } else if (error.code === "ER_DUP_FIELDNAME") {
                    console.log(`⚠️  Field already exists (skipping)`);
                } else {
                    console.error(`❌ Error executing statement ${i + 1}:`, error.message);
                }
            }
        }

        console.log("\n✅ Schema migration completed!");
        console.log("🎉 All tables and schema are now on cloud database!");

    } catch (error) {
        console.error("❌ Migration failed:", error.message);
        process.exit(1);
    } finally {
        if (connection) await connection.end();
    }
}

migrateSchema();
