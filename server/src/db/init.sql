CREATE TABLE Student (
    StudentID INT AUTO_INCREMENT PRIMARY KEY,
    FullName VARCHAR(100) NOT NULL,
    Email VARCHAR(120) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    StreakCount INT DEFAULT 0,
    LastActiveDate DATE,
    Status ENUM('Active','Blocked') DEFAULT 'Active'
);

CREATE TABLE Teacher (
    TeacherID INT AUTO_INCREMENT PRIMARY KEY,
    FullName VARCHAR(100) NOT NULL,
    Email VARCHAR(120) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    Qualification TEXT,
    ProfilePhoto VARCHAR(255),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Status ENUM('Pending','Approved','Rejected') DEFAULT 'Pending'
);

CREATE TABLE TeacherDocument (
    DocumentID INT AUTO_INCREMENT PRIMARY KEY,
    TeacherID INT NOT NULL,
    DocumentType ENUM('CV','Certificate','Qualification','Other') DEFAULT 'CV',
    FileName VARCHAR(255) NOT NULL,
    FileURL VARCHAR(500) NOT NULL,
    UploadedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (TeacherID) REFERENCES Teacher(TeacherID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE Admin (
    AdminID INT AUTO_INCREMENT PRIMARY KEY,
    FullName VARCHAR(100) NOT NULL,
    Email VARCHAR(120) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    Role ENUM('SuperAdmin','Staff') DEFAULT 'Staff',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
    
    FOREIGN KEY (TeacherID) REFERENCES Teacher(TeacherID)
);

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
    FOREIGN KEY (CourseID) REFERENCES Course(CourseID)
);

CREATE TABLE Certificate (
    CertificateID INT AUTO_INCREMENT PRIMARY KEY,
    EnrollmentID INT NOT NULL,
    StudentID INT NOT NULL,
    CourseID INT NOT NULL,
    IssueDate DATE,
    CertificateURL VARCHAR(255),

    FOREIGN KEY (EnrollmentID) REFERENCES Enrollment(EnrollmentID),
    FOREIGN KEY (StudentID) REFERENCES Student(StudentID),
    FOREIGN KEY (CourseID) REFERENCES Course(CourseID)
);

CREATE TABLE Section (
    SectionID INT AUTO_INCREMENT PRIMARY KEY,
    CourseID INT NOT NULL,
    Title VARCHAR(150),
    PositionOrder INT,

    FOREIGN KEY (CourseID) REFERENCES Course(CourseID)
);

CREATE TABLE Lesson (
    LessonID INT AUTO_INCREMENT PRIMARY KEY,
    SectionID INT NOT NULL,
    Title VARCHAR(150),
    ContentType ENUM('PDF','Video','Text'),
    ContentURL VARCHAR(255),
    PositionOrder INT,

    FOREIGN KEY (SectionID) REFERENCES Section(SectionID)
);

CREATE TABLE Quiz (
    QuizID INT AUTO_INCREMENT PRIMARY KEY,
    CourseID INT NOT NULL,
    Title VARCHAR(150),
    TotalMarks INT,
    TimeLimit INT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (CourseID) REFERENCES Course(CourseID)
);
CREATE TABLE Question (
    QuestionID INT AUTO_INCREMENT PRIMARY KEY,
    QuestionText TEXT NOT NULL,
    OptionA VARCHAR(255),
    OptionB VARCHAR(255),
    OptionC VARCHAR(255),
    OptionD VARCHAR(255),
    CorrectOption CHAR(1),
    Marks INT DEFAULT 1
);

CREATE TABLE QuizQuestions (
    QuizID INT NOT NULL,
    QuestionID INT NOT NULL,
    PRIMARY KEY (QuizID, QuestionID),
    
    FOREIGN KEY (QuizID) REFERENCES Quiz(QuizID),
    FOREIGN KEY (QuestionID) REFERENCES Question(QuestionID)
);

CREATE TABLE QuizAttempt (
    AttemptID INT AUTO_INCREMENT PRIMARY KEY,
    QuizID INT NOT NULL,
    StudentID INT NOT NULL,
    Score INT,
    SubmittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (QuizID) REFERENCES Quiz(QuizID),
    FOREIGN KEY (StudentID) REFERENCES Student(StudentID)
);

CREATE TABLE Assignment (
    AssignmentID INT AUTO_INCREMENT PRIMARY KEY,
    CourseID INT NOT NULL,
    Title VARCHAR(150),
    Description TEXT,
    DueDate DATE,
    MaxMarks INT,

    FOREIGN KEY (CourseID) REFERENCES Course(CourseID)
);

CREATE TABLE AssignmentSubmission (
    SubmissionID INT AUTO_INCREMENT PRIMARY KEY,
    AssignmentID INT NOT NULL,
    StudentID INT NOT NULL,
    FileURL VARCHAR(255),
    SubmittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    MarksObtained INT,
    Feedback TEXT,

    FOREIGN KEY (AssignmentID) REFERENCES Assignment(AssignmentID),
    FOREIGN KEY (StudentID) REFERENCES Student(StudentID)
);

CREATE TABLE ActivityLog (
    LogID INT AUTO_INCREMENT PRIMARY KEY,
    StudentID INT NOT NULL,
    CourseID INT,
    LessonID INT,
    ActivityDate DATE,
    ActivityType ENUM('Login','LessonView','QuizAttempt','Submission'),

    FOREIGN KEY (StudentID) REFERENCES Student(StudentID),
    FOREIGN KEY (CourseID) REFERENCES Course(CourseID),
    FOREIGN KEY (LessonID) REFERENCES Lesson(LessonID)
);