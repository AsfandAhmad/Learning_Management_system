import { Router } from "express";
import {
	getStudentProfile,
	updateStudentProfile,
	getStudentCourses,
	getStudentProgress,
	getStudentCertificates,
	getStudentActivity
} from "../controllers/student.controller.js";
import { isAuth, isStudent } from "../middleware/auth.js";

const router = Router();

// Student profile routes
router.get("/profile", isAuth, isStudent, getStudentProfile);
router.put("/profile", isAuth, isStudent, updateStudentProfile);

// Student courses and progress
router.get("/courses", isAuth, isStudent, getStudentCourses);
router.get("/progress", isAuth, isStudent, getStudentProgress);

// Student certificates
router.get("/certificates", isAuth, isStudent, getStudentCertificates);

// Student activity log
router.get("/activity", isAuth, isStudent, getStudentActivity);

export default router;
