import bcrypt from "bcrypt";
import pool from "../config/db.js";

async function seedAdmin() {
  try {
    // Check if admin already exists
    const [exists] = await pool.query("SELECT AdminID FROM Admin WHERE Email = ?", ["admin@gmail.com"]);
    
    if (exists.length) {
      console.log("❌ Admin user already exists");
      await pool.end();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("admin", 10);

    // Insert admin
    const [result] = await pool.query(
      "INSERT INTO Admin (FullName, Email, PasswordHash) VALUES (?, ?, ?)",
      ["admin", "admin@gmail.com", hashedPassword]
    );

    console.log("✅ Admin user created successfully");
    console.log("   Email: admin@gmail.com");
    console.log("   Password: admin");
    console.log("   AdminID:", result.insertId);

    await pool.end();
  } catch (error) {
    console.error("❌ Error seeding admin:", error.message);
    await pool.end();
    process.exit(1);
  }
}

seedAdmin();
