import { pool } from "../config/db.js";

// GET student profile
export async function getStudentProfile(req, res, next) {
    try {
        const studentId = req.user.studentId;

        const [student] = await pool.query(
            "SELECT StudentID, FullName, Email, Status, LastActiveDate, StreakCount, CreatedAt FROM Student WHERE StudentID = ?",
            [studentId]
        );
        if (!student.length) return res.status(404).json({ message: "Student not found" });

        res.json(student[0]);
    } catch (e) { next(e); }
}

// UPDATE student profile
export async function updateStudentProfile(req, res, next) {
    try {
        const studentId = req.user.studentId;
        const { fullName } = req.body;

        await pool.query(
            "UPDATE Student SET FullName = ? WHERE StudentID = ?",
            [fullName, studentId]
        );
        res.json({ ok: true, message: "Profile updated successfully" });
    } catch (e) { next(e); }
}

// GET student's enrolled courses with progress
export async function getStudentCourses(req, res, next) {
    try {
        const studentId = req.user.studentId;

        const [enrollments] = await pool.query(
            `SELECT e.EnrollmentID, e.ProgressPercentage, e.Status, e.EnrollDate,
              c.CourseID, c.Title, c.Description, c.Category, c.Level, c.ThumbnailURL,
              t.FullName AS TeacherName, t.TeacherID,
              (SELECT COUNT(*) FROM Section WHERE CourseID = c.CourseID) AS SectionCount,
              (SELECT COUNT(*) FROM Lesson l JOIN Section s ON l.SectionID = s.SectionID WHERE s.CourseID = c.CourseID) AS LessonCount
       FROM Enrollment e
       JOIN Course c ON e.CourseID = c.CourseID
       JOIN Teacher t ON c.TeacherID = t.TeacherID
       WHERE e.StudentID = ? AND e.Status = 'Active'
       ORDER BY e.EnrollDate DESC`,
            [studentId]
        );
        res.json(enrollments);
    } catch (e) { next(e); }
}

// GET student's progress across all enrolled courses
export async function getStudentProgress(req, res, next) {
    try {
        const studentId = req.user.studentId;

        const [progress] = await pool.query(
            `SELECT c.CourseID, c.Title, e.ProgressPercentage, 
              (SELECT COUNT(*) FROM ActivityLog WHERE StudentID = ? AND ActivityType = 'LessonView' AND 
               LessonID IN (SELECT LessonID FROM Lesson l JOIN Section s ON l.SectionID = s.SectionID WHERE s.CourseID = c.CourseID)) AS LessonsViewed,
              (SELECT COUNT(*) FROM Lesson l JOIN Section s ON l.SectionID = s.SectionID WHERE s.CourseID = c.CourseID) AS TotalLessons
       FROM Enrollment e
       JOIN Course c ON e.CourseID = c.CourseID
       WHERE e.StudentID = ? AND e.Status = 'Active'
       ORDER BY e.ProgressPercentage DESC`,
            [studentId, studentId]
        );
        res.json(progress);
    } catch (e) { next(e); }
}

// GET student's certificates
export async function getStudentCertificates(req, res, next) {
    try {
        const studentId = req.user.studentId;

        const [certificates] = await pool.query(
            `SELECT cert.CertificateID, cert.CourseID, cert.IssueDate, 
              c.Title AS CourseName, t.FullName AS TeacherName
       FROM Certificate cert
       JOIN Course c ON cert.CourseID = c.CourseID
       JOIN Teacher t ON c.TeacherID = t.TeacherID
       WHERE cert.StudentID = ?
       ORDER BY cert.IssueDate DESC`,
            [studentId]
        );
        res.json(certificates);
    } catch (e) { next(e); }
}

// GET student's activity log
export async function getStudentActivity(req, res, next) {
    try {
        const studentId = req.user.studentId;

        const [activities] = await pool.query(
            `SELECT ActivityLogID, ActivityType, ActivityDate 
       FROM ActivityLog 
       WHERE StudentID = ? 
       ORDER BY ActivityDate DESC 
       LIMIT 100`,
            [studentId]
        );
        res.json(activities);
    } catch (e) { next(e); }
}
