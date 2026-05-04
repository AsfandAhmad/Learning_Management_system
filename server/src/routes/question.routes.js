import express from "express";
import {
    getQuestions,
    getQuestion,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestionsWithAnswerKey,
    bulkCreateQuestions,
    getQuestionStats
} from "../controllers/question.controller.js";
import { isAuth } from "../middleware/auth.js";

const router = express.Router();

// GET questions for a quiz (student can view without answers)
router.get("/api/courses/:courseId/quizzes/:quizId/questions", isAuth, getQuestions);

// GET single question
router.get("/api/courses/:courseId/questions/:questionId", isAuth, getQuestion);

// GET question statistics
router.get("/api/courses/:courseId/quizzes/:quizId/questions/stats", isAuth, getQuestionStats);

// GET questions with answer key (teacher only)
router.get("/api/courses/:courseId/quizzes/:quizId/questions/answer-key", isAuth, getQuestionsWithAnswerKey);

// POST create single question
router.post("/api/courses/:courseId/quizzes/:quizId/questions", isAuth, createQuestion);

// POST bulk create questions
router.post("/api/courses/:courseId/quizzes/:quizId/questions/bulk", isAuth, bulkCreateQuestions);

// PUT update question
router.put("/api/courses/:courseId/questions/:questionId", isAuth, updateQuestion);

// DELETE question
router.delete("/api/courses/:courseId/questions/:questionId", isAuth, deleteQuestion);

export default router;
