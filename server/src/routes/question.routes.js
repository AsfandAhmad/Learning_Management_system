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
router.get("/quizzes/:quizId/questions", isAuth, getQuestions);

// GET single question
router.get("/questions/:questionId", isAuth, getQuestion);

// GET question statistics
router.get("/quizzes/:quizId/questions/stats", isAuth, getQuestionStats);

// GET questions with answer key (teacher only)
router.get("/quizzes/:quizId/questions/answer-key", isAuth, getQuestionsWithAnswerKey);

// POST create single question
router.post("/quizzes/:quizId/questions", isAuth, createQuestion);

// POST bulk create questions
router.post("/quizzes/:quizId/questions/bulk", isAuth, bulkCreateQuestions);

// PUT update question
router.put("/questions/:questionId", isAuth, updateQuestion);

// DELETE question
router.delete("/questions/:questionId", isAuth, deleteQuestion);

export default router;
