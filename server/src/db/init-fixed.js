import { pool } from "../config/db.js";

async function initializeDatabase() {
    const connection = await pool.getConnection();
    
    try {
        console.log("📦 Initializing database schema...\n");
        
        // Drop existing tables in reverse order of dependencies
        console.log("🗑️  Dropping existing tables (if any)...");
        const dropTables = [
            'ActivityLog', 'Certificate', 'CourseReview', 'StudentNotes', 
            'LessonProgress', 'AssignmentSubmission', 'Assignment', 
            'QuizAttempt', 'QuizQuestions', 'Question', 'Quiz', 
            'Lesson', 'Section', 'Enrollment', 'Course', 
            'TeacherDocument', 'Teacher', 'Student', 'Admin', 'Notification'
        ];
        
        for (const table of dropTables) {
            try {
                await connection.query(`DROP TABLE IF EXISTS ${table}`);
            } catch (err) {
                // Ignore errors
            }
        }
        
        console.log("✅ Cleaned up existing tables\n");
        console.log("📝 Creating tables in correct order...\n");
        
        // 1. Create Admin table first (no dependencies)
        await connection.query(`
            CREATE TABLE Admin (
                AdminID INT AUTO_INCREMENT PRIMARY KEY,
                FullName VARCHAR(100) NOT NULL,
                Email VARCHAR(120) UNIQUE NOT NULL,
                PasswordHash VARCHAR(255) NOT NULL,
                Role ENUM('SuperAdmin','Staff') DEFAULT 'Staff',
                CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_email (Email),
                INDEX idx_role (Role)
            )
        `);
        console.log("✅ Created table: Admin");
        
        // 2. Create Student table (no dependencies)
        await connection.query(`
            CREATE TABLE Student (
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
            )
        `);
        console.log("✅ Created table: Student");
        
        // 3. Create Teacher table (depends on Admin)
        await connection.query(`
            CREATE TABLE Teacher (
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
            )
        `);
        console.log("✅ Created table: Teacher");
        
        // 4. Create TeacherDocument table (depends on Teacher)
        await connection.query(`
            CREATE TABLE TeacherDocument (
                DocumentID INT AUTO_INCREMENT PRIMARY KEY,
                TeacherID INT NOT NULL,
                DocumentType ENUM('CV','Certificate','Qualification','Other') DEFAULT 'CV',
                FileName VARCHAR(255) NOT NULL,
                FileURL VARCHAR(500) NOT NULL,
                UploadedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (TeacherID) REFERENCES Teacher(TeacherID) ON DELETE CASCADE ON UPDATE CASCADE,
                INDEX idx_teacher_id (TeacherID),
                INDEX idx_doc_type (DocumentType)
            )
        `);
        console.log("✅ Created table: TeacherDocument");
        
        // 5. Create Course table (depends on Teacher)
        await connection.query(`
            CREATE TABLE Course (
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
            )
        `);
        console.log("✅ Created table: Course");
        
        // 6. Create Section table (depends on Course)
        await connection.query(`
            CREATE TABLE Section (
                SectionID INT AUTO_INCREMENT PRIMARY KEY,
                CourseID INT NOT NULL,
                Title VARCHAR(150) NOT NULL,
                Description TEXT,
                PositionOrder INT,
                CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (CourseID) REFERENCES Course(CourseID) ON DELETE CASCADE,
                INDEX idx_course_id (CourseID),
                INDEX idx_position (PositionOrder)
            )
        `);
        console.log("✅ Created table: Section");
        
        // 7. Create Lesson table (depends on Section)
        await connection.query(`
            CREATE TABLE Lesson (
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
            )
        `);
        console.log("✅ Created table: Lesson");
        
        // 8. Create Enrollment table (depends on Student and Course)
        await connection.query(`
            CREATE TABLE Enrollment (
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
            )
        `);
        console.log("✅ Created table: Enrollment");
        
        // 9. Create Quiz table (depends on Course)
        await connection.query(`
            CREATE TABLE Quiz (
                QuizID INT AUTO_INCREMENT PRIMARY KEY,
                CourseID INT NOT NULL,
                Title VARCHAR(150),
                TotalMarks INT,
                TimeLimit INT,
                CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (CourseID) REFERENCES Course(CourseID),
                INDEX idx_course_id (CourseID),
                INDEX idx_created_at (CreatedAt)
            )
        `);
        console.log("✅ Created table: Quiz");
        
        // 10. Create Question table (no dependencies)
        await connection.query(`
            CREATE TABLE Question (
                QuestionID INT AUTO_INCREMENT PRIMARY KEY,
                QuestionText TEXT NOT NULL,
                OptionA VARCHAR(255),
                OptionB VARCHAR(255),
                OptionC VARCHAR(255),
                OptionD VARCHAR(255),
                CorrectOption CHAR(1),
                Marks INT DEFAULT 1,
                INDEX idx_marks (Marks)
            )
        `);
        console.log("✅ Created table: Question");
        
        // 11. Create QuizQuestions junction table
        await connection.query(`
            CREATE TABLE QuizQuestions (
                QuizID INT NOT NULL,
                QuestionID INT NOT NULL,
                PRIMARY KEY (QuizID, QuestionID),
                FOREIGN KEY (QuizID) REFERENCES Quiz(QuizID) ON DELETE CASCADE,
                FOREIGN KEY (QuestionID) REFERENCES Question(QuestionID) ON DELETE CASCADE
            )
        `);
        console.log("✅ Created table: QuizQuestions");
        
        // 12. Create QuizAttempt table
        await connection.query(`
            CREATE TABLE QuizAttempt (
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
            )
        `);
        console.log("✅ Created table: QuizAttempt");
        
        // 13. Create Assignment table
        await connection.query(`
            CREATE TABLE Assignment (
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
            )
        `);
        console.log("✅ Created table: Assignment");
        
        // 14. Create AssignmentSubmission table
        await connection.query(`
            CREATE TABLE AssignmentSubmission (
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
            )
        `);
        console.log("✅ Created table: AssignmentSubmission");
        
        // 15. Create LessonProgress table
        await connection.query(`
            CREATE TABLE LessonProgress (
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
            )
        `);
        console.log("✅ Created table: LessonProgress");
        
        // 16. Create StudentNotes table
        await connection.query(`
            CREATE TABLE StudentNotes (
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
            )
        `);
        console.log("✅ Created table: StudentNotes");
        
        // 17. Create CourseReview table
        await connection.query(`
            CREATE TABLE CourseReview (
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
            )
        `);
        console.log("✅ Created table: CourseReview");
        
        // 18. Create Certificate table
        await connection.query(`
            CREATE TABLE Certificate (
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
            )
        `);
        console.log("✅ Created table: Certificate");
        
        // 19. Create Notification table
        await connection.query(`
            CREATE TABLE Notification (
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
            )
        `);
        console.log("✅ Created table: Notification");
        
        // 20. Create ActivityLog table
        await connection.query(`
            CREATE TABLE ActivityLog (
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
            )
        `);
        console.log("✅ Created table: ActivityLog");
        
        console.log("\n✅ Database initialization complete!");
        console.log("📊 Total tables created: 20");
        
        connection.release();
        process.exit(0);
    } catch (err) {
        console.error("\n❌ Error initializing database:", err.message);
        console.error(err);
        connection.release();
        process.exit(1);
    }
}

initializeDatabase();
