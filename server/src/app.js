import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import coursesRoutes from "./routes/courses.routes.js";
import teacherRoutes from "./routes/teacher.routes.js";
import studentRoutes from "./routes/student.routes.js";
import sectionsRoutes from "./routes/sections.routes.js";
import lessonsRoutes from "./routes/lessons.routes.js";
import assignmentsRoutes from "./routes/assignments.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import enrollmentRoutes from "./routes/enrollment.routes.js";
import questionRoutes from "./routes/question.routes.js";
import activitylogRoutes from "./routes/activitylog.routes.js";
import fileRoutes from "./routes/file.routes.js";
import progressRoutes from "./routes/progress.routes.js";
import { notFound, errorHandler } from "./middleware/error.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static('public'));

// Serve static files from uploads directory
const uploadsPath = path.join(__dirname, '../../uploads');
app.use('/uploads', express.static(uploadsPath));

app.get("/api/health", (_, res) => res.json({ ok: true }));

// Authentication routes
app.use("/api/auth", authRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);

// Teacher routes
app.use("/api/teacher", teacherRoutes);

// Student routes
app.use("/api/student", studentRoutes);

// Course routes with nested sections, assignments, and quizzes
app.use("/api/courses", coursesRoutes);
app.use("/api/courses/:courseId/sections", sectionsRoutes);
app.use("/api/sections/:sectionId/lessons", lessonsRoutes);
app.use("/api/courses/:courseId/assignments", assignmentsRoutes);
app.use("/api/courses/:courseId/quizzes", quizRoutes);

// Question routes
app.use("/api/courses/:courseId/questions", questionRoutes);
app.use("/api/questions", questionRoutes);

// Activity Log routes
app.use("/api/activities", activitylogRoutes);

// File routes
app.use("/api", fileRoutes);

// Enrollment routes
app.use("/api/enrollments", enrollmentRoutes);

// Progress and Analytics routes
app.use("/api/progress", progressRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
