import { Router } from "express";
import {
  getPendingTeachers,
  approveTeacher,
  rejectTeacher,
  getAllTeachers,
  getTeacherDocuments,
  getTeacherDetails,
  getTeacherCV,
  getAllStudents,
  getStudentDetails,
  toggleStudentStatus,
  getStatistics
} from "../controllers/admin.controller.js";
import { isAuth, isAdmin } from "../middleware/auth.js";

const router = Router();

// All routes require admin authentication
router.use(isAuth, isAdmin);

// Teacher Management
router.get("/teachers", getAllTeachers);
router.get("/teachers/pending", getPendingTeachers);
router.get("/teachers/:teacherId/details", getTeacherDetails);
router.get("/teachers/:teacherId/cv", getTeacherCV);
router.patch("/teachers/:teacherId/approve", approveTeacher);
router.patch("/teachers/:teacherId/reject", rejectTeacher);

// Teacher documents/CV
router.get("/teachers/:teacherId/documents", getTeacherDocuments);

// Student Management
router.get("/students", getAllStudents);
router.get("/students/:studentId/details", getStudentDetails);
router.patch("/students/:studentId/status", toggleStudentStatus);

// Statistics
router.get("/statistics", getStatistics);

export default router;
