import { pool } from "../config/db.js";

// GET all questions for a quiz
export async function getQuestions(req, res, next) {
    try {
        const { courseId, quizId } = req.params;

        // Verify quiz belongs to course
        const [quiz] = await pool.query(
            "SELECT CourseID FROM Quiz WHERE QuizID = ?",
            [quizId]
        );

        if (!quiz.length || quiz[0].CourseID !== parseInt(courseId)) {
            return res.status(404).json({ message: "Quiz not found in this course" });
        }

        const [questions] = await pool.query(
            `SELECT q.QuestionID, q.QuestionText, q.OptionA, q.OptionB, q.OptionC, q.OptionD,
                    q.Marks
             FROM Question q
             WHERE q.QuizID = ?
             ORDER BY q.QuestionID ASC`,
            [quizId]
        );

        res.json(questions);
    } catch (e) { next(e); }
}

// GET single question
export async function getQuestion(req, res, next) {
    try {
        const { questionId } = req.params;

        const [question] = await pool.query(
            `SELECT q.QuestionID, q.QuestionText, q.OptionA, q.OptionB, q.OptionC, q.OptionD,
                    q.CorrectOption, q.Marks, q.QuizID
             FROM Question q
             WHERE q.QuestionID = ?`,
            [questionId]
        );

        if (!question.length) {
            return res.status(404).json({ message: "Question not found" });
        }

        res.json(question[0]);
    } catch (e) { next(e); }
}

// POST create question
export async function createQuestion(req, res, next) {
    try {
        const { courseId, quizId } = req.params;
        const { QuestionText, OptionA, OptionB, OptionC, OptionD, CorrectOption, Marks } = req.body;
        const teacherId = req.user.teacherId;

        // Verify quiz belongs to course and course belongs to teacher
        const [quiz] = await pool.query(
            "SELECT q.CourseID FROM Quiz q WHERE q.QuizID = ?",
            [quizId]
        );

        if (!quiz.length || quiz[0].CourseID !== parseInt(courseId)) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        const [course] = await pool.query(
            "SELECT TeacherID FROM Course WHERE CourseID = ?",
            [courseId]
        );

        if (!course.length || course[0].TeacherID !== teacherId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Validate inputs
        if (!QuestionText || !OptionA || !OptionB || !OptionC || !OptionD || !CorrectOption) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        if (!['A', 'B', 'C', 'D'].includes(CorrectOption)) {
            return res.status(400).json({ message: "CorrectOption must be A, B, C, or D" });
        }

        const [result] = await pool.query(
            `INSERT INTO Question (QuestionText, OptionA, OptionB, OptionC, OptionD, CorrectOption, Marks, QuizID)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [QuestionText, OptionA, OptionB, OptionC, OptionD, CorrectOption, Marks || 1, quizId]
        );

        res.status(201).json({
            QuestionID: result.insertId,
            message: "Question created successfully"
        });
    } catch (e) { next(e); }
}

// PUT update question
export async function updateQuestion(req, res, next) {
    try {
        const { courseId, questionId } = req.params;
        const { QuestionText, OptionA, OptionB, OptionC, OptionD, CorrectOption, Marks } = req.body;
        const teacherId = req.user.teacherId;

        // Verify question and course
        const [question] = await pool.query(
            `SELECT q.QuizID FROM Question q 
             JOIN Quiz qz ON q.QuizID = qz.QuizID 
             WHERE q.QuestionID = ? AND qz.CourseID = ?`,
            [questionId, courseId]
        );

        if (!question.length) {
            return res.status(404).json({ message: "Question not found" });
        }

        // Verify teacher owns course
        const [course] = await pool.query(
            "SELECT TeacherID FROM Course WHERE CourseID = ?",
            [courseId]
        );

        if (!course.length || course[0].TeacherID !== teacherId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Validate CorrectOption if provided
        if (CorrectOption && !['A', 'B', 'C', 'D'].includes(CorrectOption)) {
            return res.status(400).json({ message: "CorrectOption must be A, B, C, or D" });
        }

        await pool.query(
            `UPDATE Question 
             SET QuestionText = COALESCE(?, QuestionText),
                 OptionA = COALESCE(?, OptionA),
                 OptionB = COALESCE(?, OptionB),
                 OptionC = COALESCE(?, OptionC),
                 OptionD = COALESCE(?, OptionD),
                 CorrectOption = COALESCE(?, CorrectOption),
                 Marks = COALESCE(?, Marks)
             WHERE QuestionID = ?`,
            [QuestionText, OptionA, OptionB, OptionC, OptionD, CorrectOption, Marks, questionId]
        );

        res.json({ message: "Question updated successfully" });
    } catch (e) { next(e); }
}

// DELETE question
export async function deleteQuestion(req, res, next) {
    try {
        const { courseId, questionId } = req.params;
        const teacherId = req.user.teacherId;

        // Verify question and course
        const [question] = await pool.query(
            `SELECT q.QuestionID FROM Question q 
             JOIN Quiz qz ON q.QuizID = qz.QuizID 
             WHERE q.QuestionID = ? AND qz.CourseID = ?`,
            [questionId, courseId]
        );

        if (!question.length) {
            return res.status(404).json({ message: "Question not found" });
        }

        // Verify teacher owns course
        const [course] = await pool.query(
            "SELECT TeacherID FROM Course WHERE CourseID = ?",
            [courseId]
        );

        if (!course.length || course[0].TeacherID !== teacherId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await pool.query("DELETE FROM Question WHERE QuestionID = ?", [questionId]);

        res.json({ message: "Question deleted successfully" });
    } catch (e) { next(e); }
}

// GET questions with answer key (teacher only)
export async function getQuestionsWithAnswerKey(req, res, next) {
    try {
        const { courseId, quizId } = req.params;
        const teacherId = req.user.teacherId;

        // Verify course belongs to teacher
        const [course] = await pool.query(
            "SELECT TeacherID FROM Course WHERE CourseID = ?",
            [courseId]
        );

        if (!course.length || course[0].TeacherID !== teacherId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const [questions] = await pool.query(
            `SELECT q.QuestionID, q.QuestionText, q.OptionA, q.OptionB, q.OptionC, q.OptionD,
                    q.CorrectOption, q.Marks
             FROM Question q
             WHERE q.QuizID = ?
             ORDER BY q.QuestionID ASC`,
            [quizId]
        );

        res.json(questions);
    } catch (e) { next(e); }
}

// POST bulk create questions
export async function bulkCreateQuestions(req, res, next) {
    try {
        const { courseId, quizId } = req.params;
        const { questions } = req.body;
        const teacherId = req.user.teacherId;

        // Verify course and quiz
        const [course] = await pool.query(
            "SELECT TeacherID FROM Course WHERE CourseID = ?",
            [courseId]
        );

        if (!course.length || course[0].TeacherID !== teacherId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const [quiz] = await pool.query(
            "SELECT CourseID FROM Quiz WHERE QuizID = ?",
            [quizId]
        );

        if (!quiz.length || quiz[0].CourseID !== parseInt(courseId)) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        // Validate questions array
        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ message: "Questions array is required" });
        }

        const createdQuestions = [];

        for (const q of questions) {
            const { QuestionText, OptionA, OptionB, OptionC, OptionD, CorrectOption, Marks } = q;

            if (!QuestionText || !OptionA || !OptionB || !OptionC || !OptionD || !CorrectOption) {
                return res.status(400).json({ message: "All fields required for each question" });
            }

            if (!['A', 'B', 'C', 'D'].includes(CorrectOption)) {
                return res.status(400).json({ message: "CorrectOption must be A, B, C, or D" });
            }

            const [result] = await pool.query(
                `INSERT INTO Question (QuestionText, OptionA, OptionB, OptionC, OptionD, CorrectOption, Marks, QuizID)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [QuestionText, OptionA, OptionB, OptionC, OptionD, CorrectOption, Marks || 1, quizId]
            );

            createdQuestions.push({ QuestionID: result.insertId });
        }

        res.status(201).json({
            message: `${createdQuestions.length} questions created successfully`,
            questions: createdQuestions
        });
    } catch (e) { next(e); }
}

// GET question statistics
export async function getQuestionStats(req, res, next) {
    try {
        const { courseId, quizId } = req.params;

        const [stats] = await pool.query(
            `SELECT 
                COUNT(*) as TotalQuestions,
                AVG(Marks) as AverageMarks,
                SUM(Marks) as TotalMarks,
                MIN(Marks) as MinMarks,
                MAX(Marks) as MaxMarks
             FROM Question
             WHERE QuizID = ?`,
            [quizId]
        );

        res.json(stats[0]);
    } catch (e) { next(e); }
}
