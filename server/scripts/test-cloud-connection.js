#!/usr/bin/env node

import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function testCloudConnection() {
    try {
        console.log("🔌 Testing cloud database connection...\n");
        console.log("Connection Details:");
        console.log(`  Host: ${process.env.DB_HOST}`);
        console.log(`  Port: ${process.env.DB_PORT}`);
        console.log(`  User: ${process.env.DB_USER}`);
        console.log(`  Database: ${process.env.DB_NAME}`);
        console.log("");

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: { rejectUnauthorized: false }
        });

        console.log("✅ Successfully connected to cloud database!\n");

        // Check existing tables
        const [tables] = await connection.execute(
            "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?",
            [process.env.DB_NAME]
        );

        console.log(`📊 Found ${tables.length} existing tables:`);
        tables.forEach((table) => {
            console.log(`   - ${table.TABLE_NAME}`);
        });

        await connection.end();
        console.log("\n✅ Connection test successful!");

    } catch (error) {
        console.error("❌ Connection failed:", error.message);
        console.error("\nDebug Info:", error);
        process.exit(1);
    }
}

testCloudConnection();
