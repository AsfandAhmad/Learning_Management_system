import { Router } from "express";
import {
    listCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    getTeacherCourses,
    enrollCourse,
    getStudentCourses,
    getCourseEnrollments,
    unenrollCourse
} from "../controllers/courses.controller.js";
import { isAuth, isInstructor, isStudent } from "../middleware/auth.js";

const router = Router();

// Public routes - list and get courses
router.get("/", listCourses);

// Teacher routes - create, view their courses
router.post("/", isAuth, isInstructor, createCourse);
router.get("/teacher/my-courses", isAuth, isInstructor, getTeacherCourses);

// Student routes - view their courses and enroll
router.get("/student/my-courses", isAuth, isStudent, getStudentCourses);

// ID-based routes (after specific paths to avoid conflicts)
router.get("/:courseId", getCourseById);
router.put("/:courseId", isAuth, isInstructor, updateCourse);
router.delete("/:courseId", isAuth, isInstructor, deleteCourse);

// Enrollment routes
router.post("/:courseId/enroll", isAuth, isStudent, enrollCourse);
router.get("/:courseId/enrollments", isAuth, isInstructor, getCourseEnrollments);

// Unenroll route (both teacher and student)
router.delete("/enrollments/:enrollmentId", isAuth, unenrollCourse);

export default router;
