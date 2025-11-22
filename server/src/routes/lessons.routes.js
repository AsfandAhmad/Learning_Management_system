import { Router } from "express";
import {
    getLessons,
    getLessonById,
    createLesson,
    updateLesson,
    deleteLesson,
    getLessonViews,
    updateLessonProgress,
    saveStudentNote,
    getStudentNotes,
    updateStudentNote,
    deleteStudentNote
} from "../controllers/lessons.controller.js";
import { isAuth, isInstructor, isStudent } from "../middleware/auth.js";

const router = Router({ mergeParams: true });

// List all lessons
router.get("/", getLessons);

// Teacher create new lesson
router.post("/", isAuth, isInstructor, createLesson);

// ID-based routes
router.get("/:lessonId", getLessonById);
router.get("/:lessonId/views", getLessonViews);
router.put("/:lessonId", isAuth, isInstructor, updateLesson);
router.delete("/:lessonId", isAuth, isInstructor, deleteLesson);

// Student Progress Tracking
router.put("/:lessonId/progress", isAuth, isStudent, updateLessonProgress);

// Student Notes
router.post("/:lessonId/notes", isAuth, isStudent, saveStudentNote);
router.get("/:lessonId/notes", isAuth, isStudent, getStudentNotes);
router.put("/:lessonId/notes/:noteId", isAuth, isStudent, updateStudentNote);
router.delete("/:lessonId/notes/:noteId", isAuth, isStudent, deleteStudentNote);

export default router;
