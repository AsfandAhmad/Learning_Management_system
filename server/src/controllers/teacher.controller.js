import { pool } from "../config/db.js";
import path from "path";
import { deleteFile, getFileUrl } from "../utils/fileUpload.js";

// GET teacher profile
export async function getTeacherProfile(req, res, next) {
    try {
        const teacherId = req.user.teacherId;

        const [teacher] = await pool.query(
            "SELECT TeacherID, FullName, Email, Qualification, ProfilePhoto, Status, CreatedAt FROM Teacher WHERE TeacherID = ?",
            [teacherId]
        );
        if (!teacher.length) return res.status(404).json({ message: "Teacher not found" });

        res.json(teacher[0]);
    } catch (e) { next(e); }
}

// PUT update teacher profile
export async function updateTeacherProfile(req, res, next) {
    try {
        const teacherId = req.user.teacherId;
        const { FullName, Qualification, Bio } = req.body;

        await pool.query(
            "UPDATE Teacher SET FullName = ?, Qualification = ?, Bio = ? WHERE TeacherID = ?",
            [FullName, Qualification, Bio, teacherId]
        );
        res.json({ ok: true, message: "Profile updated successfully" });
    } catch (e) { next(e); }
}

// POST upload CV document
export async function uploadCV(req, res, next) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const teacherId = req.user.teacherId;
        const filePath = `/uploads/cvs/${req.file.filename}`;

        // Check if teacher already has a CV, delete the old one
        try {
            const [existing] = await pool.query(
                "SELECT FileName FROM TeacherDocument WHERE TeacherID = ? AND DocumentType = 'CV'",
                [teacherId]
            );

            if (existing.length) {
                // Delete old file
                const oldPath = path.join(process.cwd(), 'uploads/cvs', existing[0].FileName);
                deleteFile(oldPath);
                // Delete database record
                await pool.query(
                    "DELETE FROM TeacherDocument WHERE TeacherID = ? AND DocumentType = 'CV'",
                    [teacherId]
                );
            }

            // Insert new document
            await pool.query(
                "INSERT INTO TeacherDocument (TeacherID, DocumentType, FileName, FileURL, UploadedAt) VALUES (?, 'CV', ?, ?, NOW())",
                [teacherId, req.file.filename, getFileUrl(req, `cvs/${req.file.filename}`)]
            );
        } catch (dbErr) {
            console.warn('Warning: Could not store CV in database:', dbErr.message);
        }

        res.status(201).json({
            message: "CV uploaded successfully",
            fileName: req.file.filename,
            fileURL: getFileUrl(req, `cvs/${req.file.filename}`)
        });
    } catch (e) { next(e); }
}

// GET teacher documents
export async function getTeacherDocuments(req, res, next) {
    try {
        const teacherId = req.user.teacherId;

        try {
            const [documents] = await pool.query(
                "SELECT DocumentID, DocumentType, FileName, FileURL, UploadedAt FROM TeacherDocument WHERE TeacherID = ? ORDER BY UploadedAt DESC",
                [teacherId]
            );
            res.json(documents);
        } catch (dbErr) {
            console.warn('Warning: Could not retrieve documents:', dbErr.message);
            res.json([]); // Return empty array if table doesn't exist
        }
    } catch (e) { next(e); }
}

// GET teacher CV
export async function getTeacherCV(req, res, next) {
    try {
        const { teacherId } = req.params;

        try {
            const [document] = await pool.query(
                "SELECT DocumentID, FileName, FileURL FROM TeacherDocument WHERE TeacherID = ? AND DocumentType = 'CV'",
                [teacherId]
            );

            if (!document || !document.length) {
                return res.status(404).json({ message: "CV not found" });
            }

            // Ensure FileURL is absolute (includes host) for frontend consumption
            let fileURL = document[0].FileURL || '';
            if (fileURL && fileURL.startsWith('/uploads')) {
                fileURL = `${req.protocol}://${req.get('host')}${fileURL}`;
            }
            document[0].FileURL = fileURL;

            res.json(document[0]);
        } catch (dbErr) {
            console.warn('Warning: Could not retrieve CV:', dbErr.message);
            res.status(404).json({ message: "CV not found or error retrieving" });
        }
    } catch (e) { next(e); }
}

// POST upload document
export async function uploadDocument(req, res, next) {
    try {
        const teacherId = req.user.teacherId;
        const { DocumentType, FileName, FileURL } = req.body;

        try {
            const [result] = await pool.query(
                "INSERT INTO TeacherDocument (TeacherID, DocumentType, FileName, FileURL) VALUES (?, ?, ?, ?)",
                [teacherId, DocumentType, FileName, FileURL]
            );
            res.status(201).json({ DocumentID: result.insertId, message: "Document uploaded successfully" });
        } catch (dbErr) {
            console.warn('Warning: Could not store document:', dbErr.message);
            // Return success but without document ID since table doesn't exist
            res.status(201).json({ DocumentID: null, message: "Document uploaded successfully (not stored in database)" });
        }
    } catch (e) { next(e); }
}

// DELETE document
export async function deleteDocument(req, res, next) {
    try {
        const { docId } = req.params;
        const teacherId = req.user.teacherId;

        try {
            // Verify document belongs to teacher
            const [doc] = await pool.query(
                "SELECT DocumentID, TeacherID FROM TeacherDocument WHERE DocumentID = ?",
                [docId]
            );
            if (!doc.length || doc[0].TeacherID !== teacherId) {
                return res.status(403).json({ message: "Unauthorized" });
            }

            await pool.query("DELETE FROM TeacherDocument WHERE DocumentID = ?", [docId]);
            res.json({ ok: true, message: "Document deleted successfully" });
        } catch (dbErr) {
            console.warn('Warning: Could not delete document:', dbErr.message);
            res.status(404).json({ message: "Document not found or error deleting" });
        }
    } catch (e) { next(e); }
}

// GET teacher courses
export async function getTeacherCourses(req, res, next) {
    try {
        const teacherId = req.user.teacherId;

        const [courses] = await pool.query(
            `SELECT c.CourseID, c.Title, c.Description, c.Category, c.Level, c.ThumbnailURL, c.Status, c.CreatedAt,
              (SELECT COUNT(*) FROM Enrollment WHERE CourseID = c.CourseID) as StudentCount,
              (SELECT COUNT(*) FROM Section WHERE CourseID = c.CourseID) as SectionCount
       FROM Course c 
       WHERE c.TeacherID = ? 
       ORDER BY c.CreatedAt DESC`,
            [teacherId]
        );
        res.json(courses);
    } catch (e) { next(e); }
}

// GET teacher statistics
export async function getTeacherStats(req, res, next) {
    try {
        const teacherId = req.user.teacherId;

        const [stats] = await pool.query(
            `SELECT 
        (SELECT COUNT(*) FROM Course WHERE TeacherID = ?) as TotalCourses,
        (SELECT COUNT(*) FROM Course WHERE TeacherID = ? AND Status = 'Published') as PublishedCourses,
        (SELECT COUNT(DISTINCT e.StudentID) FROM Enrollment e JOIN Course c ON e.CourseID = c.CourseID WHERE c.TeacherID = ?) as TotalStudents,
        (SELECT COUNT(*) FROM Assignment a JOIN Course c ON a.CourseID = c.CourseID WHERE c.TeacherID = ?) as TotalAssignments`,
            [teacherId, teacherId, teacherId, teacherId]
        );
        res.json(stats[0] || {});
    } catch (e) { next(e); }
}

// GET teacher enrollments (all students across all courses)
export async function getTeacherEnrollments(req, res, next) {
    try {
        const teacherId = req.user.teacherId;

        const [enrollments] = await pool.query(
            `SELECT e.*, s.FullName, s.Email, c.Title as CourseName
       FROM Enrollment e 
       JOIN Student s ON e.StudentID = s.StudentID 
       JOIN Course c ON e.CourseID = c.CourseID 
       WHERE c.TeacherID = ? 
       ORDER BY e.EnrollDate DESC`,
            [teacherId]
        );
        res.json(enrollments);
    } catch (e) { next(e); }
}
