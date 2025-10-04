import fs from "fs";
import { pool } from "../config/db.js";

async function initializeDatabase() {
    try {
        const schema = fs.readFileSync(new URL("./init.sql", import.meta.url), "utf-8");
        await pool.query(schema);
        console.log("✅ Database schema initialized successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error initializing database:", err.message);
        process.exit(1);
    }
}

initializeDatabase();
