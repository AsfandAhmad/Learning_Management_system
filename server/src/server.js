import app from "./app.js";
import { pool } from "./config/db.js";

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await pool.getConnection();
    app.listen(PORT, () => console.log("API running on http://localhost:" + PORT));
  } catch (e) {
    console.error("Failed to start:", e.message);
    process.exit(1);
  }
}
start();
