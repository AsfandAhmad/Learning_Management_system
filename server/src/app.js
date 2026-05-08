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

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  ...(process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
    : [])
];

const isAllowedOrigin = (origin) => {
  if (!origin) return true; // Allow server-to-server and tools without Origin header
  if (allowedOrigins.includes(origin)) return true;

  try {
    const hostname = new URL(origin).hostname;
    return hostname.endsWith('.vercel.app');
  } catch {
    return false;
  }
};

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
// Parse JSON bodies
app.use(express.json());
// Also accept URL-encoded bodies (forms) to avoid JSON parse errors when clients
// submit `application/x-www-form-urlencoded` payloads.
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(express.static('public'));

// Serve static files from uploads directory
const uploadsPath = path.join(__dirname, '../../uploads');
app.use('/uploads', express.static(uploadsPath));

app.get("/api/health", (_, res) => res.json({ ok: true }));

// Debug middleware - log all requests
app.use((req, res, next) => {
    console.log(`📍 ${req.method} ${req.path}`);
    console.log('   Params:', req.params);
    console.log('   User:', req.user ? `${req.user.teacherId || req.user.studentId || 'unknown'}` : 'none');
    next();
});

// JSON parse error handler (body-parser/express.json throws SyntaxError on bad JSON)
app.use((err, req, res, next) => {
  if (err && err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Invalid JSON payload received:', err.message);
    return res.status(400).json({ message: 'Invalid JSON payload' });
  }
  next(err);
});

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
app.use("/api/courses/:courseId/lessons", lessonsRoutes);
app.use("/api/courses/:courseId/lectures", lessonsRoutes);
app.use("/api/courses/:courseId/assignments", assignmentsRoutes);
app.use("/api/courses/:courseId/quizzes", quizRoutes);
app.use("/api/quizzes", quizRoutes);

// Question routes
app.use("/api/courses/:courseId", questionRoutes);
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