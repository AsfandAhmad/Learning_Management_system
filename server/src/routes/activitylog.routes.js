import express from "express";
import {
    getStudentActivities,
    getCourseActivities,
    getCourseActivityStats,
    logActivity,
    getActivitySummary,
    deleteActivity,
    getLessonActivityHistory,
    getClassActivity
} from "../controllers/activitylog.controller.js";
import { isAuth } from "../middleware/auth.js";

const router = express.Router();

// Student routes
router.get("/api/student/activities", isAuth, getStudentActivities);
router.get("/api/student/activity-summary", isAuth, getActivitySummary);

// Course activity routes
router.get("/api/courses/:courseId/activities", isAuth, getCourseActivities);
router.get("/api/courses/:courseId/activities/stats", isAuth, getCourseActivityStats);
router.post("/api/courses/:courseId/activities/log", isAuth, logActivity);

// Lesson activity history
router.get("/api/courses/:courseId/lessons/:lessonId/activity-history", isAuth, getLessonActivityHistory);

// Teacher class activity view
router.get("/api/courses/:courseId/class-activity", isAuth, getClassActivity);

// Admin delete activity
router.delete("/api/activities/:logId", isAuth, deleteActivity);

export default router;
