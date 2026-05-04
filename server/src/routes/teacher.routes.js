import { Router } from "express";
import {
    getTeacherProfile,
    updateTeacherProfile,
    getTeacherDocuments,
    uploadDocument,
    deleteDocument,
    getTeacherCourses,
    getTeacherStats,
    getTeacherEnrollments,
    uploadCV,
    getTeacherCV
} from "../controllers/teacher.controller.js";
import { isAuth, isInstructor } from "../middleware/auth.js";
import { uploadCV as cvUploadMiddleware } from "../utils/fileUpload.js";

const router = Router();

// Teacher profile
router.get("/profile", isAuth, isInstructor, getTeacherProfile);
router.put("/profile", isAuth, isInstructor, updateTeacherProfile);

// CV Upload and retrieval
router.post("/cv/upload", isAuth, isInstructor, cvUploadMiddleware, uploadCV);
router.get("/cv/:teacherId", getTeacherCV);

// Documents
router.get("/documents", isAuth, isInstructor, getTeacherDocuments);
router.post("/documents", isAuth, isInstructor, uploadDocument);
router.delete("/documents/:docId", isAuth, isInstructor, deleteDocument);

// Courses
router.get("/courses", isAuth, isInstructor, getTeacherCourses);

// Statistics
router.get("/stats", isAuth, isInstructor, getTeacherStats);

// Enrollments
router.get("/enrollments", isAuth, isInstructor, getTeacherEnrollments);

export default router;
