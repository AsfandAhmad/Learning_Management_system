import { Router } from "express";
import {
    getLessons,
    getLessonById,
    createLesson,
    updateLesson,
    deleteLesson,
    getLessonViews,
    updateLessonProgress,
    saveStudentNote,
    getStudentNotes,
    updateStudentNote,
    deleteStudentNote,
    uploadLessonVideo,
    getLessonVideos,
    deleteVideo,
    uploadLessonDocument,
    getLessonDocuments,
    deleteDocument,
    uploadStudentNotes
} from "../controllers/lessons.controller.js";
import { uploadVideo, uploadDocument, uploadStudentSubmission } from "../utils/fileUpload.js";
import { isAuth, isInstructor, isStudent } from "../middleware/auth.js";

const router = Router({ mergeParams: true });

// List all lessons
router.get("/", getLessons);

// Teacher create new lesson
router.post("/", isAuth, isInstructor, createLesson);

// ID-based routes
router.get("/:lessonId", getLessonById);
router.get("/:lessonId/views", getLessonViews);
router.put("/:lessonId", isAuth, isInstructor, updateLesson);
router.delete("/:lessonId", isAuth, isInstructor, deleteLesson);

// Video Lecture Management (Teacher only)
router.post("/:lessonId/videos/upload", isAuth, isInstructor, uploadVideo, uploadLessonVideo);
router.get("/:lessonId/videos", getLessonVideos);
router.delete("/:lessonId/videos/:videoId", isAuth, isInstructor, deleteVideo);

// Lesson Documents (Teacher - notes, resources)
router.post("/:lessonId/documents/upload", isAuth, isInstructor, uploadDocument, uploadLessonDocument);
router.get("/:lessonId/documents", getLessonDocuments);
router.delete("/:lessonId/documents/:docId", isAuth, isInstructor, deleteDocument);

// Student Progress Tracking
router.put("/:lessonId/progress", isAuth, isStudent, updateLessonProgress);

// Student Notes & Submissions
router.post("/:lessonId/notes", isAuth, isStudent, saveStudentNote);
router.post("/:lessonId/notes/upload", isAuth, isStudent, uploadStudentSubmission, uploadStudentNotes);
router.get("/:lessonId/notes", isAuth, isStudent, getStudentNotes);
router.put("/:lessonId/notes/:noteId", isAuth, isStudent, updateStudentNote);
router.delete("/:lessonId/notes/:noteId", isAuth, isStudent, deleteStudentNote);

export default router;
