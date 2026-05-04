import { pool } from "../config/db.js";

// GET student's overall course progress
export async function getCourseProgress(req, res, next) {
    try {
        const { courseId } = req.params;
        const studentId = req.user.studentId;

        // Get enrollment info
        const [enrollment] = await pool.query(
            `SELECT EnrollmentID, ProgressPercentage, Status FROM Enrollment 
             WHERE StudentID = ? AND CourseID = ?`,
            [studentId, courseId]
        );

        if (!enrollment.length) {
            return res.status(404).json({ message: "Not enrolled in this course" });
        }

        // Get course sections
        const [sections] = await pool.query(
            "SELECT SectionID, Title FROM Section WHERE CourseID = ? ORDER BY PositionOrder",
            [courseId]
        );

        // Get progress for each section
        for (let section of sections) {
            const [lessons] = await pool.query(
                `SELECT LessonID FROM Lesson WHERE SectionID = ?`,
                [section.SectionID]
            );

            let completedLessons = 0;
            for (let lesson of lessons) {
                const [progress] = await pool.query(
                    "SELECT Completed FROM LessonProgress WHERE StudentID = ? AND LessonID = ?",
                    [studentId, lesson.LessonID]
                );
                if (progress.length && progress[0].Completed) {
                    completedLessons++;
                }
            }

            section.totalLessons = lessons.length;
            section.completedLessons = completedLessons;
            section.sectionProgress = lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0;
        }

        // Calculate overall progress
        let totalLessons = 0;
        let totalCompleted = 0;
        sections.forEach(section => {
            totalLessons += section.totalLessons;
            totalCompleted += section.completedLessons;
        });

        const overallProgress = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

        res.json({
            enrollment: enrollment[0],
            overallProgress,
            sections,
            totalLessons,
            totalCompleted
        });
    } catch (e) { next(e); }
}

// GET student analytics
export async function getStudentAnalytics(req, res, next) {
    try {
        const studentId = req.user.studentId;

        // Get enrollments and progress
        const [enrollments] = await pool.query(
            `SELECT c.CourseID, c.Title, e.ProgressPercentage, e.Status, e.EnrollDate, e.CompletionDate
             FROM Enrollment e
             JOIN Course c ON e.CourseID = c.CourseID
             WHERE e.StudentID = ?
             ORDER BY e.EnrollDate DESC`,
            [studentId]
        );

        // Get time spent on lessons
        const [timeStats] = await pool.query(
            `SELECT SUM(lp.TimeSpent) as TotalTimeSpent, COUNT(DISTINCT lp.LessonID) as LessonsCompleted
             FROM LessonProgress lp
             WHERE lp.StudentID = ? AND lp.Completed = TRUE`,
            [studentId]
        );

        // Get quiz performance
        const [quizStats] = await pool.query(
            `SELECT AVG(qa.Score) as AverageScore, COUNT(qa.AttemptID) as QuizzesTaken
             FROM QuizAttempt qa
             JOIN Quiz q ON qa.QuizID = q.QuizID
             WHERE qa.StudentID = ?`,
            [studentId]
        );

        // Get assignment statistics
        const [assignmentStats] = await pool.query(
            `SELECT COUNT(DISTINCT sub.SubmissionID) as SubmissionsGraded,
                    AVG(sub.MarksObtained) as AverageMarks,
                    COUNT(DISTINCT sub.AssignmentID) as AssignmentsSubmitted
             FROM AssignmentSubmission sub
             WHERE sub.StudentID = ? AND sub.MarksObtained IS NOT NULL`,
            [studentId]
        );

        res.json({
            enrollments,
            timeStats: timeStats[0],
            quizStats: quizStats[0],
            assignmentStats: assignmentStats[0],
            learningStreak: {
                currentStreak: 0, // TODO: Calculate from activity log
                longestStreak: 0
            }
        });
    } catch (e) { next(e); }
}

// GET course enrollment progress (instructor view)
export async function getCourseEnrollmentProgress(req, res, next) {
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

        // Get all students enrolled
        const [enrollments] = await pool.query(
            `SELECT e.EnrollmentID, e.StudentID, s.FullName, s.Email, 
                    e.ProgressPercentage, e.Status, e.EnrollDate,
                    COUNT(DISTINCT lp.LessonID) as LessonsCompleted
             FROM Enrollment e
             JOIN Student s ON e.StudentID = s.StudentID
             LEFT JOIN LessonProgress lp ON e.StudentID = lp.StudentID AND lp.Completed = TRUE
             WHERE e.CourseID = ?
             GROUP BY e.EnrollmentID
             ORDER BY e.ProgressPercentage DESC`,
            [courseId]
        );

        // Calculate course completion stats
        const [stats] = await pool.query(
            `SELECT 
                AVG(e.ProgressPercentage) as AverageProgress,
                COUNT(CASE WHEN e.Status = 'Completed' THEN 1 END) as CompletedStudents,
                COUNT(CASE WHEN e.Status = 'Active' THEN 1 END) as ActiveStudents,
                COUNT(e.EnrollmentID) as TotalStudents
             FROM Enrollment e
             WHERE e.CourseID = ?`,
            [courseId]
        );

        res.json({
            courseStats: stats[0],
            enrollments
        });
    } catch (e) { next(e); }
}

// GET instructor analytics dashboard
export async function getInstructorAnalytics(req, res, next) {
    try {
        const teacherId = req.user.teacherId;

        // Get course statistics
        const [courses] = await pool.query(
            `SELECT c.CourseID, c.Title, c.Status,
                    COUNT(e.EnrollmentID) as TotalEnrollments,
                    AVG(e.ProgressPercentage) as AverageProgress,
                    COUNT(CASE WHEN e.Status = 'Completed' THEN 1 END) as CompletedStudents
             FROM Course c
             LEFT JOIN Enrollment e ON c.CourseID = e.CourseID
             WHERE c.TeacherID = ?
             GROUP BY c.CourseID
             ORDER BY c.CreatedAt DESC`,
            [teacherId]
        );

        // Get overall statistics
        const [overallStats] = await pool.query(
            `SELECT 
                COUNT(DISTINCT c.CourseID) as TotalCourses,
                SUM(CASE WHEN c.Status = 'Published' THEN 1 ELSE 0 END) as PublishedCourses,
                COUNT(DISTINCT e.StudentID) as TotalStudents,
                AVG(e.ProgressPercentage) as AverageStudentProgress
             FROM Course c
             LEFT JOIN Enrollment e ON c.CourseID = e.CourseID
             WHERE c.TeacherID = ?`,
            [teacherId]
        );

        res.json({
            courses,
            overallStats: overallStats[0]
        });
    } catch (e) { next(e); }
}

export default {
    getCourseProgress,
    getStudentAnalytics,
    getCourseEnrollmentProgress,
    getInstructorAnalytics
};
