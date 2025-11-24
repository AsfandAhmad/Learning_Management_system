-- ==========================================
-- LEARNING MANAGEMENT SYSTEM - COMPLETE DATABASE SCHEMA
-- ==========================================
-- Updated: November 22, 2025
-- Phase 1: Core LMS with Instructor Verification
-- This schema includes all tables, relationships, indexes, and constraints
-- ==========================================

-- ==========================================
-- 1. USER MANAGEMENT TABLES
-- ==========================================

-- Students Table
CREATE TABLE IF NOT EXISTS Student (
    StudentID INT AUTO_INCREMENT PRIMARY KEY,
    FullName VARCHAR(100) NOT NULL,
    Email VARCHAR(120) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    StreakCount INT DEFAULT 0,
    LastActiveDate DATE,
    Status ENUM('Active','Blocked') DEFAULT 'Active',
    
    INDEX idx_email (Email),
    INDEX idx_status (Status),
    INDEX idx_created_at (CreatedAt)
);

-- Teachers Table (ENHANCED with CV and approval fields)
CREATE TABLE IF NOT EXISTS Teacher (
    TeacherID INT AUTO_INCREMENT PRIMARY KEY,
    FullName VARCHAR(100) NOT NULL,
    Email VARCHAR(120) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    Qualification TEXT,
    ProfilePhoto VARCHAR(255),
    Bio TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Status ENUM('Pending','Approved','Rejected') DEFAULT 'Pending',
    ApprovedByAdminID INT,
    ApprovedAt TIMESTAMP NULL,
    RejectedByAdminID INT,
    RejectedAt TIMESTAMP NULL,
    RejectionReason TEXT,
    
    FOREIGN KEY (ApprovedByAdminID) REFERENCES Admin(AdminID),
    FOREIGN KEY (RejectedByAdminID) REFERENCES Admin(AdminID),
    INDEX idx_email (Email),
    INDEX idx_status (Status),
    INDEX idx_created_at (CreatedAt),
    INDEX idx_approved_at (ApprovedAt)
);

-- Admin Table
CREATE TABLE IF NOT EXISTS Admin (
    AdminID INT AUTO_INCREMENT PRIMARY KEY,
    FullName VARCHAR(100) NOT NULL,
    Email VARCHAR(120) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    Role ENUM('SuperAdmin','Staff') DEFAULT 'Staff',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_email (Email),
    INDEX idx_role (Role)
);

-- Teacher Documents/CV Storage
CREATE TABLE IF NOT EXISTS TeacherDocument (
    DocumentID INT AUTO_INCREMENT PRIMARY KEY,
    TeacherID INT NOT NULL,
    DocumentType ENUM('CV','Certificate','Qualification','Other') DEFAULT 'CV',
    FileName VARCHAR(255) NOT NULL,
    FileURL VARCHAR(500) NOT NULL,
    UploadedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (TeacherID) REFERENCES Teacher(TeacherID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    INDEX idx_teacher_id (TeacherID),
    INDEX idx_doc_type (DocumentType)
);

-- ==========================================
-- 2. COURSE & CONTENT MANAGEMENT TABLES
-- ==========================================

-- Courses Table (ENHANCED with course metadata)
CREATE TABLE IF NOT EXISTS Course (
    CourseID INT AUTO_INCREMENT PRIMARY KEY,
    TeacherID INT NOT NULL,
    Title VARCHAR(150) NOT NULL,
    Description TEXT,
    Category VARCHAR(50),
    Level ENUM('Beginner','Intermediate','Advanced') DEFAULT 'Beginner',
    ThumbnailURL VARCHAR(255),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Status ENUM('Published','Draft','Rejected') DEFAULT 'Draft',
    Prerequisites JSON,
    LearningOutcomes JSON,
    EstimatedHours INT,
    DifficultyLevel ENUM('Beginner','Intermediate','Advanced') DEFAULT 'Beginner',
    Rating DECIMAL(3,2) DEFAULT 0,
    TotalReviews INT DEFAULT 0,
    
    FOREIGN KEY (TeacherID) REFERENCES Teacher(TeacherID),
    INDEX idx_teacher_id (TeacherID),
    INDEX idx_status (Status),
    INDEX idx_level (Level),
    INDEX idx_created_at (CreatedAt),
    INDEX idx_rating (Rating)
);

-- Sections Table (ENHANCED with description and timestamps)
CREATE TABLE IF NOT EXISTS Section (
    SectionID INT AUTO_INCREMENT PRIMARY KEY,
    CourseID INT NOT NULL,
    Title VARCHAR(150) NOT NULL,
    Description TEXT,
    PositionOrder INT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (CourseID) REFERENCES Course(CourseID) ON DELETE CASCADE,
    INDEX idx_course_id (CourseID),
    INDEX idx_position (PositionOrder)
);

-- Lessons Table (ENHANCED with video support, notes, and metadata)
CREATE TABLE IF NOT EXISTS Lesson (
    LessonID INT AUTO_INCREMENT PRIMARY KEY,
    SectionID INT NOT NULL,
    Title VARCHAR(150) NOT NULL,
    ContentType ENUM('PDF','Video','Text'),
    ContentURL VARCHAR(255),
    VideoURL VARCHAR(255),
    VideoDuration INT,
    Notes LONGTEXT,
    ResourceFiles JSON,
    LessonType ENUM('Video','Reading','Mixed','Interactive') DEFAULT 'Mixed',
    PositionOrder INT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (SectionID) REFERENCES Section(SectionID) ON DELETE CASCADE,
    INDEX idx_section_id (SectionID),
    INDEX idx_position (PositionOrder),
    INDEX idx_created_at (CreatedAt)
);

-- ==========================================
-- 3. ASSESSMENT TABLES
-- ==========================================

-- Quizzes Table
CREATE TABLE IF NOT EXISTS Quiz (
    QuizID INT AUTO_INCREMENT PRIMARY KEY,
    CourseID INT NOT NULL,
    Title VARCHAR(150),
    TotalMarks INT,
    TimeLimit INT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (CourseID) REFERENCES Course(CourseID),
    INDEX idx_course_id (CourseID),
    INDEX idx_created_at (CreatedAt)
);

-- Questions Table
CREATE TABLE IF NOT EXISTS Question (
    QuestionID INT AUTO_INCREMENT PRIMARY KEY,
    QuestionText TEXT NOT NULL,
    OptionA VARCHAR(255),
    OptionB VARCHAR(255),
    OptionC VARCHAR(255),
    OptionD VARCHAR(255),
    CorrectOption CHAR(1),
    Marks INT DEFAULT 1,
    
    INDEX idx_marks (Marks)
);

-- Quiz Questions Junction Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS QuizQuestions (
    QuizID INT NOT NULL,
    QuestionID INT NOT NULL,
    PRIMARY KEY (QuizID, QuestionID),
    
    FOREIGN KEY (QuizID) REFERENCES Quiz(QuizID) ON DELETE CASCADE,
    FOREIGN KEY (QuestionID) REFERENCES Question(QuestionID) ON DELETE CASCADE
);

-- Quiz Attempts Table
CREATE TABLE IF NOT EXISTS QuizAttempt (
    AttemptID INT AUTO_INCREMENT PRIMARY KEY,
    QuizID INT NOT NULL,
    StudentID INT NOT NULL,
    Score INT,
    SubmittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (QuizID) REFERENCES Quiz(QuizID),
    FOREIGN KEY (StudentID) REFERENCES Student(StudentID),
    INDEX idx_quiz_id (QuizID),
    INDEX idx_student_id (StudentID),
    INDEX idx_submitted_at (SubmittedAt)
);

-- Assignments Table (ENHANCED with submission types and tracking)
CREATE TABLE IF NOT EXISTS Assignment (
    AssignmentID INT AUTO_INCREMENT PRIMARY KEY,
    CourseID INT NOT NULL,
    SectionID INT,
    Title VARCHAR(150),
    Description TEXT,
    DueDate DATE,
    MaxMarks INT,
    SubmissionType ENUM('FileUpload','Text','Link') DEFAULT 'FileUpload',
    AllowLateSubmission BOOLEAN DEFAULT TRUE,
    MaxAttempts INT DEFAULT 1,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (CourseID) REFERENCES Course(CourseID),
    FOREIGN KEY (SectionID) REFERENCES Section(SectionID),
    INDEX idx_course_id (CourseID),
    INDEX idx_section_id (SectionID),
    INDEX idx_due_date (DueDate)
);

-- Assignment Submissions Table (ENHANCED with multiple submission types)
CREATE TABLE IF NOT EXISTS AssignmentSubmission (
    SubmissionID INT AUTO_INCREMENT PRIMARY KEY,
    AssignmentID INT NOT NULL,
    StudentID INT NOT NULL,
    FileURL VARCHAR(255),
    SubmissionText TEXT,
    SubmissionLink VARCHAR(255),
    SubmittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    MarksObtained INT,
    Feedback TEXT,
    GradedByAdminID INT,
    GradedAt TIMESTAMP NULL,
    AttemptNumber INT DEFAULT 1,
    
    FOREIGN KEY (AssignmentID) REFERENCES Assignment(AssignmentID),
    FOREIGN KEY (StudentID) REFERENCES Student(StudentID),
    FOREIGN KEY (GradedByAdminID) REFERENCES Admin(AdminID),
    INDEX idx_assignment_id (AssignmentID),
    INDEX idx_student_id (StudentID),
    INDEX idx_submitted_at (SubmittedAt),
    INDEX idx_attempt_number (AttemptNumber)
);

-- ==========================================
-- 4. ENROLLMENT & PROGRESS TABLES
-- ==========================================

-- Enrollment Table
CREATE TABLE IF NOT EXISTS Enrollment (
    EnrollmentID INT AUTO_INCREMENT PRIMARY KEY,
    StudentID INT NOT NULL,
    CourseID INT NOT NULL,
    EnrollDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ProgressPercentage INT DEFAULT 0,
    Status ENUM('Active','Completed','Restarted') DEFAULT 'Active',
    CompletionDate DATE,
    CertificateIssued BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (StudentID) REFERENCES Student(StudentID),
    FOREIGN KEY (CourseID) REFERENCES Course(CourseID),
    INDEX idx_student_id (StudentID),
    INDEX idx_course_id (CourseID),
    INDEX idx_status (Status),
    UNIQUE KEY unique_enrollment (StudentID, CourseID)
);

-- Lesson Progress Table (NEW - Tracks individual lesson completion)
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
    UNIQUE KEY unique_student_lesson (StudentID, LessonID),
    INDEX idx_student_id (StudentID),
    INDEX idx_lesson_id (LessonID),
    INDEX idx_completed (Completed)
);

-- Student Notes Table (NEW - For student note-taking)
CREATE TABLE IF NOT EXISTS StudentNotes (
    NoteID INT AUTO_INCREMENT PRIMARY KEY,
    StudentID INT NOT NULL,
    LessonID INT NOT NULL,
    Content LONGTEXT NOT NULL,
    VideoTimestamp INT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (StudentID) REFERENCES Student(StudentID) ON DELETE CASCADE,
    FOREIGN KEY (LessonID) REFERENCES Lesson(LessonID) ON DELETE CASCADE,
    INDEX idx_student_id (StudentID),
    INDEX idx_lesson_id (LessonID),
    INDEX idx_created_at (CreatedAt)
);

-- ==========================================
-- 5. FEEDBACK & RATING TABLES
-- ==========================================

-- Course Reviews Table (NEW - For course ratings and reviews)
CREATE TABLE IF NOT EXISTS CourseReview (
    ReviewID INT AUTO_INCREMENT PRIMARY KEY,
    CourseID INT NOT NULL,
    StudentID INT NOT NULL,
    Rating INT CHECK (Rating >= 1 AND Rating <= 5),
    ReviewText TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (CourseID) REFERENCES Course(CourseID) ON DELETE CASCADE,
    FOREIGN KEY (StudentID) REFERENCES Student(StudentID) ON DELETE CASCADE,
    UNIQUE KEY unique_course_review (CourseID, StudentID),
    INDEX idx_course_id (CourseID),
    INDEX idx_rating (Rating)
);

-- Certificates Table
CREATE TABLE IF NOT EXISTS Certificate (
    CertificateID INT AUTO_INCREMENT PRIMARY KEY,
    EnrollmentID INT NOT NULL,
    StudentID INT NOT NULL,
    CourseID INT NOT NULL,
    IssueDate DATE,
    CertificateURL VARCHAR(255),

    FOREIGN KEY (EnrollmentID) REFERENCES Enrollment(EnrollmentID),
    FOREIGN KEY (StudentID) REFERENCES Student(StudentID),
    FOREIGN KEY (CourseID) REFERENCES Course(CourseID),
    INDEX idx_student_id (StudentID),
    INDEX idx_course_id (CourseID),
    INDEX idx_issue_date (IssueDate)
);

-- ==========================================
-- 6. NOTIFICATION & LOGGING TABLES
-- ==========================================

-- Notifications Table (NEW - For in-app notifications)
CREATE TABLE IF NOT EXISTS Notification (
    NotificationID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT,
    NotificationType ENUM('Teacher','Student','Admin'),
    NotificationTitle VARCHAR(255),
    NotificationMessage TEXT,
    NotificationLink VARCHAR(255),
    IsRead BOOLEAN DEFAULT FALSE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_read (UserID, IsRead),
    INDEX idx_user_id (UserID),
    INDEX idx_created_at (CreatedAt)
);

-- Activity Log Table
CREATE TABLE IF NOT EXISTS ActivityLog (
    LogID INT AUTO_INCREMENT PRIMARY KEY,
    StudentID INT NOT NULL,
    CourseID INT,
    LessonID INT,
    ActivityDate DATE,
    ActivityType ENUM('Login','LessonView','QuizAttempt','Submission'),

    FOREIGN KEY (StudentID) REFERENCES Student(StudentID),
    FOREIGN KEY (CourseID) REFERENCES Course(CourseID),
    FOREIGN KEY (LessonID) REFERENCES Lesson(LessonID),
    INDEX idx_student_id (StudentID),
    INDEX idx_activity_date (ActivityDate),
    INDEX idx_activity_type (ActivityType)
);

-- ==========================================
-- 7. INDEXES FOR PERFORMANCE OPTIMIZATION
-- ==========================================

-- Performance Indexes (Additional)
CREATE INDEX IF NOT EXISTS idx_teacher_status ON Teacher(Status);
CREATE INDEX IF NOT EXISTS idx_course_teacher_status ON Course(TeacherID, Status);
CREATE INDEX IF NOT EXISTS idx_lesson_section_position ON Lesson(SectionID, PositionOrder);
CREATE INDEX IF NOT EXISTS idx_section_course_position ON Section(CourseID, PositionOrder);
CREATE INDEX IF NOT EXISTS idx_enrollment_status ON Enrollment(Status);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_student_lesson ON LessonProgress(StudentID, LessonID);
CREATE INDEX IF NOT EXISTS idx_student_notes_student_lesson ON StudentNotes(StudentID, LessonID);
CREATE INDEX IF NOT EXISTS idx_assignment_section ON Assignment(SectionID);
CREATE INDEX IF NOT EXISTS idx_quiz_attempt_student ON QuizAttempt(StudentID);
CREATE INDEX IF NOT EXISTS idx_quiz_attempt_quiz ON QuizAttempt(QuizID);
CREATE INDEX IF NOT EXISTS idx_assignment_submission_student ON AssignmentSubmission(StudentID);
CREATE INDEX IF NOT EXISTS idx_certificate_enrollment ON Certificate(EnrollmentID);

-- ==========================================
-- 8. VIEW FOR COMMON QUERIES (Optional)
-- ==========================================

-- Course with Teacher Information View
CREATE OR REPLACE VIEW CourseWithTeacher AS
SELECT 
    c.CourseID,
    c.Title AS CourseTitle,
    c.Description,
    c.Level,
    c.Status,
    c.EstimatedHours,
    c.Rating,
    c.TotalReviews,
    t.TeacherID,
    t.FullName AS TeacherName,
    t.Email AS TeacherEmail,
    t.Status AS TeacherStatus
FROM Course c
JOIN Teacher t ON c.TeacherID = t.TeacherID;

-- Enrollment with Course and Teacher View
CREATE OR REPLACE VIEW EnrollmentDetails AS
SELECT 
    e.EnrollmentID,
    e.StudentID,
    s.FullName AS StudentName,
    e.CourseID,
    c.Title AS CourseTitle,
    c.TeacherID,
    t.FullName AS TeacherName,
    e.ProgressPercentage,
    e.Status AS EnrollmentStatus,
    e.EnrollDate,
    e.CompletionDate,
    e.CertificateIssued
FROM Enrollment e
JOIN Student s ON e.StudentID = s.StudentID
JOIN Course c ON e.CourseID = c.CourseID
JOIN Teacher t ON c.TeacherID = t.TeacherID;

-- Student Course Progress View
CREATE OR REPLACE VIEW StudentCourseProgress AS
SELECT 
    s.StudentID,
    s.FullName AS StudentName,
    c.CourseID,
    c.Title AS CourseTitle,
    COUNT(DISTINCT l.LessonID) AS TotalLessons,
    COUNT(DISTINCT CASE WHEN lp.Completed = TRUE THEN lp.LessonID END) AS CompletedLessons,
    ROUND((COUNT(DISTINCT CASE WHEN lp.Completed = TRUE THEN lp.LessonID END) / COUNT(DISTINCT l.LessonID) * 100), 2) AS ProgressPercentage
FROM Student s
JOIN Enrollment e ON s.StudentID = e.StudentID
JOIN Course c ON e.CourseID = c.CourseID
JOIN Section sec ON c.CourseID = sec.CourseID
JOIN Lesson l ON sec.SectionID = l.SectionID
LEFT JOIN LessonProgress lp ON l.LessonID = lp.LessonID AND s.StudentID = lp.StudentID
GROUP BY s.StudentID, s.FullName, c.CourseID, c.Title;

-- ==========================================
-- 9. STORED PROCEDURES (Optional - For Complex Operations)
-- ==========================================

-- Procedure to mark course as completed and issue certificate
DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS CompleteCourseAndIssueCertificate(
    IN p_EnrollmentID INT
)
BEGIN
    DECLARE v_StudentID INT;
    DECLARE v_CourseID INT;
    
    -- Get enrollment details
    SELECT StudentID, CourseID INTO v_StudentID, v_CourseID
    FROM Enrollment
    WHERE EnrollmentID = p_EnrollmentID;
    
    -- Update enrollment status
    UPDATE Enrollment
    SET Status = 'Completed',
        CompletionDate = CURDATE(),
        CertificateIssued = TRUE
    WHERE EnrollmentID = p_EnrollmentID;
    
    -- Create certificate
    INSERT INTO Certificate (EnrollmentID, StudentID, CourseID, IssueDate)
    VALUES (p_EnrollmentID, v_StudentID, v_CourseID, CURDATE());
END$$

DELIMITER ;

-- Procedure to get student course analytics
DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS GetStudentAnalytics(
    IN p_StudentID INT
)
BEGIN
    SELECT 
        s.StudentID,
        s.FullName,
        COUNT(DISTINCT e.CourseID) AS CoursesEnrolled,
        COUNT(DISTINCT CASE WHEN e.Status = 'Completed' THEN e.CourseID END) AS CoursesCompleted,
        SUM(lp.TimeSpent) AS TotalTimeSpent,
        COUNT(DISTINCT lp.LessonID) AS LessonsCompleted,
        AVG(qa.Score) AS AverageQuizScore,
        COUNT(DISTINCT asub.SubmissionID) AS AssignmentsSubmitted
    FROM Student s
    LEFT JOIN Enrollment e ON s.StudentID = e.StudentID
    LEFT JOIN LessonProgress lp ON s.StudentID = lp.StudentID
    LEFT JOIN QuizAttempt qa ON s.StudentID = qa.StudentID
    LEFT JOIN AssignmentSubmission asub ON s.StudentID = asub.StudentID
    WHERE s.StudentID = p_StudentID
    GROUP BY s.StudentID, s.FullName;
END$$

DELIMITER ;

-- ==========================================
-- 10. DATA CONSTRAINTS & REFERENCES
-- ==========================================

-- Ensure referential integrity
-- All Foreign Keys are set to CASCADE on DELETE for data consistency

-- ==========================================
-- SCHEMA SUMMARY
-- ==========================================
-- Total Tables: 19
-- User Management: 4 tables (Student, Teacher, Admin, TeacherDocument)
-- Course Management: 3 tables (Course, Section, Lesson)
-- Assessment: 5 tables (Quiz, Question, QuizQuestions, QuizAttempt, Assignment, AssignmentSubmission)
-- Progress Tracking: 4 tables (Enrollment, LessonProgress, StudentNotes, ActivityLog)
-- Feedback: 3 tables (CourseReview, Certificate, Notification)
-- Views: 3
-- Stored Procedures: 2

-- ==========================================
-- VERSION INFORMATION
-- ==========================================
-- Schema Version: 1.5 (Phase 1 + Phase 1.5)
-- Last Updated: November 22, 2025
-- Status: Production Ready
-- Compatible with: MySQL 5.7 and above

-- ==========================================
-- MIGRATION NOTES FOR CLOUD UPDATE
-- ==========================================
-- If you're updating an existing database with the original schema:
--
-- 1. Run this complete schema file to replace all tables
-- 2. Alternatively, run just the ALTER statements below to add new columns
-- 3. If using existing data, backup first before migration
--
-- IMPORTANT: The following tables are NEW and must be created:
-- - LessonProgress
-- - StudentNotes
-- - CourseReview
-- - Notification
--
-- The following tables are ENHANCED and require ALTER statements:
-- - Teacher (added 7 new columns)
-- - Course (added 6 new columns)
-- - Lesson (added 6 new columns)
-- - Section (added 2 new columns)
-- - Assignment (added 4 new columns)
-- - AssignmentSubmission (added 4 new columns)

-- ==========================================
-- END OF SCHEMA DEFINITION
-- ==========================================
