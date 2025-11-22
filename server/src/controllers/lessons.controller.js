import { pool } from "../config/db.js";

// GET all lessons in a section with progress
export async function getLessons(req, res, next) {
    try {
        const { sectionId } = req.params;
        const studentId = req.user?.studentId;

        // Verify section exists
        const [section] = await pool.query("SELECT SectionID FROM Section WHERE SectionID = ?", [sectionId]);
        if (!section.length) return res.status(404).json({ message: "Section not found" });

        let query = "SELECT LessonID, Title, ContentType, ContentURL, PositionOrder FROM Lesson WHERE SectionID = ? ORDER BY PositionOrder";
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
            `SELECT LessonID, Title, ContentType, ContentURL, CreatedAt FROM Lesson WHERE LessonID = ?`,
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

        // Use ContentURL for the URL (combined video and content storage)
        const lessonURL = contentURL || videoURL;

        const [result] = await pool.query(
            `INSERT INTO Lesson (SectionID, Title, ContentType, ContentURL, PositionOrder) 
             VALUES (?, ?, ?, ?, ?)`,
            [sectionId, title, contentType, lessonURL, positionOrder]
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

        // Use ContentURL for both video and content storage
        const lessonURL = contentURL || videoURL;

        await pool.query(
            `UPDATE Lesson SET Title = COALESCE(?, Title), ContentType = COALESCE(?, ContentType), ContentURL = COALESCE(?, ContentURL), 
                             PositionOrder = COALESCE(?, PositionOrder) WHERE LessonID = ?`,
            [title, contentType, lessonURL, positionOrder, lessonId]
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

// ==================== VIDEO LECTURE MANAGEMENT ====================

// POST upload lecture video
export async function uploadLessonVideo(req, res, next) {
    try {
        const { courseId, lectureId } = req.params;
        const teacherId = req.user.teacherId;

        if (!req.file) {
            return res.status(400).json({ message: "No video file uploaded" });
        }

        // Verify lesson belongs to teacher's course
        const [lesson] = await pool.query(
            `SELECT l.LessonID, s.CourseID, c.TeacherID 
             FROM Lesson l 
             JOIN Section s ON l.SectionID = s.SectionID 
             JOIN Course c ON s.CourseID = c.CourseID 
             WHERE l.LessonID = ? AND c.CourseID = ?`,
            [lectureId, courseId]
        );

        if (!lesson.length || lesson[0].TeacherID !== teacherId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Calculate video duration (basic - you might want to use ffmpeg in production)
        const fileUrl = `/uploads/videos/${courseId}/${lectureId}/${req.file.filename}`;

        // Store video metadata in database if you have a LessonVideo table
        // For now, just return the file URL
        res.status(201).json({
            message: "Video uploaded successfully",
            videoId: `${courseId}_${lectureId}_${req.file.filename}`,
            fileName: req.file.originalname,
            fileURL: fileUrl,
            fileSize: req.file.size,
            uploadedAt: new Date().toISOString()
        });
    } catch (e) { next(e); }
}

// GET all videos for a lesson
export async function getLessonVideos(req, res, next) {
    try {
        const { courseId, lectureId } = req.params;

        // Read videos from filesystem (since we don't have a LessonVideo table)
        const fs = await import('fs').then(m => m.default);
        const path = await import('path').then(m => m.default);
        const videoDirPath = path.join(process.cwd(), `uploads/videos/${courseId}/${lectureId}`);

        if (!fs.existsSync(videoDirPath)) {
            return res.json([]);
        }

        const files = fs.readdirSync(videoDirPath);
        const videos = files.map(file => ({
            videoId: file,
            fileName: file,
            fileURL: `/uploads/videos/${courseId}/${lectureId}/${file}`,
            uploadedAt: fs.statSync(path.join(videoDirPath, file)).birthtime
        }));

        res.json(videos);
    } catch (e) { next(e); }
}

// DELETE a video
export async function deleteVideo(req, res, next) {
    try {
        const { courseId, lectureId, videoId } = req.params;
        const teacherId = req.user.teacherId;

        // Verify teacher owns this course
        const [lesson] = await pool.query(
            `SELECT l.LessonID, c.TeacherID 
             FROM Lesson l 
             JOIN Section s ON l.SectionID = s.SectionID 
             JOIN Course c ON s.CourseID = c.CourseID 
             WHERE l.LessonID = ? AND c.CourseID = ?`,
            [lectureId, courseId]
        );

        if (!lesson.length || lesson[0].TeacherID !== teacherId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const fs = await import('fs').then(m => m.default);
        const path = await import('path').then(m => m.default);
        const filePath = path.join(process.cwd(), `uploads/videos/${courseId}/${lectureId}/${videoId}`);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.json({ ok: true, message: "Video deleted successfully" });
    } catch (e) { next(e); }
}

// ==================== LESSON DOCUMENTS MANAGEMENT ====================

// POST upload lesson document (teacher notes, resources)
export async function uploadLessonDocument(req, res, next) {
    try {
        const { courseId, lectureId } = req.params;
        const teacherId = req.user.teacherId;

        if (!req.file) {
            return res.status(400).json({ message: "No document file uploaded" });
        }

        // Verify lesson belongs to teacher's course
        const [lesson] = await pool.query(
            `SELECT l.LessonID, c.TeacherID 
             FROM Lesson l 
             JOIN Section s ON l.SectionID = s.SectionID 
             JOIN Course c ON s.CourseID = c.CourseID 
             WHERE l.LessonID = ? AND c.CourseID = ?`,
            [lectureId, courseId]
        );

        if (!lesson.length || lesson[0].TeacherID !== teacherId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const fileUrl = `/uploads/documents/${courseId}/${req.file.filename}`;

        res.status(201).json({
            message: "Document uploaded successfully",
            docId: `${courseId}_${req.file.filename}`,
            fileName: req.file.originalname,
            fileURL: fileUrl,
            fileSize: req.file.size,
            uploadedAt: new Date().toISOString()
        });
    } catch (e) { next(e); }
}

// GET all documents for a lesson/course
export async function getLessonDocuments(req, res, next) {
    try {
        const { courseId, lectureId } = req.params;

        const fs = await import('fs').then(m => m.default);
        const path = await import('path').then(m => m.default);
        const docDirPath = path.join(process.cwd(), `uploads/documents/${courseId}`);

        if (!fs.existsSync(docDirPath)) {
            return res.json([]);
        }

        const files = fs.readdirSync(docDirPath);
        const documents = files.map(file => ({
            docId: file,
            fileName: file,
            fileURL: `/uploads/documents/${courseId}/${file}`,
            uploadedAt: fs.statSync(path.join(docDirPath, file)).birthtime
        }));

        res.json(documents);
    } catch (e) { next(e); }
}

// DELETE a document
export async function deleteDocument(req, res, next) {
    try {
        const { courseId, lectureId, docId } = req.params;
        const teacherId = req.user.teacherId;

        // Verify teacher owns this course
        const [lesson] = await pool.query(
            `SELECT l.LessonID, c.TeacherID 
             FROM Lesson l 
             JOIN Section s ON l.SectionID = s.SectionID 
             JOIN Course c ON s.CourseID = c.CourseID 
             WHERE l.LessonID = ? AND c.CourseID = ?`,
            [lectureId, courseId]
        );

        if (!lesson.length || lesson[0].TeacherID !== teacherId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const fs = await import('fs').then(m => m.default);
        const path = await import('path').then(m => m.default);
        const filePath = path.join(process.cwd(), `uploads/documents/${courseId}/${docId}`);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.json({ ok: true, message: "Document deleted successfully" });
    } catch (e) { next(e); }
}

// ==================== STUDENT NOTES SUBMISSION ====================

// POST upload student notes/documents
export async function uploadStudentNotes(req, res, next) {
    try {
        const { courseId, lectureId } = req.params;
        const studentId = req.user.studentId;

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Verify student is enrolled in course
        const [enrolled] = await pool.query(
            `SELECT e.EnrollmentID FROM Enrollment e 
             JOIN Course c ON e.CourseID = c.CourseID 
             WHERE e.StudentID = ? AND c.CourseID = ?`,
            [studentId, courseId]
        );

        if (!enrolled.length) {
            return res.status(403).json({ message: "Not enrolled in this course" });
        }

        const fileUrl = `/uploads/documents/${courseId}/lecture_${lectureId}_submissions/${req.file.filename}`;

        res.status(201).json({
            message: "Notes submitted successfully",
            noteId: `${studentId}_${lectureId}_${req.file.filename}`,
            fileName: req.file.originalname,
            fileURL: fileUrl,
            fileSize: req.file.size,
            submittedAt: new Date().toISOString()
        });
    } catch (e) { next(e); }
}
