import { Router } from "express";
import {
    getQuizzes,
    getQuizById,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    submitQuizAttempt,
    getStudentQuizAttempts
} from "../controllers/quiz.controller.js";
import { isAuth, isInstructor, isStudent } from "../middleware/auth.js";

const router = Router({ mergeParams: true });

// List all quizzes (public)
router.get("/", getQuizzes);

// Teacher create quiz
router.post("/", isAuth, isInstructor, createQuiz);

// ID-based routes
router.get("/:quizId", getQuizById);
router.put("/:quizId", isAuth, isInstructor, updateQuiz);
router.delete("/:quizId", isAuth, isInstructor, deleteQuiz);

// Student quiz attempts
router.post("/:quizId/submit", isAuth, isStudent, submitQuizAttempt);
router.get("/:quizId/attempts", isAuth, isStudent, getStudentQuizAttempts);

export default router;
