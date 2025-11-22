import { pool } from "../config/db.js";

// GET all lessons in a section with progress
export async function getLessons(req, res, next) {
    try {
        const { sectionId } = req.params;
        const studentId = req.user?.studentId;

        // Verify section exists
        const [section] = await pool.query("SELECT SectionID FROM Section WHERE SectionID = ?", [sectionId]);
        if (!section.length) return res.status(404).json({ message: "Section not found" });

        let query = "SELECT LessonID, Title, ContentType, VideoURL, VideoDuration, PositionOrder FROM Lesson WHERE SectionID = ? ORDER BY PositionOrder";
        const params = [sectionId];
        
        const [lessons] = await pool.query(query, params);

        // Get progress for each lesson if student is logged in
        if (studentId) {
            for (let i = 0; i < lessons.length; i++) {
                const [progress] = await pool.query(
                    "SELECT Completed, LastPosition, TimeSpent FROM LessonProgress WHERE StudentID = ? AND LessonID = ?",
                    [studentId, lessons[i].LessonID]
                );
                lessons[i].progress = progress.length ? progress[0] : { Completed: false, LastPosition: 0, TimeSpent: 0 };
            }
        }

        res.json(lessons);
    } catch (e) { next(e); }
}

// GET single lesson with full details
export async function getLessonById(req, res, next) {
    try {
        const { lessonId } = req.params;
        const studentId = req.user?.studentId;

        const [lesson] = await pool.query(
            `SELECT LessonID, Title, ContentType, ContentURL, VideoURL, VideoDuration, 
                    Notes, LessonType, CreatedAt FROM Lesson WHERE LessonID = ?`,
            [lessonId]
        );
        if (!lesson.length) return res.status(404).json({ message: "Lesson not found" });

        const lessonData = lesson[0];

        // Get progress if student is logged in
        if (studentId) {
            const [progress] = await pool.query(
                "SELECT Completed, LastPosition, TimeSpent FROM LessonProgress WHERE StudentID = ? AND LessonID = ?",
                [studentId, lessonId]
            );
            lessonData.progress = progress.length ? progress[0] : { Completed: false, LastPosition: 0, TimeSpent: 0 };

            // Get student notes for this lesson
            const [notes] = await pool.query(
                "SELECT NoteID, Content, VideoTimestamp, CreatedAt FROM StudentNotes WHERE StudentID = ? AND LessonID = ? ORDER BY CreatedAt DESC",
                [studentId, lessonId]
            );
            lessonData.studentNotes = notes;
        }

        res.json(lessonData);
    } catch (e) { next(e); }
}

// POST create lesson (teacher only)
export async function createLesson(req, res, next) {
    try {
        const { sectionId } = req.params;
        // Accept both Title/title and different casings from client
        const title = req.body.Title || req.body.title || null;
        const contentType = req.body.ContentType || req.body.contentType || req.body.content || null;
        const contentURL = req.body.ContentURL || req.body.contentURL || req.body.contentURL || null;
        const videoURL = req.body.VideoURL || req.body.videoURL || null;
        const videoDuration = req.body.VideoDuration || req.body.videoDuration || req.body.duration || null;
        const notes = req.body.Notes || req.body.notes || null;
        const lessonType = req.body.LessonType || req.body.lessonType || 'Mixed';
        let positionOrder = req.body.PositionOrder || req.body.positionOrder || null;
        const teacherId = req.user.teacherId;

        if (!title || !String(title).trim()) {
            return res.status(400).json({ message: 'Lesson title is required' });
        }

        // Verify section belongs to teacher's course
        const [section] = await pool.query(
            "SELECT s.SectionID, c.TeacherID FROM Section s JOIN Course c ON s.CourseID = c.CourseID WHERE s.SectionID = ?",
            [sectionId]
        );
        if (!section.length || section[0].TeacherID !== teacherId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Auto-calc position if not provided
        if (!positionOrder) {
            const [posRes] = await pool.query("SELECT MAX(PositionOrder) as MaxPos FROM Lesson WHERE SectionID = ?", [sectionId]);
            positionOrder = (posRes[0].MaxPos || 0) + 1;
        }

        const [result] = await pool.query(
            `INSERT INTO Lesson (SectionID, Title, ContentType, ContentURL, VideoURL, VideoDuration, 
                                Notes, LessonType, PositionOrder) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [sectionId, title, contentType, contentURL, videoURL, videoDuration || null, notes, lessonType || 'Mixed', positionOrder]
        );
        res.status(201).json({ LessonID: result.insertId, message: "Lesson created successfully" });
    } catch (e) { next(e); }
}

// PUT update lesson (teacher only)
export async function updateLesson(req, res, next) {
    try {
        const { lessonId } = req.params;
        // Support multiple casings
        const title = req.body.Title || req.body.title || null;
        const contentType = req.body.ContentType || req.body.contentType || null;
        const contentURL = req.body.ContentURL || req.body.contentURL || null;
        const videoURL = req.body.VideoURL || req.body.videoURL || null;
        const videoDuration = req.body.VideoDuration || req.body.videoDuration || req.body.duration || null;
        const notes = req.body.Notes || req.body.notes || null;
        const lessonType = req.body.LessonType || req.body.lessonType || null;
        const positionOrder = req.body.PositionOrder || req.body.positionOrder || null;
        const teacherId = req.user.teacherId;

        // Verify lesson belongs to teacher's course
        const [lesson] = await pool.query(
            "SELECT l.LessonID, c.TeacherID FROM Lesson l JOIN Section s ON l.SectionID = s.SectionID JOIN Course c ON s.CourseID = c.CourseID WHERE l.LessonID = ?",
            [lessonId]
        );
        if (!lesson.length || lesson[0].TeacherID !== teacherId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await pool.query(
            `UPDATE Lesson SET Title = COALESCE(?, Title), ContentType = COALESCE(?, ContentType), ContentURL = COALESCE(?, ContentURL), 
                             VideoURL = COALESCE(?, VideoURL), VideoDuration = COALESCE(?, VideoDuration), Notes = COALESCE(?, Notes), 
                             LessonType = COALESCE(?, LessonType), PositionOrder = COALESCE(?, PositionOrder) WHERE LessonID = ?`,
            [title, contentType, contentURL, videoURL, videoDuration, notes, lessonType, positionOrder, lessonId]
        );
        res.json({ ok: true, message: "Lesson updated successfully" });
    } catch (e) { next(e); }
}

// DELETE lesson
export async function deleteLesson(req, res, next) {
    try {
        const { lessonId } = req.params;
        const teacherId = req.user.teacherId;

        // Verify lesson belongs to teacher's course
        const [lesson] = await pool.query(
            "SELECT l.LessonID, c.TeacherID FROM Lesson l JOIN Section s ON l.SectionID = s.SectionID JOIN Course c ON s.CourseID = c.CourseID WHERE l.LessonID = ?",
            [lessonId]
        );
        if (!lesson.length || lesson[0].TeacherID !== teacherId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await pool.query("DELETE FROM Lesson WHERE LessonID = ?", [lessonId]);
        res.json({ ok: true, message: "Lesson deleted successfully" });
    } catch (e) { next(e); }
}

// PUT update lesson progress (student)
export async function updateLessonProgress(req, res, next) {
    try {
        const { lessonId } = req.params;
        const studentId = req.user.studentId;
        const { Completed, LastPosition, TimeSpent } = req.body;

        // Check if progress record exists
        const [existing] = await pool.query(
            "SELECT ProgressID FROM LessonProgress WHERE StudentID = ? AND LessonID = ?",
            [studentId, lessonId]
        );

        if (existing.length) {
            // Update existing progress
            await pool.query(
                `UPDATE LessonProgress SET Completed = ?, LastPosition = ?, TimeSpent = TimeSpent + ?
                 WHERE StudentID = ? AND LessonID = ?`,
                [Completed || false, LastPosition || 0, TimeSpent || 0, studentId, lessonId]
            );
        } else {
            // Create new progress record
            await pool.query(
                `INSERT INTO LessonProgress (StudentID, LessonID, Completed, LastPosition, TimeSpent, CompletedAt)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [studentId, lessonId, Completed || false, LastPosition || 0, TimeSpent || 0, Completed ? new Date() : null]
            );
        }

        res.json({ ok: true, message: "Progress updated successfully" });
    } catch (e) { next(e); }
}

// POST save student notes
export async function saveStudentNote(req, res, next) {
    try {
        const { lessonId } = req.params;
        const studentId = req.user.studentId;
        const { Content, VideoTimestamp } = req.body;

        if (!Content) {
            return res.status(400).json({ message: "Note content is required" });
        }

        const [result] = await pool.query(
            `INSERT INTO StudentNotes (StudentID, LessonID, Content, VideoTimestamp)
             VALUES (?, ?, ?, ?)`,
            [studentId, lessonId, Content, VideoTimestamp || null]
        );

        res.status(201).json({
            NoteID: result.insertId,
            message: "Note saved successfully"
        });
    } catch (e) { next(e); }
}

// GET student notes for a lesson
export async function getStudentNotes(req, res, next) {
    try {
        const { lessonId } = req.params;
        const studentId = req.user.studentId;

        const [notes] = await pool.query(
            "SELECT NoteID, Content, VideoTimestamp, CreatedAt FROM StudentNotes WHERE StudentID = ? AND LessonID = ? ORDER BY CreatedAt DESC",
            [studentId, lessonId]
        );

        res.json(notes);
    } catch (e) { next(e); }
}

// PUT update student note
export async function updateStudentNote(req, res, next) {
    try {
        const { noteId } = req.params;
        const studentId = req.user.studentId;
        const { Content } = req.body;

        // Verify note belongs to student
        const [note] = await pool.query(
            "SELECT NoteID FROM StudentNotes WHERE NoteID = ? AND StudentID = ?",
            [noteId, studentId]
        );

        if (!note.length) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await pool.query(
            "UPDATE StudentNotes SET Content = ? WHERE NoteID = ?",
            [Content, noteId]
        );

        res.json({ ok: true, message: "Note updated successfully" });
    } catch (e) { next(e); }
}

// DELETE student note
export async function deleteStudentNote(req, res, next) {
    try {
        const { noteId } = req.params;
        const studentId = req.user.studentId;

        // Verify note belongs to student
        const [note] = await pool.query(
            "SELECT NoteID FROM StudentNotes WHERE NoteID = ? AND StudentID = ?",
            [noteId, studentId]
        );

        if (!note.length) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await pool.query("DELETE FROM StudentNotes WHERE NoteID = ?", [noteId]);
        res.json({ ok: true, message: "Note deleted successfully" });
    } catch (e) { next(e); }
}

// GET lesson view count (for analytics)
export async function getLessonViews(req, res, next) {
    try {
        const { lessonId } = req.params;

        const [views] = await pool.query(
            "SELECT COUNT(*) as ViewCount FROM ActivityLog WHERE ActivityType = 'LessonView' AND LessonID = ?",
            [lessonId]
        );
        res.json(views[0] || { ViewCount: 0 });
    } catch (e) { next(e); }
}
