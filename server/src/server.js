import app from "./app.js";
import { pool } from "./config/db.js";
import studentRoutes from "./routes/student.routes.js";
import courseRoutes from "./routes/course.routes.js";
import quizRoutes from "./routes/quiz.routes.js";

// Attach additional routes not currently in `app.js`
app.use("/student", studentRoutes);
app.use("/course", courseRoutes);
app.use("/quiz", quizRoutes);

const PORT = process.env.PORT || 5000;

// Verify DB connection then start
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
