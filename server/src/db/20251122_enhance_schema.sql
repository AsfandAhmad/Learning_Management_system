-- Migration: Add CV and instructor approval fields to Teacher table
-- This migration adds fields to support the enhanced instructor verification system

ALTER TABLE Teacher ADD COLUMN IF NOT EXISTS Bio TEXT AFTER Qualification;
ALTER TABLE Teacher ADD COLUMN IF NOT EXISTS ApprovedByAdminID INT AFTER Status;
ALTER TABLE Teacher ADD COLUMN IF NOT EXISTS ApprovedAt TIMESTAMP NULL AFTER ApprovedByAdminID;
ALTER TABLE Teacher ADD COLUMN IF NOT EXISTS RejectedByAdminID INT AFTER ApprovedAt;
ALTER TABLE Teacher ADD COLUMN IF NOT EXISTS RejectedAt TIMESTAMP NULL AFTER RejectedByAdminID;
ALTER TABLE Teacher ADD COLUMN IF NOT EXISTS RejectionReason TEXT AFTER RejectedAt;

-- Add foreign key for ApprovedByAdminID if not exists
-- (requires Admin table to exist first)
-- ALTER TABLE Teacher ADD CONSTRAINT fk_approved_admin
-- FOREIGN KEY (ApprovedByAdminID) REFERENCES Admin(AdminID);

-- Add fields to Course table for better course management
ALTER TABLE Course ADD COLUMN IF NOT EXISTS Prerequisites JSON AFTER Description;
ALTER TABLE Course ADD COLUMN IF NOT EXISTS LearningOutcomes JSON AFTER Prerequisites;
ALTER TABLE Course ADD COLUMN IF NOT EXISTS EstimatedHours INT AFTER LearningOutcomes;
ALTER TABLE Course ADD COLUMN IF NOT EXISTS DifficultyLevel ENUM('Beginner','Intermediate','Advanced') DEFAULT 'Beginner' AFTER EstimatedHours;
ALTER TABLE Course ADD COLUMN IF NOT EXISTS Rating DECIMAL(3,2) DEFAULT 0 AFTER DifficultyLevel;
ALTER TABLE Course ADD COLUMN IF NOT EXISTS TotalReviews INT DEFAULT 0 AFTER Rating;

-- Add fields to Lesson table for enhanced lesson management
ALTER TABLE Lesson ADD COLUMN IF NOT EXISTS VideoURL VARCHAR(255) AFTER ContentURL;
ALTER TABLE Lesson ADD COLUMN IF NOT EXISTS VideoDuration INT AFTER VideoURL;
ALTER TABLE Lesson ADD COLUMN IF NOT EXISTS Notes LONGTEXT AFTER VideoDuration;
ALTER TABLE Lesson ADD COLUMN IF NOT EXISTS ResourceFiles JSON AFTER Notes;
ALTER TABLE Lesson ADD COLUMN IF NOT EXISTS LessonType ENUM('Video','Reading','Mixed','Interactive') DEFAULT 'Mixed' AFTER ResourceFiles;
ALTER TABLE Lesson ADD COLUMN IF NOT EXISTS CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER LessonType;

-- Add fields to Section table
ALTER TABLE Section ADD COLUMN IF NOT EXISTS Description TEXT AFTER Title;
ALTER TABLE Section ADD COLUMN IF NOT EXISTS CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER PositionOrder;

-- Enhance Assignment table
ALTER TABLE Assignment ADD COLUMN IF NOT EXISTS SectionID INT AFTER CourseID;
ALTER TABLE Assignment ADD COLUMN IF NOT EXISTS SubmissionType ENUM('FileUpload','Text','Link') DEFAULT 'FileUpload' AFTER MaxMarks;
ALTER TABLE Assignment ADD COLUMN IF NOT EXISTS AllowLateSubmission BOOLEAN DEFAULT TRUE AFTER SubmissionType;
ALTER TABLE Assignment ADD COLUMN IF NOT EXISTS MaxAttempts INT DEFAULT 1 AFTER AllowLateSubmission;
ALTER TABLE Assignment ADD COLUMN IF NOT EXISTS CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER MaxAttempts;

-- Enhance AssignmentSubmission table
ALTER TABLE AssignmentSubmission ADD COLUMN IF NOT EXISTS SubmissionText TEXT AFTER FileURL;
ALTER TABLE AssignmentSubmission ADD COLUMN IF NOT EXISTS SubmissionLink VARCHAR(255) AFTER SubmissionText;
ALTER TABLE AssignmentSubmission ADD COLUMN IF NOT EXISTS GradedByAdminID INT AFTER Feedback;
ALTER TABLE AssignmentSubmission ADD COLUMN IF NOT EXISTS GradedAt TIMESTAMP NULL AFTER GradedByAdminID;
ALTER TABLE AssignmentSubmission ADD COLUMN IF NOT EXISTS AttemptNumber INT DEFAULT 1 AFTER GradedAt;

-- Create LessonProgress table if it doesn't exist
CREATE TABLE IF NOT EXISTS LessonProgress (
    ProgressID INT AUTO_INCREMENT PRIMARY KEY,
    StudentID INT NOT NULL,
    LessonID INT NOT NULL,
    Completed BOOLEAN DEFAULT FALSE,
    LastPosition INT DEFAULT 0,
    TimeSpent INT DEFAULT 0,
    CompletedAt TIMESTAMP NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (StudentID) REFERENCES Student(StudentID) ON DELETE CASCADE,
    FOREIGN KEY (LessonID) REFERENCES Lesson(LessonID) ON DELETE CASCADE,
    UNIQUE KEY unique_student_lesson (StudentID, LessonID)
);

-- Create StudentNotes table if it doesn't exist
CREATE TABLE IF NOT EXISTS StudentNotes (
    NoteID INT AUTO_INCREMENT PRIMARY KEY,
    StudentID INT NOT NULL,
    LessonID INT NOT NULL,
    Content LONGTEXT NOT NULL,
    VideoTimestamp INT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (StudentID) REFERENCES Student(StudentID) ON DELETE CASCADE,
    FOREIGN KEY (LessonID) REFERENCES Lesson(LessonID) ON DELETE CASCADE
);

-- Create CourseReview table if it doesn't exist
CREATE TABLE IF NOT EXISTS CourseReview (
    ReviewID INT AUTO_INCREMENT PRIMARY KEY,
    CourseID INT NOT NULL,
    StudentID INT NOT NULL,
    Rating INT CHECK (Rating >= 1 AND Rating <= 5),
    ReviewText TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (CourseID) REFERENCES Course(CourseID) ON DELETE CASCADE,
    FOREIGN KEY (StudentID) REFERENCES Student(StudentID) ON DELETE CASCADE,
    UNIQUE KEY unique_course_review (CourseID, StudentID)
);

-- Create Notification table if it doesn't exist
CREATE TABLE IF NOT EXISTS Notification (
    NotificationID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT,
    NotificationType ENUM('Teacher','Student','Admin'),
    NotificationTitle VARCHAR(255),
    NotificationMessage TEXT,
    NotificationLink VARCHAR(255),
    IsRead BOOLEAN DEFAULT FALSE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_read (UserID, IsRead)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_teacher_status ON Teacher(Status);
CREATE INDEX IF NOT EXISTS idx_lesson_section ON Lesson(SectionID);
CREATE INDEX IF NOT EXISTS idx_section_course ON Section(CourseID);
CREATE INDEX IF NOT EXISTS idx_enrollment_student ON Enrollment(StudentID);
CREATE INDEX IF NOT EXISTS idx_enrollment_course ON Enrollment(CourseID);
CREATE INDEX IF NOT EXISTS idx_assignment_course ON Assignment(CourseID);
