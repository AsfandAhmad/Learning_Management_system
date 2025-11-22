import { pool } from "../config/db.js";

// GET all sections for a course with lesson breakdown
export async function getSections(req, res, next) {
    try {
        const { courseId } = req.params;

        // Verify course exists
        const [course] = await pool.query(
            "SELECT CourseID, TeacherID, Title FROM Course WHERE CourseID = ?",
            [courseId]
        );
        if (!course.length) return res.status(404).json({ message: "Course not found" });

        // Get all sections with lesson details
        const [sections] = await pool.query(
            `SELECT s.SectionID, s.CourseID, s.Title, s.PositionOrder,
              (SELECT COUNT(*) FROM Lesson WHERE SectionID = s.SectionID) AS LessonCount,
              (SELECT SUM(CASE WHEN ContentType = 'Video' THEN 1 ELSE 0 END) FROM Lesson WHERE SectionID = s.SectionID) AS VideoCount,
              (SELECT SUM(CASE WHEN ContentType = 'PDF' THEN 1 ELSE 0 END) FROM Lesson WHERE SectionID = s.SectionID) AS PDFCount
       FROM Section s 
       WHERE s.CourseID = ? 
       ORDER BY s.PositionOrder ASC`,
            [courseId]
        );

        // Get lessons for each section
        const sectionsWithLessons = await Promise.all(
            sections.map(async (section) => {
                const [lessons] = await pool.query(
                    "SELECT LessonID, Title, ContentType, PositionOrder FROM Lesson WHERE SectionID = ? ORDER BY PositionOrder",
                    [section.SectionID]
                );
                return { ...section, lessons };
            })
        );

        res.json(sectionsWithLessons);
    } catch (e) { next(e); }
}

// GET single section with all lessons
export async function getSectionById(req, res, next) {
    try {
        const { sectionId } = req.params;

        const [section] = await pool.query(
            "SELECT * FROM Section WHERE SectionID = ?",
            [sectionId]
        );
        if (!section.length) return res.status(404).json({ message: "Section not found" });

        const [lessons] = await pool.query(
            "SELECT * FROM Lesson WHERE SectionID = ? ORDER BY PositionOrder",
            [sectionId]
        );

        res.json({ ...section[0], lessons });
    } catch (e) { next(e); }
}

// POST create section (teacher only) - Coursera/Udemy style
export async function createSection(req, res, next) {
    try {
        const { courseId } = req.params;
        // Accept both Title/title and PositionOrder/positionOrder from client
        const title = req.body.Title || req.body.title || null;
        let position = req.body.PositionOrder || req.body.positionOrder || null;
        const teacherId = req.user.teacherId;

        if (!title || !String(title).trim()) {
            return res.status(400).json({ message: "Section title is required" });
        }

        // Verify course belongs to teacher
        const [course] = await pool.query(
            "SELECT TeacherID FROM Course WHERE CourseID = ?",
            [courseId]
        );
        if (!course.length || course[0].TeacherID !== teacherId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Auto-arrange position if not provided
        if (!position) {
            const [result] = await pool.query(
                "SELECT MAX(PositionOrder) as MaxPos FROM Section WHERE CourseID = ?",
                [courseId]
            );
            position = (result[0].MaxPos || 0) + 1;
        }

        const [createResult] = await pool.query(
            "INSERT INTO Section (CourseID, Title, PositionOrder) VALUES (?, ?, ?)",
            [courseId, title, position]
        );

        res.status(201).json({
            SectionID: createResult.insertId,
            CourseID: courseId,
            Title: title,
            PositionOrder: position,
            message: "Section created successfully"
        });
    } catch (e) { next(e); }
}

// PUT update section (teacher only)
export async function updateSection(req, res, next) {
    try {
        const { sectionId } = req.params;
        // Accept different casings
        const title = req.body.Title || req.body.title || null;
        const positionOrder = req.body.PositionOrder || req.body.positionOrder || null;
        const teacherId = req.user.teacherId;

        // Verify section belongs to teacher's course
        const [section] = await pool.query(
            `SELECT s.SectionID, c.TeacherID 
       FROM Section s 
       JOIN Course c ON s.CourseID = c.CourseID 
       WHERE s.SectionID = ?`,
            [sectionId]
        );
        if (!section.length || section[0].TeacherID !== teacherId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await pool.query(
            "UPDATE Section SET Title = COALESCE(?, Title), PositionOrder = COALESCE(?, PositionOrder) WHERE SectionID = ?",
            [title, positionOrder, sectionId]
        );

        res.json({ ok: true, message: "Section updated successfully" });
    } catch (e) { next(e); }
}

// DELETE section (teacher only) - cascades to lessons
export async function deleteSection(req, res, next) {
    try {
        const { sectionId } = req.params;
        const teacherId = req.user.teacherId;

        // Verify section belongs to teacher's course
        const [section] = await pool.query(
            `SELECT s.SectionID, c.TeacherID 
       FROM Section s 
       JOIN Course c ON s.CourseID = c.CourseID 
       WHERE s.SectionID = ?`,
            [sectionId]
        );
        if (!section.length || section[0].TeacherID !== teacherId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Delete associated lessons first
        await pool.query("DELETE FROM Lesson WHERE SectionID = ?", [sectionId]);
        // Then delete section
        await pool.query("DELETE FROM Section WHERE SectionID = ?", [sectionId]);

        res.json({ ok: true, message: "Section and its lessons deleted successfully" });
    } catch (e) { next(e); }
}

// GET course curriculum structure (for student view - like Udemy)
export async function getCourseCurriculum(req, res, next) {
    try {
        const { courseId } = req.params;

        // Get course info
        const [course] = await pool.query(
            "SELECT CourseID, Title, Description FROM Course WHERE CourseID = ?",
            [courseId]
        );
        if (!course.length) return res.status(404).json({ message: "Course not found" });

        // Get all sections with lessons
        const [sections] = await pool.query(
            `SELECT s.SectionID, s.Title, s.PositionOrder,
              (SELECT COUNT(*) FROM Lesson WHERE SectionID = s.SectionID) AS LessonCount
       FROM Section s 
       WHERE s.CourseID = ? 
       ORDER BY s.PositionOrder`,
            [courseId]
        );

        // Get lessons for each section
        const curriculum = await Promise.all(
            sections.map(async (section) => {
                const [lessons] = await pool.query(
                    "SELECT LessonID, Title, ContentType, PositionOrder FROM Lesson WHERE SectionID = ? ORDER BY PositionOrder",
                    [section.SectionID]
                );
                return {
                    ...section,
                    lessons: lessons.map(l => ({
                        ...l,
                        icon: l.ContentType === 'Video' ? '🎥' : l.ContentType === 'PDF' ? '📄' : '📝'
                    }))
                };
            })
        );

        res.json({
            ...course[0],
            sections: curriculum,
            totalSections: curriculum.length,
            totalLessons: curriculum.reduce((sum, s) => sum + s.lessons.length, 0)
        });
    } catch (e) { next(e); }
}

// GET student progress in course sections
export async function getStudentProgress(req, res, next) {
    try {
        const { courseId } = req.params;
        const studentId = req.user.studentId;

        // Verify student is enrolled
        const [enrollment] = await pool.query(
            "SELECT EnrollmentID, ProgressPercentage FROM Enrollment WHERE StudentID = ? AND CourseID = ?",
            [studentId, courseId]
        );
        if (!enrollment.length) {
            return res.status(403).json({ message: "Not enrolled in this course" });
        }

        // Get sections progress
        const [sections] = await pool.query(
            `SELECT s.SectionID, s.Title, s.PositionOrder,
              (SELECT COUNT(*) FROM Lesson WHERE SectionID = s.SectionID) AS TotalLessons,
              (SELECT COUNT(*) FROM ActivityLog WHERE StudentID = ? AND ActivityType = 'LessonView' AND 
               LessonID IN (SELECT LessonID FROM Lesson WHERE SectionID = s.SectionID)) AS CompletedLessons
       FROM Section s 
       WHERE s.CourseID = ? 
       ORDER BY s.PositionOrder`,
            [studentId, courseId]
        );

        // Calculate progress
        const sectionProgress = sections.map(s => ({
            ...s,
            Progress: s.TotalLessons > 0 ? Math.round((s.CompletedLessons / s.TotalLessons) * 100) : 0
        }));

        res.json({
            EnrollmentID: enrollment[0].EnrollmentID,
            CourseProgress: enrollment[0].ProgressPercentage,
            SectionProgress: sectionProgress
        });
    } catch (e) { next(e); }
}

// POST mark section as completed (student)
export async function markSectionComplete(req, res, next) {
    try {
        const { sectionId } = req.params;
        const studentId = req.user.studentId;

        // Get course from section
        const [section] = await pool.query(
            "SELECT CourseID FROM Section WHERE SectionID = ?",
            [sectionId]
        );
        if (!section.length) return res.status(404).json({ message: "Section not found" });

        // Verify student is enrolled
        const [enrollment] = await pool.query(
            "SELECT EnrollmentID FROM Enrollment WHERE StudentID = ? AND CourseID = ?",
            [studentId, section[0].CourseID]
        );
        if (!enrollment.length) {
            return res.status(403).json({ message: "Not enrolled in this course" });
        }

        // Log all lessons in section as viewed
        const [lessons] = await pool.query(
            "SELECT LessonID FROM Lesson WHERE SectionID = ?",
            [sectionId]
        );

        for (const lesson of lessons) {
            await pool.query(
                "INSERT INTO ActivityLog (StudentID, ActivityDate, ActivityType) VALUES (?, CURDATE(), 'LessonView')",
                [studentId]
            );
        }

        res.json({ ok: true, message: "Section marked as completed" });
    } catch (e) { next(e); }
}
