import { pool } from "../config/db.js";
import { deleteFile } from "../utils/fileUpload.js";
import path from "path";

// GET all assignments for a course
export async function getAssignments(req, res, next) {
    try {
        const { courseId } = req.params;

        const [assignments] = await pool.query(
            `SELECT a.*, 
              (SELECT COUNT(*) FROM AssignmentSubmission WHERE AssignmentID = a.AssignmentID AND MarksObtained IS NOT NULL) as SubmissionCount,
              (SELECT COUNT(*) FROM AssignmentSubmission WHERE AssignmentID = a.AssignmentID) as TotalSubmissions
       FROM Assignment a 
       WHERE a.CourseID = ? 
       ORDER BY a.DueDate DESC`,
            [courseId]
        );
        res.json(assignments);
    } catch (e) { next(e); }
}

// GET single assignment with submissions
export async function getAssignmentById(req, res, next) {
    try {
        const { assignmentId } = req.params;

        const [assignment] = await pool.query(
            "SELECT * FROM Assignment WHERE AssignmentID = ?",
            [assignmentId]
        );
        if (!assignment.length) return res.status(404).json({ message: "Assignment not found" });

        res.json(assignment[0]);
    } catch (e) { next(e); }
}

// GET student's assignment submissions for a course
export async function getStudentAssignments(req, res, next) {
    try {
        const { courseId } = req.params;
        const studentId = req.user.studentId;

        const [assignments] = await pool.query(
            `SELECT a.*, 
                    (SELECT COUNT(*) FROM AssignmentSubmission 
                     WHERE AssignmentID = a.AssignmentID AND StudentID = ?) as StudentSubmissions
             FROM Assignment a 
             WHERE a.CourseID = ? 
             ORDER BY a.DueDate DESC`,
            [studentId, courseId]
        );

        // Get submission details for each assignment
        for (let i = 0; i < assignments.length; i++) {
            const [submissions] = await pool.query(
                `SELECT SubmissionID, FileURL, SubmissionText, SubmissionLink, SubmittedAt, 
                        MarksObtained, Feedback, GradedAt, AttemptNumber
                 FROM AssignmentSubmission 
                 WHERE AssignmentID = ? AND StudentID = ?
                 ORDER BY AttemptNumber DESC`,
                [assignments[i].AssignmentID, studentId]
            );
            assignments[i].submissions = submissions;
        }

        res.json(assignments);
    } catch (e) { next(e); }
}

// POST create assignment (teacher only)
export async function createAssignment(req, res, next) {
    try {
        const { courseId } = req.params;
        const { Title, Description, DueDate, MaxMarks, SectionID, SubmissionType, AllowLateSubmission, MaxAttempts } = req.body;
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
            "INSERT INTO Assignment (CourseID, Title, Description, DueDate, MaxMarks) VALUES (?, ?, ?, ?, ?)",
            [courseId, Title, Description, DueDate, MaxMarks]
        );
        res.status(201).json({ AssignmentID: result.insertId, message: "Assignment created successfully" });
    } catch (e) { next(e); }
}

// PUT update assignment
export async function updateAssignment(req, res, next) {
    try {
        const { assignmentId } = req.params;
        const { Title, Description, DueDate, MaxMarks } = req.body;
        const teacherId = req.user.teacherId;

        // Verify assignment belongs to teacher's course
        const [assignment] = await pool.query(
            "SELECT a.AssignmentID, c.TeacherID FROM Assignment a JOIN Course c ON a.CourseID = c.CourseID WHERE a.AssignmentID = ?",
            [assignmentId]
        );
        if (!assignment.length || assignment[0].TeacherID !== teacherId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await pool.query(
            "UPDATE Assignment SET Title = ?, Description = ?, DueDate = ?, MaxMarks = ? WHERE AssignmentID = ?",
            [Title, Description, DueDate, MaxMarks, assignmentId]
        );
        res.json({ ok: true, message: "Assignment updated successfully" });
    } catch (e) { next(e); }
}

// DELETE assignment
export async function deleteAssignment(req, res, next) {
    try {
        const { assignmentId } = req.params;
        const teacherId = req.user.teacherId;

        // Verify assignment belongs to teacher's course
        const [assignment] = await pool.query(
            "SELECT a.AssignmentID, c.TeacherID FROM Assignment a JOIN Course c ON a.CourseID = c.CourseID WHERE a.AssignmentID = ?",
            [assignmentId]
        );
        if (!assignment.length || assignment[0].TeacherID !== teacherId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await pool.query("DELETE FROM Assignment WHERE AssignmentID = ?", [assignmentId]);
        res.json({ ok: true, message: "Assignment deleted successfully" });
    } catch (e) { next(e); }
}

// GET assignment submissions
export async function getSubmissions(req, res, next) {
    try {
        const { assignmentId } = req.params;
        const teacherId = req.user.teacherId;

        // Verify assignment belongs to teacher
        const [assignment] = await pool.query(
            "SELECT a.AssignmentID, c.TeacherID FROM Assignment a JOIN Course c ON a.CourseID = c.CourseID WHERE a.AssignmentID = ?",
            [assignmentId]
        );
        if (!assignment.length || assignment[0].TeacherID !== teacherId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const [submissions] = await pool.query(
            `SELECT sub.*, s.FullName, s.Email 
       FROM AssignmentSubmission sub 
       JOIN Student s ON sub.StudentID = s.StudentID 
       WHERE sub.AssignmentID = ? 
       ORDER BY sub.SubmittedAt DESC`,
            [assignmentId]
        );
        res.json(submissions);
    } catch (e) { next(e); }
}

// GET single submission
export async function getSubmissionById(req, res, next) {
    try {
        const { submissionId } = req.params;
        const teacherId = req.user.teacherId;

        // Verify submission belongs to teacher's assignment
        const [submission] = await pool.query(
            `SELECT sub.*, c.TeacherID 
       FROM AssignmentSubmission sub 
       JOIN Assignment a ON sub.AssignmentID = a.AssignmentID 
       JOIN Course c ON a.CourseID = c.CourseID 
       WHERE sub.SubmissionID = ?`,
            [submissionId]
        );
        if (!submission.length || submission[0].TeacherID !== teacherId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        res.json(submission[0]);
    } catch (e) { next(e); }
}

// POST submit assignment (student)
export async function submitAssignment(req, res, next) {
    try {
        const { assignmentId } = req.params;
        const { FileURL } = req.body;
        const studentId = req.user.studentId;

        // Check if already submitted
        const [existing] = await pool.query(
            "SELECT SubmissionID FROM AssignmentSubmission WHERE AssignmentID = ? AND StudentID = ?",
            [assignmentId, studentId]
        );

        if (existing.length) {
            // Update existing submission
            await pool.query(
                "UPDATE AssignmentSubmission SET FileURL = ? WHERE AssignmentID = ? AND StudentID = ?",
                [FileURL, assignmentId, studentId]
            );
            return res.json({ ok: true, message: "Submission updated successfully" });
        }

        const [result] = await pool.query(
            "INSERT INTO AssignmentSubmission (AssignmentID, StudentID, FileURL) VALUES (?, ?, ?)",
            [assignmentId, studentId, FileURL]
        );
        res.status(201).json({ SubmissionID: result.insertId, message: "Assignment submitted successfully" });
    } catch (e) { next(e); }
}

// PUT grade submission (teacher)
export async function gradeSubmission(req, res, next) {
    try {
        const { submissionId } = req.params;
        const { MarksObtained, Feedback } = req.body;
        const teacherId = req.user.teacherId;

        // Verify submission belongs to teacher
        const [submission] = await pool.query(
            `SELECT sub.SubmissionID, c.TeacherID 
       FROM AssignmentSubmission sub 
       JOIN Assignment a ON sub.AssignmentID = a.AssignmentID 
       JOIN Course c ON a.CourseID = c.CourseID 
       WHERE sub.SubmissionID = ?`,
            [submissionId]
        );
        if (!submission.length || submission[0].TeacherID !== teacherId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await pool.query(
            "UPDATE AssignmentSubmission SET MarksObtained = ?, Feedback = ? WHERE SubmissionID = ?",
            [MarksObtained, Feedback, submissionId]
        );
        res.json({ ok: true, message: "Submission graded successfully" });
    } catch (e) { next(e); }
}

// GET assignment statistics
export async function getAssignmentStats(req, res, next) {
    try {
        const { assignmentId } = req.params;
        const teacherId = req.user.teacherId;

        // Verify assignment belongs to teacher
        const [assignment] = await pool.query(
            "SELECT a.AssignmentID, c.TeacherID FROM Assignment a JOIN Course c ON a.CourseID = c.CourseID WHERE a.AssignmentID = ?",
            [assignmentId]
        );
        if (!assignment.length || assignment[0].TeacherID !== teacherId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const [stats] = await pool.query(
            `SELECT 
        COUNT(*) as TotalSubmissions,
        SUM(CASE WHEN MarksObtained IS NOT NULL THEN 1 ELSE 0 END) as GradedSubmissions,
        AVG(MarksObtained) as AverageMarks,
        MAX(MarksObtained) as HighestMarks,
        MIN(MarksObtained) as LowestMarks
       FROM AssignmentSubmission 
       WHERE AssignmentID = ?`,
            [assignmentId]
        );
        res.json(stats[0] || {});
    } catch (e) { next(e); }
}
