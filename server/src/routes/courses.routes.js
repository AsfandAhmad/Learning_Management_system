import { Router } from "express";
import { listCourses, createCourse } from "../controllers/courses.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.get("/", listCourses);
router.post("/", requireAuth(["instructor"]), createCourse);

export default router;
