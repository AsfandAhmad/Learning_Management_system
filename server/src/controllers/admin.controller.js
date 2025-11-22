import { pool } from "../config/db.js";

// Get all pending teachers with CV details
export async function getPendingTeachers(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT t.TeacherID, t.FullName, t.Email, t.Qualification, t.CreatedAt, 
              td.FileName as CVFileName, td.FileURL as CVFileURL
       FROM Teacher t 
       LEFT JOIN TeacherDocument td ON t.TeacherID = td.TeacherID AND td.DocumentType = 'CV'
       WHERE t.Status = 'Pending' 
       ORDER BY t.CreatedAt DESC`
    );

    // Normalize CV FileURL to include host if stored as relative path
    rows.forEach(r => {
      if (r.CVFileURL && r.CVFileURL.startsWith('/uploads')) {
        r.CVFileURL = `${req.protocol}://${req.get('host')}${r.CVFileURL}`;
      }
    });

    return res.status(200).json({
      teachers: rows,
      count: rows.length
    });
  } catch (e) {
    next(e);
  }
}

// Get all teachers (approved, rejected, pending)
export async function getAllTeachers(req, res, next) {
  try {
    const { status } = req.query; // Filter by status: pending, approved, rejected
    let query = "SELECT TeacherID, FullName, Email, Qualification, Status, CreatedAt FROM Teacher";
    const params = [];

    if (status) {
      query += " WHERE Status = ?";
      params.push(status);
    }

    query += " ORDER BY CreatedAt DESC";
    const [rows] = await pool.query(query, params);

    return res.status(200).json({
      teachers: rows,
      count: rows.length
    });
  } catch (e) {
    next(e);
  }
}

// Approve a teacher by ID
export async function approveTeacher(req, res, next) {
  try {
    const { teacherId } = req.params;
    const adminId = req.user.adminId;

    if (!teacherId) {
      return res.status(400).json({ message: "Teacher ID is required" });
    }

    // Check if teacher exists
    const [rows] = await pool.query("SELECT * FROM Teacher WHERE TeacherID = ?", [teacherId]);
    const teacher = rows[0];

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    if (teacher.Status === "Approved") {
      return res.status(400).json({ message: "Teacher is already approved" });
    }

    // Update teacher status to Approved
    // Note: ApprovedByAdminID and ApprovedAt columns don't exist in schema, so we only update Status
    await pool.query(
      "UPDATE Teacher SET Status = 'Approved' WHERE TeacherID = ?",
      [teacherId]
    );

    return res.status(200).json({
      message: "Teacher approved successfully",
      teacher: {
        teacherId: teacher.TeacherID,
        fullName: teacher.FullName,
        email: teacher.Email,
        status: "Approved"
      }
    });
  } catch (e) {
    next(e);
  }
}

// Reject a teacher by ID with reason
export async function rejectTeacher(req, res, next) {
  try {
    const { teacherId } = req.params;
    const { reason } = req.body;
    const adminId = req.user.adminId;

    if (!teacherId) {
      return res.status(400).json({ message: "Teacher ID is required" });
    }

    // Check if teacher exists
    const [rows] = await pool.query("SELECT * FROM Teacher WHERE TeacherID = ?", [teacherId]);
    const teacher = rows[0];

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Update teacher status to Rejected
    // Note: RejectionReason, RejectedByAdminID, RejectedAt columns don't exist in schema
    await pool.query(
      "UPDATE Teacher SET Status = 'Rejected' WHERE TeacherID = ?",
      [teacherId]
    );

    return res.status(200).json({
      message: "Teacher rejected successfully",
      teacher: {
        teacherId: teacher.TeacherID,
        fullName: teacher.FullName,
        email: teacher.Email,
        status: "Rejected"
      }
    });
  } catch (e) {
    next(e);
  }
}

// Get teacher details with CV for admin review
export async function getTeacherDetails(req, res, next) {
  try {
    const { teacherId } = req.params;

    const [teacher] = await pool.query(
      `SELECT t.TeacherID, t.FullName, t.Email, t.Qualification, t.Status, t.CreatedAt, t.ProfilePhoto
       FROM Teacher t 
       WHERE t.TeacherID = ?`,
      [teacherId]
    );

    if (!teacher.length) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const [documents] = await pool.query(
      "SELECT DocumentID, DocumentType, FileName, FileURL, UploadedAt FROM TeacherDocument WHERE TeacherID = ?",
      [teacherId]
    ).catch(err => {
      console.warn('Warning: Could not retrieve documents:', err.message);
      return [[]]; // Return empty array if table doesn't exist
    });

    // Normalize document URLs
    documents.forEach(d => {
      if (d.FileURL && d.FileURL.startsWith('/uploads')) {
        d.FileURL = `${req.protocol}://${req.get('host')}${d.FileURL}`;
      }
    });

    return res.json({
      teacher: teacher[0],
      documents
    });
  } catch (e) {
    next(e);
  }
}

// Get teacher documents for admin review
export async function getTeacherDocuments(req, res, next) {
  try {
    const { teacherId } = req.params;

    const [teacher] = await pool.query(
      "SELECT TeacherID, FullName, Email, Status FROM Teacher WHERE TeacherID = ?",
      [teacherId]
    );

    if (!teacher.length) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const [documents] = await pool.query(
      `SELECT DocumentID, DocumentType, FileName, FileURL, UploadedAt 
       FROM TeacherDocument 
       WHERE TeacherID = ? 
       ORDER BY UploadedAt DESC`,
      [teacherId]
    );

    // Normalize document URLs
    documents.forEach(d => {
      if (d.FileURL && d.FileURL.startsWith('/uploads')) {
        d.FileURL = `${req.protocol}://${req.get('host')}${d.FileURL}`;
      }
    });

    return res.status(200).json({
      teacher: teacher[0],
      documents
    });
  } catch (e) {
    next(e);
  }
}

// GET teacher CV for admin review
export async function getTeacherCV(req, res, next) {
  try {
    const { teacherId } = req.params;

    // Get teacher info
    const [teacher] = await pool.query(
      "SELECT TeacherID, FullName, Email FROM Teacher WHERE TeacherID = ?",
      [teacherId]
    );

    if (!teacher.length) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Try to get CV from TeacherDocument table
    try {
      const [cvDoc] = await pool.query(
        `SELECT DocumentID, FileName, FileURL FROM TeacherDocument 
         WHERE TeacherID = ? AND DocumentType = 'CV'`,
        [teacherId]
      );

      if (cvDoc.length) {
        let fileURL = cvDoc[0].FileURL || '';
        if (fileURL && fileURL.startsWith('/uploads')) {
          fileURL = `${req.protocol}://${req.get('host')}${fileURL}`;
        }

        return res.json({
          teacher: teacher[0],
          cv: {
            documentId: cvDoc[0].DocumentID,
            fileName: cvDoc[0].FileName,
            fileURL: fileURL
          }
        });
      }
    } catch (dbErr) {
      console.warn('Warning: Could not retrieve CV from database:', dbErr.message);
    }

    // If no CV found in database, return teacher info with null CV
    res.status(404).json({
      teacher: teacher[0],
      cv: null,
      message: "No CV uploaded for this teacher"
    });
  } catch (e) {
    next(e);
  }
}
