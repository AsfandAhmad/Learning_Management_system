import { pool } from "../config/db.js";

export async function listCourses(req, res, next) {
  try {
    const [rows] = await pool.query(
      "SELECT c.id, c.title, c.description, c.price, u.name AS instructorName FROM courses c JOIN users u ON u.id = c.instructor_id WHERE c.approved = 1"
    );
    res.json(rows);
  } catch (e) { next(e); }
}

export async function createCourse(req, res, next) {
  try {
    const { title, description, price } = req.body;
    const instructorId = req.user.id;
    const [result] = await pool.query(
      "INSERT INTO courses (title, description, price, instructor_id, approved) VALUES (?, ?, ?, ?, 0)",
      [title, description, price || 0, instructorId]
    );
    res.status(201).json({ id: result.insertId });
  } catch (e) { next(e); }
}
