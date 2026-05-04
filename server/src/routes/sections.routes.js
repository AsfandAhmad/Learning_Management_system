import { Router } from "express";
import {
    getSections,
    getSectionById,
    createSection,
    updateSection,
    deleteSection,
    getCourseCurriculum,
    getStudentProgress,
    markSectionComplete
} from "../controllers/sections.controller.js";
import { isAuth, isInstructor, isStudent } from "../middleware/auth.js";

const router = Router({ mergeParams: true });

// Specific routes first (before ID-based routes)
// Public routes
router.get("/curriculum", getCourseCurriculum);

// Student progress routes (specific path)
router.get("/student/progress", isAuth, isStudent, getStudentProgress);

// Teacher routes (create new section)
router.post("/", isAuth, isInstructor, createSection);

// General list route
router.get("/", getSections);

// ID-based routes (after specific routes)
router.get("/:sectionId", getSectionById);
router.put("/:sectionId", isAuth, isInstructor, updateSection);
router.delete("/:sectionId", isAuth, isInstructor, deleteSection);

// Student completion marking
router.post("/:sectionId/complete", isAuth, isStudent, markSectionComplete);

export default router;
