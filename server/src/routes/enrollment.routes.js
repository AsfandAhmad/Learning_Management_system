import { Router } from "express";
import {
    getStudentEnrollments,
    getEnrollmentById,
    getCourseEnrollments,
    enrollStudent,
    updateEnrollment,
    issueCertificate,
    unenrollStudent,
    getEnrollmentStats,
    getStudentProgress
} from "../controllers/enrollment.controller.js";
import { isAuth, isStudent, isInstructor } from "../middleware/auth.js";

const router = Router();

// Student routes
router.get("/", isAuth, isStudent, getStudentEnrollments);
router.get("/my-enrollments", isAuth, isStudent, getStudentEnrollments);
router.get("/:enrollmentId", isAuth, isStudent, getEnrollmentById);
router.post("/courses/:courseId", isAuth, isStudent, enrollStudent);
router.delete("/:enrollmentId", isAuth, isStudent, unenrollStudent);
router.get("/:enrollmentId/progress", isAuth, isStudent, getStudentProgress);

// Teacher routes
router.get("/courses/:courseId/students", isAuth, isInstructor, getCourseEnrollments);
router.put("/:enrollmentId", isAuth, isInstructor, updateEnrollment);
router.post("/:enrollmentId/certificate", isAuth, isInstructor, issueCertificate);
router.delete("/:enrollmentId", isAuth, isInstructor, unenrollStudent);
router.get("/courses/:courseId/stats", isAuth, isInstructor, getEnrollmentStats);

export default router;
