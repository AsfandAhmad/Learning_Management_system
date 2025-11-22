import { Router } from "express";
import {
    getAssignments,
    getAssignmentById,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    getSubmissions,
    getSubmissionById,
    submitAssignment,
    gradeSubmission,
    getAssignmentStats
} from "../controllers/assignments.controller.js";
import { isAuth, isInstructor, isStudent } from "../middleware/auth.js";

const router = Router({ mergeParams: true });

// List all assignments (public)
router.get("/", getAssignments);

// Teacher create assignment
router.post("/", isAuth, isInstructor, createAssignment);

// Specific routes (before ID-based)
router.get("/submissions/:submissionId", isAuth, getSubmissionById);
router.put("/submissions/:submissionId/grade", isAuth, isInstructor, gradeSubmission);

// ID-based routes (after specific routes)
router.get("/:assignmentId", getAssignmentById);
router.get("/:assignmentId/stats", isAuth, isInstructor, getAssignmentStats);
router.get("/:assignmentId/submissions", isAuth, isInstructor, getSubmissions);
router.put("/:assignmentId", isAuth, isInstructor, updateAssignment);
router.delete("/:assignmentId", isAuth, isInstructor, deleteAssignment);

// Student submission
router.post("/:assignmentId/submit", isAuth, isStudent, submitAssignment);

export default router;
