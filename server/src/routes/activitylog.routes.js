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
router.get("/student/activities", isAuth, getStudentActivities);
router.get("/student/activity-summary", isAuth, getActivitySummary);

// Course activity routes
router.get("/courses/:courseId/activities", isAuth, getCourseActivities);
router.get("/courses/:courseId/activities/stats", isAuth, getCourseActivityStats);
router.post("/courses/:courseId/activities/log", isAuth, logActivity);

// Lesson activity history
router.get("/courses/:courseId/lessons/:lessonId/activity-history", isAuth, getLessonActivityHistory);

// Teacher class activity view
router.get("/courses/:courseId/class-activity", isAuth, getClassActivity);

// Admin delete activity
router.delete("/:logId", isAuth, deleteActivity);

export default router;
