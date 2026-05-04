-- Add new columns to Course table
ALTER TABLE Course
ADD COLUMN Prerequisites TEXT NULL AFTER Level,
ADD COLUMN LearningOutcomes TEXT NULL AFTER Prerequisites,
ADD COLUMN EstimatedHours INT NULL AFTER LearningOutcomes,
ADD COLUMN DifficultyLevel ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner' AFTER EstimatedHours;

-- Create CoursePrerequisite table for many-to-many relationship
CREATE TABLE IF NOT EXISTS CoursePrerequisite (
    CourseID INT NOT NULL,
    PrerequisiteCourseID INT NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (CourseID, PrerequisiteCourseID),
    FOREIGN KEY (CourseID) REFERENCES Course(CourseID) ON DELETE CASCADE,
    FOREIGN KEY (PrerequisiteCourseID) REFERENCES Course(CourseID) ON DELETE CASCADE
);

-- Create CourseLearningOutcome table
CREATE TABLE IF NOT EXISTS CourseLearningOutcome (
    OutcomeID INT AUTO_INCREMENT PRIMARY KEY,
    CourseID INT NOT NULL,
    Description TEXT NOT NULL,
    SortOrder INT DEFAULT 0,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CourseID) REFERENCES Course(CourseID) ON DELETE CASCADE
);

-- Create CourseResource table for additional course materials
CREATE TABLE IF NOT EXISTS CourseResource (
    ResourceID INT AUTO_INCREMENT PRIMARY KEY,
    CourseID INT NOT NULL,
    Title VARCHAR(255) NOT NULL,
    Description TEXT,
    FileURL VARCHAR(500) NOT NULL,
    FileType ENUM('Document', 'Video', 'Link', 'Other') DEFAULT 'Document',
    SortOrder INT DEFAULT 0,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CourseID) REFERENCES Course(CourseID) ON DELETE CASCADE
);
