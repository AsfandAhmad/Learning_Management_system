import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure all upload directories exist
const uploadsDir = path.join(__dirname, '../../uploads');
const cvDir = path.join(uploadsDir, 'cvs');
const resourcesDir = path.join(uploadsDir, 'resources');
const thumbnailsDir = path.join(uploadsDir, 'thumbnails');
const assignmentsDir = path.join(uploadsDir, 'assignments');
const videosDir = path.join(uploadsDir, 'videos');
const documentsDir = path.join(uploadsDir, 'documents');

// Create base directories
[uploadsDir, cvDir, resourcesDir, thumbnailsDir, assignmentsDir, videosDir, documentsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Helper function to create course-specific subdirectories
const ensureCourseDir = (baseDir, courseId) => {
  const courseDir = path.join(baseDir, String(courseId));
  if (!fs.existsSync(courseDir)) {
    fs.mkdirSync(courseDir, { recursive: true });
  }
  return courseDir;
};

// Helper function to create lecture-specific subdirectories
const ensureLectureDir = (baseDir, courseId, lectureId) => {
  const lectureDir = path.join(baseDir, String(courseId), String(lectureId));
  if (!fs.existsSync(lectureDir)) {
    fs.mkdirSync(lectureDir, { recursive: true });
  }
  return lectureDir;
};

// ==================== CV UPLOAD ====================
const cvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, cvDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `teacher_${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const cvFilter = (req, file, cb) => {
  const allowedMimes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, and DOCX files are allowed for CV'), false);
  }
};

export const uploadCV = multer({
  storage: cvStorage,
  fileFilter: cvFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
}).single('cv');

// ==================== THUMBNAIL UPLOAD ====================
const thumbnailStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, thumbnailsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `course_${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const thumbnailFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, and WebP images are allowed'), false);
  }
};

export const uploadThumbnail = multer({
  storage: thumbnailStorage,
  fileFilter: thumbnailFilter,
  limits: { fileSize: 2 * 1024 * 1024 }
}).single('thumbnail');

// ==================== COURSE RESOURCE UPLOAD ====================
const resourceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const courseDir = path.join(resourcesDir, req.params.courseId || 'temp');
    if (!fs.existsSync(courseDir)) {
      fs.mkdirSync(courseDir, { recursive: true });
    }
    cb(null, courseDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const resourceFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf', 'application/zip', 'image/jpeg', 'image/png',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed for course resources'), false);
  }
};

export const uploadResource = multer({
  storage: resourceStorage,
  fileFilter: resourceFilter,
  limits: { fileSize: 50 * 1024 * 1024 }
}).single('resource');

// ==================== VIDEO LECTURE UPLOAD ====================
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { courseId, lectureId } = req.params;
    const videoDir = ensureLectureDir(videosDir, courseId, lectureId);
    cb(null, videoDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `lecture_${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const videoFilter = (req, file, cb) => {
  const allowedMimes = [
    'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
    'application/x-mpegURL', 'video/x-msvideo', 'video/x-ms-wmv'
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only video files (MP4, WebM, OGG, MOV, etc.) are allowed'), false);
  }
};

export const uploadVideo = multer({
  storage: videoStorage,
  fileFilter: videoFilter,
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB for videos
}).single('video');

// ==================== COURSE DOCUMENTS UPLOAD (Teacher Notes, Resources) ====================
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { courseId } = req.params;
    const docDir = ensureCourseDir(documentsDir, courseId);
    cb(null, docDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `doc_${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const documentFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf', 'application/zip', 'image/jpeg', 'image/png', 'image/webp',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'text/markdown'
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed for course documents'), false);
  }
};

export const uploadDocument = multer({
  storage: documentStorage,
  fileFilter: documentFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB for documents
}).single('document');

// ==================== STUDENT SUBMISSION DOCUMENTS ====================
const studentSubmissionStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { courseId, lectureId } = req.params;
    const submissionDir = ensureLectureDir(documentsDir, courseId, `lecture_${lectureId}_submissions`);
    cb(null, submissionDir);
  },
  filename: (req, file, cb) => {
    const studentId = req.user?.studentId || 'student';
    const ext = path.extname(file.originalname);
    const filename = `student_${studentId}_${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const studentSubmissionFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf', 'application/zip', 'text/plain',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg', 'image/png', 'image/webp'
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed for submission'), false);
  }
};

export const uploadStudentSubmission = multer({
  storage: studentSubmissionStorage,
  fileFilter: studentSubmissionFilter,
  limits: { fileSize: 50 * 1024 * 1024 }
}).single('submission');

// ==================== ASSIGNMENT SUBMISSION UPLOAD ====================
const assignmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const submissionDir = path.join(assignmentsDir, req.params.assignmentId || 'temp');
    if (!fs.existsSync(submissionDir)) {
      fs.mkdirSync(submissionDir, { recursive: true });
    }
    cb(null, submissionDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${req.user?.studentId || 'user'}_${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const assignmentFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf', 'application/zip', 'text/plain',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg', 'image/png'
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed for submission'), false);
  }
};

export const uploadAssignment = multer({
  storage: assignmentStorage,
  fileFilter: assignmentFilter,
  limits: { fileSize: 25 * 1024 * 1024 }
}).single('submission');

// ==================== UTILITY FUNCTIONS ====================
export const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
  } catch (err) {
    console.error('Error deleting file:', err);
  }
  return false;
};

// Get file URL
export const getFileUrl = (req, filename) => {
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
};

export default {
  uploadCV,
  uploadThumbnail,
  uploadResource,
  uploadVideo,
  uploadDocument,
  uploadStudentSubmission,
  uploadAssignment,
  deleteFile,
  getFileUrl,
  uploadsDir,
  cvDir,
  resourcesDir,
  thumbnailsDir,
  assignmentsDir,
  videosDir,
  documentsDir,
  ensureCourseDir,
  ensureLectureDir
};
