import { Router } from "express";
import {
    getCourseProgress,
    getStudentAnalytics,
    getCourseEnrollmentProgress,
    getInstructorAnalytics
} from "../controllers/progress.controller.js";
import { isAuth, isStudent, isInstructor } from "../middleware/auth.js";

const router = Router();

// Student routes
router.get("/course/:courseId", isAuth, isStudent, getCourseProgress);
router.get("/student/analytics", isAuth, isStudent, getStudentAnalytics);

// Instructor routes
router.get("/course/:courseId/enrollments", isAuth, isInstructor, getCourseEnrollmentProgress);
router.get("/instructor/analytics", isAuth, isInstructor, getInstructorAnalytics);

export default router;
