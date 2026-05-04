import app from "./app.js";
import { pool } from "./config/db.js";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve built React frontend (after API routes in app.js)
app.use(express.static(path.join(__dirname, "../../client/dist")));

// Fallback for React Router - Express 5 syntax
app.get("/{*path}", (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
});

const PORT = process.env.PORT || 5000;

async function start() {
    try {
        const conn = await pool.getConnection();
        conn.release();
        console.log("✅ Database connected");
        app.listen(PORT, () => console.log("Server running on port " + PORT));
    } catch (err) {
        console.error("❌ Failed to connect to database:", err.message || err);
        console.warn("⚠️  Starting server without a working DB connection (development fallback).");
        try {
            app.listen(PORT, () => console.log("Server running (no DB) on port " + PORT));
        } catch (listenErr) {
            console.error("❌ Failed to start server:", listenErr.message || listenErr);
            process.exit(1);
        }
    }
}

start();