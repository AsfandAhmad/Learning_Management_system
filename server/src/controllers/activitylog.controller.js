import { pool } from "../config/db.js";

// GET all activities for a student
export async function getStudentActivities(req, res, next) {
    try {
        const studentId = req.user.id;

        const [activities] = await pool.query(
            `SELECT al.LogID, al.StudentID, al.ActivityDate, al.ActivityType,
                    c.CourseID, c.Title as CourseName
             FROM ActivityLog al
             LEFT JOIN Course c ON al.CourseID = c.CourseID
             WHERE al.StudentID = ?
             ORDER BY al.ActivityDate DESC
             LIMIT 100`,
            [studentId]
        );

        res.json(activities);
    } catch (e) { next(e); }
}

// GET activities by course
export async function getCourseActivities(req, res, next) {
    try {
        const { courseId } = req.params;
        const studentId = req.user.id;

        const [activities] = await pool.query(
            `SELECT al.LogID, al.StudentID, al.ActivityDate, al.ActivityType,
                    s.FullName, s.StudentID
             FROM ActivityLog al
             JOIN Student s ON al.StudentID = s.StudentID
             WHERE al.CourseID = ? AND al.StudentID = ?
             ORDER BY al.ActivityDate DESC`,
            [courseId, studentId]
        );

        res.json(activities);
    } catch (e) { next(e); }
}

// GET activity statistics for a course
export async function getCourseActivityStats(req, res, next) {
    try {
        const { courseId } = req.params;
        const studentId = req.user.id;

        const [stats] = await pool.query(
            `SELECT 
                COUNT(*) as TotalActivities,
                COUNT(CASE WHEN ActivityType = 'Login' THEN 1 END) as Logins,
                COUNT(CASE WHEN ActivityType = 'LessonView' THEN 1 END) as LessonViews,
                COUNT(CASE WHEN ActivityType = 'QuizAttempt' THEN 1 END) as QuizAttempts,
                COUNT(CASE WHEN ActivityType = 'Submission' THEN 1 END) as Submissions,
                MAX(ActivityDate) as LastActivity,
                MIN(ActivityDate) as FirstActivity
             FROM ActivityLog
             WHERE CourseID = ? AND StudentID = ?`,
            [courseId, studentId]
        );

        res.json(stats[0]);
    } catch (e) { next(e); }
}

// POST log activity
export async function logActivity(req, res, next) {
    try {
        const { courseId } = req.params;
        const { ActivityType } = req.body;
        const studentId = req.user.id;

        // Validate ActivityType
        const validTypes = ['Login', 'LessonView', 'QuizAttempt', 'Submission'];
        if (!validTypes.includes(ActivityType)) {
            return res.status(400).json({ message: "Invalid activity type" });
        }

        const [result] = await pool.query(
            `INSERT INTO ActivityLog (StudentID, CourseID, ActivityDate, ActivityType)
             VALUES (?, ?, CURDATE(), ?)`,
            [studentId, courseId, ActivityType]
        );

        res.json({ LogID: result.insertId, message: "Activity logged successfully" });
    } catch (e) { next(e); }
}

// GET activity summary (for dashboard)
export async function getActivitySummary(req, res, next) {
    try {
        const studentId = req.user.id;

        const [summary] = await pool.query(
            `SELECT 
                COUNT(*) as TotalActivities,
                COUNT(CASE WHEN ActivityType = 'LessonView' THEN 1 END) as LessonsViewed,
                COUNT(CASE WHEN ActivityType = 'QuizAttempt' THEN 1 END) as QuizzesAttempted,
                COUNT(CASE WHEN ActivityType = 'Submission' THEN 1 END) as AssignmentsSubmitted,
                COUNT(DISTINCT CourseID) as ActiveCourses,
                MAX(ActivityDate) as LastActive
             FROM ActivityLog
             WHERE StudentID = ?`,
            [studentId]
        );

        res.json(summary[0]);
    } catch (e) { next(e); }
}

// DELETE activity (admin only)
export async function deleteActivity(req, res, next) {
    try {
        const { logId } = req.params;

        // Check if admin
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: "Unauthorized: Admin only" });
        }

        await pool.query("DELETE FROM ActivityLog WHERE LogID = ?", [logId]);
        res.json({ message: "Activity deleted successfully" });
    } catch (e) { next(e); }
}

// GET student activity history for a specific lesson
export async function getLessonActivityHistory(req, res, next) {
    try {
        const { courseId, lessonId } = req.params;
        const studentId = req.user.id;

        const [activities] = await pool.query(
            `SELECT al.LogID, al.ActivityDate, al.ActivityType,
                    l.Title as LessonTitle, s.Title as SectionTitle
             FROM ActivityLog al
             JOIN Lesson l ON al.LessonID = l.LessonID
             JOIN Section s ON l.SectionID = s.SectionID
             WHERE al.StudentID = ? AND al.CourseID = ? AND al.LessonID = ?
             ORDER BY al.ActivityDate DESC`,
            [studentId, courseId, lessonId]
        );

        res.json(activities);
    } catch (e) { next(e); }
}

// GET class activity (teacher view)
export async function getClassActivity(req, res, next) {
    try {
        const { courseId } = req.params;
        const teacherId = req.user.teacherId;

        // Verify course belongs to teacher
        const [course] = await pool.query(
            "SELECT TeacherID FROM Course WHERE CourseID = ?",
            [courseId]
        );

        if (!course.length || course[0].TeacherID !== teacherId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const [activities] = await pool.query(
            `SELECT al.LogID, al.StudentID, al.ActivityDate, al.ActivityType,
                    s.FullName, s.Email,
                    COUNT(*) as ActivityCount
             FROM ActivityLog al
             JOIN Student s ON al.StudentID = s.StudentID
             WHERE al.CourseID = ?
             GROUP BY al.StudentID, DATE(al.ActivityDate)
             ORDER BY al.ActivityDate DESC`,
            [courseId]
        );

        res.json(activities);
    } catch (e) { next(e); }
}
