import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";
import { getFileUrl } from "../utils/fileUpload.js";

// ===== STUDENT AUTHENTICATION =====

export async function registerStudent(req, res, next) {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Full name, email, and password required" });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Check if email already exists
    const [exists] = await pool.query("SELECT StudentID FROM Student WHERE Email = ?", [email]);
    if (exists.length) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const [result] = await pool.query(
      "INSERT INTO Student (FullName, Email, PasswordHash, Status) VALUES (?, ?, ?, 'Active')",
      [fullName, email, hashed]
    );

    const token = jwt.sign(
      {
        studentId: result.insertId,
        fullName,
        email,
        role: "student"
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      token,
      studentId: result.insertId,
      message: "Student registered successfully"
    });
  } catch (e) { next(e); }
}

export async function loginStudent(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const [rows] = await pool.query("SELECT * FROM Student WHERE Email = ?", [email]);
    const student = rows[0];
    if (!student) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if student is blocked
    if (student.Status === 'Blocked') {
      return res.status(403).json({ message: "Account is blocked" });
    }

    const ok = await bcrypt.compare(password, student.PasswordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        studentId: student.StudentID,
        fullName: student.FullName,
        email: student.Email,
        role: "student"
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      student: {
        studentId: student.StudentID,
        fullName: student.FullName,
        email: student.Email
      },
      message: "Login successful"
    });
  } catch (e) { next(e); }
}

// ===== TEACHER AUTHENTICATION =====

export async function registerTeacher(req, res, next) {
  try {
    const { fullName, email, password, qualification, bio, profilePhoto } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Full name, email, and password required" });
    }

    // Check if email already exists
    const [exists] = await pool.query("SELECT TeacherID FROM Teacher WHERE Email = ?", [email]);
    if (exists.length) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Hash password
      const hashed = await bcrypt.hash(password, 10);

      // Insert teacher (store profilePhoto if provided)
      const [result] = await connection.query(
        `INSERT INTO Teacher (FullName, Email, PasswordHash, Qualification, ProfilePhoto, Status) 
         VALUES (?, ?, ?, ?, ?, 'Pending')`,
        [fullName, email, hashed, qualification || null, profilePhoto || null]
      );

      const teacherId = result.insertId;

      // Handle CV file if uploaded
      if (req.file) {
        try {
          // file is stored in uploads/cvs/
          const fileUrl = getFileUrl(req, `cvs/${req.file.filename}`);

          await connection.query(
            `INSERT INTO TeacherDocument (TeacherID, DocumentType, FileName, FileURL) 
             VALUES (?, 'CV', ?, ?)`,
            [teacherId, req.file.originalname, fileUrl]
          );
        } catch (err) {
          // If TeacherDocument table doesn't exist, continue without storing CV
          console.warn('Warning: Could not store CV document:', err.message);
        }
      }

      // Create an in-app notification for admins
      try {
        await connection.query(
          `INSERT INTO Notification (UserID, NotificationType, NotificationTitle, NotificationMessage, NotificationLink) VALUES (?, 'Admin', ?, ?, ?)`,
          [null, 'New Teacher Pending Approval', `A new teacher has registered: ${fullName} (${email})`, `/admin/teachers/${teacherId}`]
        );
      } catch (err) {
        // If Notification table doesn't exist, continue without storing notification
        console.warn('Warning: Could not create notification:', err.message);
      }

      await connection.commit();

      return res.status(201).json({
        teacherId,
        message: "Teacher registered successfully. Awaiting admin approval."
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (e) {
    console.error('Error in registerTeacher:', e);
    next(e);
  }
}

export async function loginTeacher(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const [rows] = await pool.query("SELECT * FROM Teacher WHERE Email = ?", [email]);
    const teacher = rows[0];
    if (!teacher) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if teacher is approved
    // In development, auto-approve if no approved teachers exist yet
    if (teacher.Status !== 'Approved') {
      // Check if there are any approved teachers
      const [approvedTeachers] = await pool.query("SELECT COUNT(*) as count FROM Teacher WHERE Status = 'Approved'");

      if (approvedTeachers[0].count === 0) {
        // Auto-approve the first teacher for development
        await pool.query("UPDATE Teacher SET Status = 'Approved' WHERE TeacherID = ?", [teacher.TeacherID]);
        console.log(`✅ Auto-approved first teacher: ${email}`);
      } else {
        return res.status(403).json({ message: `Account status: ${teacher.Status}. Please wait for admin approval.` });
      }
    }

    const ok = await bcrypt.compare(password, teacher.PasswordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        teacherId: teacher.TeacherID,
        fullName: teacher.FullName,
        email: teacher.Email,
        role: "teacher"
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      teacher: {
        teacherId: teacher.TeacherID,
        fullName: teacher.FullName,
        email: teacher.Email,
        qualification: teacher.Qualification
      },
      message: "Login successful"
    });
  } catch (e) { next(e); }
}

// ===== ADMIN AUTHENTICATION =====

export async function registerAdmin(req, res, next) {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Full name, email, and password required" });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Check if email already exists
    const [exists] = await pool.query("SELECT AdminID FROM Admin WHERE Email = ?", [email]);
    if (exists.length) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const [result] = await pool.query(
      "INSERT INTO Admin (FullName, Email, PasswordHash) VALUES (?, ?, ?)",
      [fullName, email, hashed]
    );

    return res.status(201).json({
      adminId: result.insertId,
      message: "Admin registered successfully"
    });
  } catch (e) { next(e); }
}

export async function loginAdmin(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const [rows] = await pool.query("SELECT * FROM Admin WHERE Email = ?", [email]);
    const admin = rows[0];
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, admin.PasswordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        adminId: admin.AdminID,
        fullName: admin.FullName,
        email: admin.Email,
        role: "admin"
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      admin: {
        adminId: admin.AdminID,
        fullName: admin.FullName,
        email: admin.Email
      },
      message: "Admin login successful"
    });
  } catch (e) { next(e); }
}
