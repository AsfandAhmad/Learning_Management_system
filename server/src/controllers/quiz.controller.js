import { pool } from "../config/db.js";

// GET all quizzes for a course
export async function getQuizzes(req, res, next) {
    try {
        const { courseId } = req.params;

        const [quizzes] = await pool.query(
            `SELECT q.*, 
              (SELECT COUNT(*) FROM Question WHERE QuizID = q.QuizID) AS QuestionCount,
              (SELECT COUNT(*) FROM QuizAttempt WHERE QuizID = q.QuizID) AS AttemptCount
       FROM Quiz q 
       WHERE q.CourseID = ? 
       ORDER BY q.CreatedAt DESC`,
            [courseId]
        );
        res.json(quizzes);
    } catch (e) { next(e); }
}

// GET single quiz with questions
export async function getQuizById(req, res, next) {
    try {
        const { quizId } = req.params;

        const [quiz] = await pool.query(
            "SELECT * FROM Quiz WHERE QuizID = ?",
            [quizId]
        );
        if (!quiz.length) return res.status(404).json({ message: "Quiz not found" });

        const [questions] = await pool.query(
            "SELECT * FROM Question WHERE QuizID = ? ORDER BY QuestionID",
            [quizId]
        );

        res.json({ ...quiz[0], questions });
    } catch (e) { next(e); }
}

// POST create quiz
export async function createQuiz(req, res, next) {
    try {
        const { courseId } = req.params;
        const { Title, Description, TotalMarks, PassingMarks } = req.body;
        const teacherId = req.user.teacherId;

        // Verify course belongs to teacher
        const [course] = await pool.query(
            "SELECT TeacherID FROM Course WHERE CourseID = ?",
            [courseId]
        );
        if (!course.length || course[0].TeacherID !== teacherId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const [result] = await pool.query(
            "INSERT INTO Quiz (CourseID, Title, Description, TotalMarks, PassingMarks) VALUES (?, ?, ?, ?, ?)",
            [courseId, Title, Description, TotalMarks, PassingMarks]
        );
        res.status(201).json({
            QuizID: result.insertId,
            message: "Quiz created successfully"
        });
    } catch (e) { next(e); }
}

// PUT update quiz
export async function updateQuiz(req, res, next) {
    try {
        const { quizId } = req.params;
        const { Title, Description, TotalMarks, PassingMarks } = req.body;
        const teacherId = req.user.teacherId;

        // Verify quiz belongs to teacher's course
        const [quiz] = await pool.query(
            "SELECT q.QuizID, c.TeacherID FROM Quiz q JOIN Course c ON q.CourseID = c.CourseID WHERE q.QuizID = ?",
            [quizId]
        );
        if (!quiz.length || quiz[0].TeacherID !== teacherId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await pool.query(
            "UPDATE Quiz SET Title = ?, Description = ?, TotalMarks = ?, PassingMarks = ? WHERE QuizID = ?",
            [Title, Description, TotalMarks, PassingMarks, quizId]
        );
        res.json({ ok: true, message: "Quiz updated successfully" });
    } catch (e) { next(e); }
}

// DELETE quiz
export async function deleteQuiz(req, res, next) {
    try {
        const { quizId } = req.params;
        const teacherId = req.user.teacherId;

        // Verify quiz belongs to teacher's course
        const [quiz] = await pool.query(
            "SELECT q.QuizID, c.TeacherID FROM Quiz q JOIN Course c ON q.CourseID = c.CourseID WHERE q.QuizID = ?",
            [quizId]
        );
        if (!quiz.length || quiz[0].TeacherID !== teacherId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Delete associated questions and attempts
        await pool.query("DELETE FROM Question WHERE QuizID = ?", [quizId]);
        await pool.query("DELETE FROM QuizAttempt WHERE QuizID = ?", [quizId]);
        await pool.query("DELETE FROM Quiz WHERE QuizID = ?", [quizId]);

        res.json({ ok: true, message: "Quiz deleted successfully" });
    } catch (e) { next(e); }
}

// POST submit quiz attempt
export async function submitQuizAttempt(req, res, next) {
    try {
        const { quizId } = req.params;
        const { answers } = req.body;
        const studentId = req.user.studentId;

        // Get quiz details
        const [quiz] = await pool.query(
            "SELECT * FROM Quiz WHERE QuizID = ?",
            [quizId]
        );
        if (!quiz.length) return res.status(404).json({ message: "Quiz not found" });

        // Get questions
        const [questions] = await pool.query(
            "SELECT * FROM Question WHERE QuizID = ?",
            [quizId]
        );

        // Calculate score
        let score = 0;
        questions.forEach(q => {
            if (answers[q.QuestionID] === q.CorrectOption) {
                score += q.Marks || 1;
            }
        });

        // Insert attempt
        const [result] = await pool.query(
            "INSERT INTO QuizAttempt (QuizID, StudentID, Score, AttemptDate) VALUES (?, ?, ?, NOW())",
            [quizId, studentId, score]
        );

        res.status(201).json({
            AttemptID: result.insertId,
            Score: score,
            TotalMarks: quiz[0].TotalMarks,
            Passed: score >= quiz[0].PassingMarks,
            message: "Quiz attempt recorded"
        });
    } catch (e) { next(e); }
}

// GET student's quiz attempts
export async function getStudentQuizAttempts(req, res, next) {
    try {
        const { quizId } = req.params;
        const studentId = req.user.studentId;

        const [attempts] = await pool.query(
            "SELECT * FROM QuizAttempt WHERE QuizID = ? AND StudentID = ? ORDER BY AttemptDate DESC",
            [quizId, studentId]
        );
        res.json(attempts);
    } catch (e) { next(e); }
}
