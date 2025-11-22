import { pool } from "../config/db.js";

// GET all enrollments for a student
export async function getStudentEnrollments(req, res, next) {
    try {
        const studentId = req.user.studentId;

        const [enrollments] = await pool.query(
            `SELECT e.*, c.Title, c.Description, c.Category, c.Level, c.ThumbnailURL, 
              t.FullName AS TeacherName, 
              (SELECT COUNT(*) FROM Section WHERE CourseID = c.CourseID) AS SectionCount,
              (SELECT COUNT(*) FROM Lesson l JOIN Section s ON l.SectionID = s.SectionID WHERE s.CourseID = c.CourseID) AS LessonCount
       FROM Enrollment e 
       JOIN Course c ON e.CourseID = c.CourseID 
       JOIN Teacher t ON c.TeacherID = t.TeacherID 
       WHERE e.StudentID = ? 
       ORDER BY e.EnrollDate DESC`,
            [studentId]
        );
        res.json(enrollments);
    } catch (e) { next(e); }
}

// GET single enrollment details
export async function getEnrollmentById(req, res, next) {
    try {
        const { enrollmentId } = req.params;
        const studentId = req.user.studentId;

        const [enrollment] = await pool.query(
            `SELECT e.*, c.*, t.FullName AS TeacherName 
       FROM Enrollment e 
       JOIN Course c ON e.CourseID = c.CourseID 
       JOIN Teacher t ON c.TeacherID = t.TeacherID 
       WHERE e.EnrollmentID = ? AND e.StudentID = ?`,
            [enrollmentId, studentId]
        );
        if (!enrollment.length) return res.status(404).json({ message: "Enrollment not found" });

        res.json(enrollment[0]);
    } catch (e) { next(e); }
}

// GET all enrollments for a course (teacher view)
export async function getCourseEnrollments(req, res, next) {
    try {
        const { courseId } = req.params;
        const teacherId = req.user.teacherId;

        // Verify course belongs to teacher
        const [course] = await pool.query("SELECT TeacherID FROM Course WHERE CourseID = ?", [courseId]);
        if (!course.length || course[0].TeacherID !== teacherId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const [enrollments] = await pool.query(
            `SELECT e.*, s.FullName, s.Email, s.LastActiveDate 
       FROM Enrollment e 
       JOIN Student s ON e.StudentID = s.StudentID 
       WHERE e.CourseID = ? 
       ORDER BY e.EnrollDate DESC`,
            [courseId]
        );
        res.json(enrollments);
    } catch (e) { next(e); }
}

// POST enroll student in course (student)
export async function enrollStudent(req, res, next) {
    try {
        const { courseId } = req.params;
        const studentId = req.user.studentId;

        // Check if student is blocked
        const [student] = await pool.query("SELECT Status FROM Student WHERE StudentID = ?", [studentId]);
        if (!student.length || student[0].Status === 'Blocked') {
            return res.status(403).json({ message: "Student account is blocked" });
        }

        // Check if already enrolled
        const [exists] = await pool.query(
            "SELECT EnrollmentID FROM Enrollment WHERE StudentID = ? AND CourseID = ?",
            [studentId, courseId]
        );
        if (exists.length) {
            return res.status(409).json({ message: "Already enrolled in this course" });
        }

        // Verify course exists and is published
        const [course] = await pool.query(
            "SELECT CourseID, Status FROM Course WHERE CourseID = ?",
            [courseId]
        );
        if (!course.length) return res.status(404).json({ message: "Course not found" });
        if (course[0].Status !== 'Published') {
            return res.status(400).json({ message: "Course is not published" });
        }

        const [result] = await pool.query(
            "INSERT INTO Enrollment (StudentID, CourseID, Status) VALUES (?, ?, 'Active')",
            [studentId, courseId]
        );
        res.status(201).json({
            EnrollmentID: result.insertId,
            message: "Enrolled in course successfully",
            CourseID: courseId,
            StudentID: studentId
        });
    } catch (e) { next(e); }
}

// PUT update enrollment (teacher - update progress and status)
export async function updateEnrollment(req, res, next) {
    try {
        const { enrollmentId } = req.params;
        const { ProgressPercentage, Status, CompletionDate } = req.body;
        const teacherId = req.user.teacherId;

        // Verify enrollment belongs to teacher's course
        const [enrollment] = await pool.query(
            `SELECT e.EnrollmentID, c.TeacherID 
       FROM Enrollment e 
       JOIN Course c ON e.CourseID = c.CourseID 
       WHERE e.EnrollmentID = ?`,
            [enrollmentId]
        );
        if (!enrollment.length || enrollment[0].TeacherID !== teacherId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await pool.query(
            "UPDATE Enrollment SET ProgressPercentage = ?, Status = ?, CompletionDate = ? WHERE EnrollmentID = ?",
            [ProgressPercentage, Status, CompletionDate, enrollmentId]
        );
        res.json({ ok: true, message: "Enrollment updated successfully" });
    } catch (e) { next(e); }
}

// PUT issue certificate (teacher - mark certificate issued)
export async function issueCertificate(req, res, next) {
    try {
        const { enrollmentId } = req.params;
        const teacherId = req.user.teacherId;

        // Verify enrollment belongs to teacher's course
        const [enrollment] = await pool.query(
            `SELECT e.*, c.TeacherID 
       FROM Enrollment e 
       JOIN Course c ON e.CourseID = c.CourseID 
       WHERE e.EnrollmentID = ?`,
            [enrollmentId]
        );
        if (!enrollment.length || enrollment[0].TeacherID !== teacherId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Update certificate issued flag
        await pool.query(
            "UPDATE Enrollment SET CertificateIssued = TRUE WHERE EnrollmentID = ?",
            [enrollmentId]
        );

        // Create certificate record
        const [certResult] = await pool.query(
            "INSERT INTO Certificate (EnrollmentID, StudentID, CourseID, IssueDate) VALUES (?, ?, ?, CURDATE())",
            [enrollmentId, enrollment[0].StudentID, enrollment[0].CourseID]
        );

        res.json({
            ok: true,
            CertificateID: certResult.insertId,
            message: "Certificate issued successfully"
        });
    } catch (e) { next(e); }
}

// DELETE unenroll student (student - can unenroll, or teacher - can remove)
export async function unenrollStudent(req, res, next) {
    try {
        const { enrollmentId } = req.params;
        const isStudent = req.user.studentId !== undefined;
        const isTeacher = req.user.teacherId !== undefined;

        if (isStudent) {
            // Student can only unenroll themselves
            const [enrollment] = await pool.query(
                "SELECT StudentID FROM Enrollment WHERE EnrollmentID = ?",
                [enrollmentId]
            );
            if (!enrollment.length || enrollment[0].StudentID !== req.user.studentId) {
                return res.status(403).json({ message: "Unauthorized" });
            }
        } else if (isTeacher) {
            // Teacher can only unenroll from their courses
            const [enrollment] = await pool.query(
                `SELECT e.EnrollmentID, c.TeacherID 
         FROM Enrollment e 
         JOIN Course c ON e.CourseID = c.CourseID 
         WHERE e.EnrollmentID = ?`,
                [enrollmentId]
            );
            if (!enrollment.length || enrollment[0].TeacherID !== req.user.teacherId) {
                return res.status(403).json({ message: "Unauthorized" });
            }
        }

        await pool.query("DELETE FROM Enrollment WHERE EnrollmentID = ?", [enrollmentId]);
        res.json({ ok: true, message: "Unenrolled successfully" });
    } catch (e) { next(e); }
}

// GET enrollment statistics (teacher view)
export async function getEnrollmentStats(req, res, next) {
    try {
        const { courseId } = req.params;
        const teacherId = req.user.teacherId;

        // Verify course belongs to teacher
        const [course] = await pool.query("SELECT TeacherID FROM Course WHERE CourseID = ?", [courseId]);
        if (!course.length || course[0].TeacherID !== teacherId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const [stats] = await pool.query(
            `SELECT 
        COUNT(*) as TotalEnrolled,
        SUM(CASE WHEN Status = 'Active' THEN 1 ELSE 0 END) as ActiveStudents,
        SUM(CASE WHEN Status = 'Completed' THEN 1 ELSE 0 END) as CompletedStudents,
        SUM(CASE WHEN CertificateIssued = TRUE THEN 1 ELSE 0 END) as CertificatesIssued,
        AVG(ProgressPercentage) as AverageProgress
       FROM Enrollment 
       WHERE CourseID = ?`,
            [courseId]
        );
        res.json(stats[0] || {});
    } catch (e) { next(e); }
}

// GET student progress in course
export async function getStudentProgress(req, res, next) {
    try {
        const { enrollmentId } = req.params;
        const studentId = req.user.studentId;

        const [enrollment] = await pool.query(
            `SELECT e.*, c.CourseID, c.Title,
              (SELECT COUNT(*) FROM Section WHERE CourseID = c.CourseID) as TotalSections,
              (SELECT COUNT(*) FROM Lesson l JOIN Section s ON l.SectionID = s.SectionID WHERE s.CourseID = c.CourseID) as TotalLessons
       FROM Enrollment e 
       JOIN Course c ON e.CourseID = c.CourseID 
       WHERE e.EnrollmentID = ? AND e.StudentID = ?`,
            [enrollmentId, studentId]
        );
        if (!enrollment.length) return res.status(404).json({ message: "Enrollment not found" });

        // Get quiz stats
        const [quizStats] = await pool.query(
            `SELECT 
        COUNT(DISTINCT qa.QuizID) as QuizzesTaken,
        AVG(qa.Score) as AverageScore
       FROM QuizAttempt qa
       JOIN Quiz q ON qa.QuizID = q.QuizID
       WHERE q.CourseID = ? AND qa.StudentID = ?`,
            [enrollment[0].CourseID, studentId]
        );

        // Get assignment stats
        const [assignmentStats] = await pool.query(
            `SELECT 
        COUNT(DISTINCT sub.AssignmentID) as AssignmentsSubmitted,
        AVG(sub.MarksObtained) as AverageMarks
       FROM AssignmentSubmission sub
       JOIN Assignment a ON sub.AssignmentID = a.AssignmentID
       WHERE a.CourseID = ? AND sub.StudentID = ?`,
            [enrollment[0].CourseID, studentId]
        );

        res.json({
            enrollment: enrollment[0],
            quizStats: quizStats[0] || {},
            assignmentStats: assignmentStats[0] || {}
        });
    } catch (e) { next(e); }
}
