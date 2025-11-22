import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

async function approveTeacher(email) {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST || "localhost",
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || "root",
            password: process.env.DB_PASSWORD || "",
            database: process.env.DB_NAME || "LMS",
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
            enableKeepAlive: true,
            keepAliveInitialDelaySeconds: 0,
        });

        console.log("🔌 Connecting to database...");
        const connection = await pool.getConnection();

        console.log(`✅ Approving teacher with email: ${email}`);
        const [result] = await connection.query(
            "UPDATE Teacher SET Status = 'Approved' WHERE Email = ?",
            [email]
        );

        if (result.affectedRows === 0) {
            console.log(`❌ Teacher not found with email: ${email}`);
        } else {
            console.log(`✅ Teacher approved successfully!`);
        }

        connection.release();
        await pool.end();
    } catch (error) {
        console.error("❌ Error approving teacher:", error.message);
        process.exit(1);
    }
}

const email = process.argv[2];
if (!email) {
    console.log("Usage: node approve-teacher.js <teacher-email>");
    console.log("Example: node approve-teacher.js teacher@test.com");
    process.exit(1);
}

approveTeacher(email);
