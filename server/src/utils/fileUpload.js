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

[uploadsDir, cvDir, resourcesDir, thumbnailsDir, assignmentsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

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
  uploadAssignment,
  deleteFile,
  getFileUrl,
  uploadsDir,
  cvDir,
  resourcesDir,
  thumbnailsDir,
  assignmentsDir
};
