import { Router } from "express";
import { uploadCV } from "../utils/fileUpload.js";
import {
  registerStudent,
  loginStudent,
  registerTeacher,
  loginTeacher,
  registerAdmin,
  loginAdmin
} from "../controllers/auth.controller.js";

const router = Router();

// Student routes
router.post("/student/register", registerStudent);
router.post("/student/login", loginStudent);

// Teacher routes
router.post("/teacher/register", uploadCV, registerTeacher);
router.post("/teacher/login", loginTeacher);

// Admin routes
router.post("/admin/register", registerAdmin);
router.post("/admin/login", loginAdmin);

export default router;
