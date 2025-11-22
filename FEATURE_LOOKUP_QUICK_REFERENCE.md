# 🔍 Quick Feature Lookup Guide

## Where is [Feature] Integrated?

---

## QUESTIONS & QUIZ QUESTIONS

### Where to find code?
- **Main File**: `server/src/controllers/quiz.controller.js`
- **Routes**: `server/src/routes/quiz.routes.js`
- **Database Table**: `Question` table

### Key Code Locations:

| What | File | Lines | Function |
|------|------|-------|----------|
| Count questions per quiz | quiz.controller.js | 10 | getQuizzes() |
| Get questions with options | quiz.controller.js | 32-33 | getQuizById() |
| Auto-score submission | quiz.controller.js | 138-139 | submitQuizAttempt() |
| Delete questions cascade | quiz.controller.js | 108 | deleteQuiz() |

### API Endpoints:
```
GET    /api/courses/:courseId/quizzes
GET    /api/courses/:courseId/quizzes/:quizId
POST   /api/courses/:courseId/quizzes/:quizId/submit
GET    /api/courses/:courseId/quizzes/:quizId/attempts
POST   /api/courses/:courseId/quizzes
PUT    /api/courses/:courseId/quizzes/:quizId
DELETE /api/courses/:courseId/quizzes/:quizId
```

### Quick Code Reference:
```javascript
// Get questions for a quiz
const [questions] = await pool.query(
  "SELECT * FROM Question WHERE QuizID = ? ORDER BY QuestionID",
  [quizId]
);

// Auto-score: Compare answers with correct options
let score = 0;
questions.forEach(q => {
  if (answers[q.QuestionID] === q.CorrectOption) {
    score += q.Marks;
  }
});
```

---

## ASSIGNMENT SUBMISSIONS

### Where to find code?
- **Main File**: `server/src/controllers/assignments.controller.js`
- **Routes**: `server/src/routes/assignments.routes.js`
- **Database Table**: `AssignmentSubmission` table

### Key Code Locations:

| What | File | Lines | Function |
|------|------|-------|----------|
| Count submissions | assignments.controller.js | 10 | getAssignments() |
| Student submits file | assignments.controller.js | 162-178 | submitAssignment() |
| Get all submissions | assignments.controller.js | 193-199 | getSubmissions() |
| Teacher grades | assignments.controller.js | 204-210 | gradeSubmission() |
| Get stats | assignments.controller.js | 233-241 | getAssignmentStats() |

### API Endpoints:
```
GET    /api/courses/:courseId/assignments
POST   /api/courses/:courseId/assignments
GET    /api/courses/:courseId/assignments/:assignmentId
PUT    /api/courses/:courseId/assignments/:assignmentId
DELETE /api/courses/:courseId/assignments/:assignmentId
POST   /api/courses/:courseId/assignments/:assignmentId/submit
GET    /api/courses/:courseId/assignments/:assignmentId/submissions
GET    /api/courses/:courseId/assignments/submissions/:submissionId
PUT    /api/courses/:courseId/assignments/submissions/:submissionId/grade
GET    /api/courses/:courseId/assignments/:assignmentId/stats
```

### Quick Code Reference:
```javascript
// Student submits assignment
const [result] = await pool.query(
  "INSERT INTO AssignmentSubmission (AssignmentID, StudentID, FileURL) VALUES (?, ?, ?)",
  [assignmentId, studentId, fileURL]
);

// Teacher grades
await pool.query(
  "UPDATE AssignmentSubmission SET MarksObtained = ?, Feedback = ? WHERE SubmissionID = ?",
  [MarksObtained, Feedback, submissionId]
);
```

---

## ACTIVITY LOG & PROGRESS

### Where to find code?
- **Files Used**: 
  - `server/src/controllers/sections.controller.js` (progress & logging)
  - `server/src/controllers/student.controller.js` (history)
  - `server/src/controllers/enrollment.controller.js` (progress details)
- **Database Table**: `ActivityLog` table

### Key Code Locations:

| What | File | Lines | Function |
|------|------|-------|----------|
| Count lesson views for progress | sections.controller.js | 225 | getStudentProgress() |
| Log lesson completion | sections.controller.js | 277 | markSectionComplete() |
| Get activity history | student.controller.js | 99-101 | getStudentActivity() |
| Dashboard statistics | student.controller.js | 61 | getStudentDashboard() |
| Progress details | enrollment.controller.js | 272 | getStudentProgressDetails() |

### API Endpoints:
```
GET    /api/courses/:courseId/progress
POST   /api/courses/:courseId/sections/:sectionId/complete
GET    /api/student/activity
GET    /api/student/dashboard
GET    /api/courses/:courseId/progress-details
```

### Quick Code Reference:
```javascript
// Log lesson view when student completes section
await pool.query(
  "INSERT INTO ActivityLog (StudentID, ActivityDate, ActivityType) VALUES (?, CURDATE(), 'LessonView')",
  [studentId]
);

// Calculate progress from ActivityLog
const progressPercentage = (CompletedLessons / TotalLessons) * 100;

// Get student activity history
const [activities] = await pool.query(
  "SELECT ActivityLogID, ActivityType, ActivityDate FROM ActivityLog WHERE StudentID = ? ORDER BY ActivityDate DESC LIMIT 100",
  [studentId]
);
```

---

## FEATURE INTERACTION MATRIX

### How features relate to each other:

```
┌─────────────────────────────────────────────────────┐
│ QUIZ QUESTIONS FLOW                                 │
├─────────────────────────────────────────────────────┤
│ Student Views Quiz                                  │
│   ↓ (getQuizById loads Questions)                   │
│ Student Submits Answer                              │
│   ↓ (submitQuizAttempt auto-scores using Questions) │
│ Score Stored in QuizAttempt                         │
│   ↓ (Can be logged in ActivityLog)                  │
│ Progress Updated                                    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ ASSIGNMENT SUBMISSION FLOW                          │
├─────────────────────────────────────────────────────┤
│ Student Uploads File                                │
│   ↓ (submitAssignment stores in AssignmentSubmission)
│ File Stored with NULL MarksObtained                 │
│   ↓ (Teacher views submissions)                     │
│ Teacher Grades & Adds Feedback                      │
│   ↓ (gradeSubmission updates MarksObtained)         │
│ Student Gets Grade                                  │
│   ↓ (Can be logged in ActivityLog)                  │
│ Progress Updated                                    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ ACTIVITY LOG & PROGRESS FLOW                        │
├─────────────────────────────────────────────────────┤
│ Student Takes Any Action                            │
│   ↓ (Views Lesson, Submits Quiz, Uploads Assignment)
│ Logged in ActivityLog                               │
│   ↓ (markSectionComplete inserts entries)           │
│ Progress Calculated                                 │
│   ↓ (COUNT views / total lessons × 100)             │
│ Enrollment.ProgressPercentage Updated               │
│   ↓ (Updated via progress endpoints)                │
│ Student Sees Progress on Dashboard                  │
└─────────────────────────────────────────────────────┘
```

---

## DATABASE TABLE QUICK REFERENCE

### Question Table
```sql
CREATE TABLE Question (
    QuestionID INT AUTO_INCREMENT PRIMARY KEY,
    QuestionText TEXT NOT NULL,
    OptionA VARCHAR(255),
    OptionB VARCHAR(255),
    OptionC VARCHAR(255),
    OptionD VARCHAR(255),
    CorrectOption CHAR(1),  -- 'A', 'B', 'C', or 'D'
    Marks INT DEFAULT 1
);
```

### AssignmentSubmission Table
```sql
CREATE TABLE AssignmentSubmission (
    SubmissionID INT AUTO_INCREMENT PRIMARY KEY,
    AssignmentID INT NOT NULL,
    StudentID INT NOT NULL,
    FileURL VARCHAR(255),              -- Student's uploaded file
    SubmittedAt TIMESTAMP,              -- Auto timestamp on insert
    MarksObtained INT,                  -- NULL until graded
    Feedback TEXT,                      -- Teacher's feedback
    FOREIGN KEY (AssignmentID) REFERENCES Assignment(AssignmentID),
    FOREIGN KEY (StudentID) REFERENCES Student(StudentID)
);
```

### ActivityLog Table
```sql
CREATE TABLE ActivityLog (
    LogID INT AUTO_INCREMENT PRIMARY KEY,
    StudentID INT NOT NULL,
    ActivityDate DATE,
    ActivityType ENUM(
        'Login',
        'LessonView',
        'QuizAttempt',
        'Submission'
    ),
    FOREIGN KEY (StudentID) REFERENCES Student(StudentID)
);
```

---

## EXAMPLE WORKFLOWS

### Workflow 1: Student Takes Quiz
```
1. GET /api/courses/5/quizzes/10
   → quiz.controller.js getQuizById()
   → Returns: Quiz with all Questions (including OptionA-D)

2. Student answers questions and submits

3. POST /api/courses/5/quizzes/10/submit
   Body: { answers: { Q1: 'B', Q2: 'A' } }
   → quiz.controller.js submitQuizAttempt()
   → Auto-score by comparing with Question.CorrectOption
   → INSERT INTO QuizAttempt with score
   → Returns: { AttemptID: 42, Score: 8 }

4. Student views progress
   → Progress includes quiz attempts
```

### Workflow 2: Student Submits Assignment
```
1. GET /api/courses/5/assignments
   → assignments.controller.js getAssignments()
   → Shows SubmissionCount for each assignment

2. POST /api/courses/5/assignments/3/submit
   Body: { fileURL: "https://storage.com/file.pdf" }
   → assignments.controller.js submitAssignment()
   → Checks if already submitted
   → If YES: UPDATE FileURL
   → If NO: INSERT INTO AssignmentSubmission
   → Returns: { SubmissionID: 42 }

3. Teacher grades later
   → PUT /api/courses/5/assignments/submissions/42/grade
   → Body: { MarksObtained: 8, Feedback: "Good!" }
   → assignments.controller.js gradeSubmission()
   → UPDATE AssignmentSubmission with marks & feedback

4. Student sees grade
   → Reflected in progress
```

### Workflow 3: Track Student Progress
```
1. Student completes lessons
   → POST /api/courses/5/sections/2/complete
   → sections.controller.js markSectionComplete()
   → Logs each lesson view in ActivityLog

2. Get progress
   → GET /api/courses/5/progress
   → sections.controller.js getStudentProgress()
   → COUNT(ActivityLog entries)
   → Calculate: (3 views / 5 total) × 100 = 60%
   → Returns: { Section, TotalLessons, CompletedLessons, ProgressPercentage: 60 }

3. View activity history
   → GET /api/student/activity
   → student.controller.js getStudentActivity()
   → Returns: Last 100 activities with dates
```

---

## File Navigation Cheat Sheet

### To find Question implementation:
```
1. Quiz business logic → server/src/controllers/quiz.controller.js
2. Quiz routes → server/src/routes/quiz.routes.js
3. Database schema → server/src/db/init.sql (line: Question table)
```

### To find Assignment Submission implementation:
```
1. Submission business logic → server/src/controllers/assignments.controller.js
2. Assignment routes → server/src/routes/assignments.routes.js
3. Database schema → server/src/db/init.sql (line: AssignmentSubmission table)
```

### To find Activity Log implementation:
```
1. Logging logic → server/src/controllers/sections.controller.js (logging)
2. Query logic → server/src/controllers/student.controller.js (retrieval)
3. Progress logic → server/src/controllers/enrollment.controller.js (calculations)
4. Database schema → server/src/db/init.sql (line: ActivityLog table)
```

---

## Common Queries

### Get all questions for a quiz
```javascript
SELECT * FROM Question WHERE QuizID = ? ORDER BY QuestionID
```

### Get all submissions for an assignment
```javascript
SELECT * FROM AssignmentSubmission WHERE AssignmentID = ? 
AND StudentID = ? ORDER BY SubmittedAt DESC
```

### Get student progress percentage
```javascript
SELECT ROUND((
  SELECT COUNT(*) FROM ActivityLog 
  WHERE StudentID = ? AND ActivityType = 'LessonView'
) / (
  SELECT COUNT(*) FROM Lesson 
  WHERE SectionID IN (SELECT SectionID FROM Section WHERE CourseID = ?)
) * 100, 2) as ProgressPercentage
```

### Get student activity history (last 100)
```javascript
SELECT * FROM ActivityLog 
WHERE StudentID = ? 
ORDER BY ActivityDate DESC 
LIMIT 100
```

### Get assignment statistics
```javascript
SELECT 
  AVG(MarksObtained) as AverageMarks,
  COUNT(*) as SubmissionCount,
  MAX(MarksObtained) as HighestMarks,
  MIN(MarksObtained) as LowestMarks
FROM AssignmentSubmission 
WHERE AssignmentID = ? AND MarksObtained IS NOT NULL
```

---

## Status: 🟢 PRODUCTION READY

All three features are fully integrated, tested, and ready for production use:
- ✅ Questions & Quiz Questions: Fully functional auto-scoring
- ✅ Assignment Submissions: Full grading workflow
- ✅ Activity Log: Complete progress tracking

For detailed code examples and architecture diagrams, see:
- `FEATURE_INTEGRATION_LOCATIONS.md` - Detailed locations with code
- `FEATURE_INTEGRATION_DIAGRAMS.md` - Visual architecture and flows
