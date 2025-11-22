# LMS System Flow Diagram

## 1. User Registration & Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    USER REGISTRATION & LOGIN                        │
└─────────────────────────────────────────────────────────────────────┘

STUDENT FLOW                          TEACHER FLOW
────────────────────────────────────────────────────────
│                                      │
POST /auth/student/register     POST /auth/teacher/register
│ FullName, Email, Password      │ FullName, Email, Password, Qualification
│ ▼                               │ ▼
INSERT Student                   INSERT Teacher (Status: Pending)
(Status: Active)                 ├─ Waits for admin approval
│                                │
POST /auth/student/login        POST /auth/teacher/login
│ Email, Password                │ Email, Password
│ ▼                              │ ▼
VERIFY Status = Active      VERIFY Status = Approved
CREATE JWT Token            CREATE JWT Token
├─ studentId                ├─ teacherId
├─ role: "student"         ├─ role: "teacher"
└─ exp: 7 days            └─ exp: 7 days

                    │                          │
                    └──────► Use Bearer Token ◄───────
                        in Authorization Header
```

---

## 2. Teacher Course Creation Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                  TEACHER COURSE CREATION                         │
└──────────────────────────────────────────────────────────────────┘

1. CREATE COURSE (Draft)
   ┌─────────────────────────────┐
   │ POST /courses               │
   │ Auth: Bearer JWT_TOKEN      │
   └─────────────────────────────┘
                  │
                  ▼
   ┌─────────────────────────────┐
   │ INSERT INTO Course          │
   │ - TeacherID (from JWT)      │
   │ - Title, Description        │
   │ - Status: 'Draft'           │
   │ - CreatedAt: NOW()          │
   └─────────────────────────────┘
                  │ (Returns CourseID)
                  ▼

2. ADD SECTIONS TO COURSE
   ┌─────────────────────────────┐
   │ POST /courses/:courseId/    │
   │      sections               │
   │ Auth: Bearer JWT_TOKEN      │
   └─────────────────────────────┘
                  │
                  ▼
   ┌─────────────────────────────┐
   │ INSERT INTO Section         │
   │ - CourseID                  │
   │ - Title                     │
   │ - PositionOrder (auto)      │
   └─────────────────────────────┘
        (Can add multiple sections)
                  │
                  ▼

3. ADD LESSONS TO SECTIONS
   ┌─────────────────────────────┐
   │ POST /sections/:sectionId/  │
   │      lessons                │
   │ Auth: Bearer JWT_TOKEN      │
   └─────────────────────────────┘
                  │
                  ▼
   ┌─────────────────────────────┐
   │ INSERT INTO Lesson          │
   │ - SectionID                 │
   │ - Title, ContentType        │
   │ - ContentURL (Video/PDF)    │
   │ - PositionOrder (auto)      │
   └─────────────────────────────┘
   (Can add multiple lessons per section)

4. ADD ASSESSMENTS
   ┌──────────────────────┬──────────────────────┐
   │ POST /assignments    │ POST /quizzes        │
   │ Auth: Bearer JWT     │ Auth: Bearer JWT     │
   └──────────────────────┴──────────────────────┘
           │                      │
           ▼                      ▼
   INSERT Assignment      INSERT Quiz
   - Title                - Title
   - DueDate              - TotalMarks
   - MaxMarks             - PassingMarks

5. PUBLISH COURSE
   ┌─────────────────────────────┐
   │ PUT /courses/:courseId      │
   │ Body: { Status: Published } │
   │ Auth: Bearer JWT_TOKEN      │
   └─────────────────────────────┘
                  │
                  ▼
   ┌─────────────────────────────┐
   │ UPDATE Course               │
   │ SET Status = 'Published'    │
   └─────────────────────────────┘
                  │
                  ▼
   ✅ Course is now visible to students!
```

---

## 3. Student Course Discovery & Enrollment Flow

```
┌──────────────────────────────────────────────────────────────────┐
│            STUDENT COURSE DISCOVERY & ENROLLMENT                 │
└──────────────────────────────────────────────────────────────────┘

1. BROWSE PUBLISHED COURSES
   ┌─────────────────────────────┐
   │ GET /courses                │
   │ (No Auth Required)          │
   └─────────────────────────────┘
                  │
                  ▼
   ┌─────────────────────────────┐
   │ SELECT * FROM Course        │
   │ WHERE Status = 'Published'  │
   │ JOIN Teacher info           │
   │ ORDER BY CreatedAt DESC     │
   └─────────────────────────────┘
                  │
                  ▼
   Display:
   ├─ Course Title
   ├─ Teacher Name
   ├─ Student Count
   └─ Section Count

2. VIEW COURSE DETAILS & STRUCTURE (Udemy-style)
   ┌─────────────────────────────┐
   │ GET /courses/:courseId/     │
   │     sections/curriculum     │
   │ (No Auth Required)          │
   └─────────────────────────────┘
                  │
                  ▼
   ┌─────────────────────────────┐
   │ SELECT Sections             │
   │ ├─ SELECT Lessons           │
   │ │  ├─ Video 🎥             │
   │ │  ├─ PDF 📄               │
   │ │  └─ Text 📝              │
   │ └─ PositionOrder            │
   └─────────────────────────────┘
                  │
                  ▼
   Display:
   ├─ Section 1: Introduction
   │  ├─ Lesson 1: Hello World (Video)
   │  ├─ Lesson 2: Setup Guide (PDF)
   │  └─ Lesson 3: Getting Started (Text)
   ├─ Section 2: Basics
   │  └─ ... more lessons
   └─ Total: 5 Sections, 20 Lessons

3. ENROLL IN COURSE
   ┌─────────────────────────────┐
   │ POST /courses/:courseId/    │
   │      enroll                 │
   │ Auth: Bearer JWT_TOKEN      │
   └─────────────────────────────┘
                  │
                  ▼
   ┌─────────────────────────────┐
   │ VERIFY:                     │
   │ ├─ Student.Status = 'Active'│
   │ ├─ Course.Status = 'Pub'    │
   │ └─ NOT already enrolled     │
   └─────────────────────────────┘
                  │
                  ▼
   ┌─────────────────────────────┐
   │ INSERT INTO Enrollment      │
   │ - StudentID (from JWT)      │
   │ - CourseID                  │
   │ - Status: 'Active'          │
   │ - ProgressPercentage: 0     │
   │ - EnrollDate: NOW()         │
   └─────────────────────────────┘
                  │
                  ▼
   ✅ Student enrolled successfully!

4. VIEW ENROLLED COURSES
   ┌─────────────────────────────┐
   │ GET /student/courses        │
   │ Auth: Bearer JWT_TOKEN      │
   └─────────────────────────────┘
                  │
                  ▼
   SELECT enrolled courses with progress
```

---

## 4. Student Learning & Progress Tracking Flow

```
┌──────────────────────────────────────────────────────────────────┐
│              STUDENT LEARNING & PROGRESS FLOW                    │
└──────────────────────────────────────────────────────────────────┘

1. VIEW COURSE STRUCTURE
   ┌─────────────────────────────┐
   │ GET /courses/:courseId/     │
   │     sections/curriculum     │
   │ Auth: Bearer JWT_TOKEN      │
   └─────────────────────────────┘
                  │
                  ▼
   Display sections and lessons in course

2. VIEW LESSON CONTENT
   ┌─────────────────────────────┐
   │ GET /sections/:sectionId/   │
   │     lessons/:lessonId       │
   │ Auth: Bearer JWT_TOKEN      │
   └─────────────────────────────┘
                  │
                  ▼
   ┌─────────────────────────────┐
   │ VERIFY Student Enrolled     │
   └─────────────────────────────┘
                  │
                  ▼
   Display lesson:
   ├─ Title
   ├─ Content (Video embed, PDF, Text)
   └─ Previous/Next buttons

3. TRACK LESSON COMPLETION
   (Auto-logged when lesson viewed)
   ┌─────────────────────────────┐
   │ INSERT INTO ActivityLog     │
   │ - StudentID                 │
   │ - ActivityType: 'LessonView'│
   │ - ActivityDate: NOW()       │
   └─────────────────────────────┘

4. CHECK SECTION PROGRESS
   ┌─────────────────────────────┐
   │ GET /courses/:courseId/     │
   │     sections/student/       │
   │     progress                │
   │ Auth: Bearer JWT_TOKEN      │
   └─────────────────────────────┘
                  │
                  ▼
   ┌─────────────────────────────┐
   │ Calculate for each section: │
   │ ├─ Total Lessons            │
   │ ├─ Viewed Lessons (from     │
   │ │  ActivityLog count)       │
   │ └─ Progress % = (Viewed/    │
   │    Total) * 100             │
   └─────────────────────────────┘
                  │
                  ▼
   Response:
   [
     {
       "SectionID": 1,
       "Title": "Introduction",
       "TotalLessons": 3,
       "CompletedLessons": 2,
       "Progress": 67%
     }
   ]

5. COMPLETE SECTION
   ┌─────────────────────────────┐
   │ POST /sections/:sectionId/  │
   │      complete               │
   │ Auth: Bearer JWT_TOKEN      │
   └─────────────────────────────┘
                  │
                  ▼
   ┌─────────────────────────────┐
   │ Log all lessons in section  │
   │ to ActivityLog              │
   └─────────────────────────────┘

6. VIEW OVERALL PROGRESS
   ┌─────────────────────────────┐
   │ GET /student/progress       │
   │ Auth: Bearer JWT_TOKEN      │
   └─────────────────────────────┘
                  │
                  ▼
   Response:
   [
     {
       "CourseID": 1,
       "Title": "Python Basics",
       "ProgressPercentage": 45,
       "LessonsViewed": 9,
       "TotalLessons": 20
     }
   ]
```

---

## 5. Assessment Flow (Assignments & Quizzes)

```
┌──────────────────────────────────────────────────────────────────┐
│                    ASSESSMENT FLOW                               │
└──────────────────────────────────────────────────────────────────┘

ASSIGNMENT FLOW                    QUIZ FLOW
─────────────────────────────────────────────────────
Teacher creates               Teacher creates
│                            │
POST /assignments            POST /quizzes
│                            │
▼                            ▼
INSERT Assignment    INSERT Quiz
- Title              - Title
- DueDate            - Questions
- MaxMarks           - TotalMarks
                     - PassingMarks
│                            │
▼                            ▼
Students see        Students see
in course           in course
│                            │
▼                            ▼
Student submits     Student submits
│ FileURL            │ Answers
▼                    ▼
POST /assignments/ POST /quizzes/
 :id/submit         :id/submit
│                    │
▼                    ▼
INSERT Assignment  Calculate Score
Submission with    - Count correct
FileURL            - Total marks
│                    │
▼                    ▼
Teacher grades     Compare with
│ MarksObtained    PassingMarks
│ Feedback         │
▼                    │
PUT /submissions/ ▼
 :id/grade        Return:
│                - Score
▼                - TotalMarks
Student sees      - Passed: Y/N
grades and
feedback

Teacher can view stats:
├─ Average Score
├─ Submission Count
├─ Highest/Lowest Marks
└─ Submission Rate
```

---

## 6. Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    REQUEST-RESPONSE CYCLE                       │
└─────────────────────────────────────────────────────────────────┘

CLIENT (Frontend)
       │
       │ HTTP Request
       │ + Authorization: Bearer JWT_TOKEN
       │ + Content-Type: application/json
       │
       ▼
EXPRESS APP
│
├─► CORS Middleware
├─► JSON Parser
├─► Morgan Logger
│
├─► Route Matching
│   └─► Find matching route
│
├─► Middleware Chain
│   ├─► isAuth (Verify JWT)
│   ├─► isInstructor/isStudent (Check role)
│   └─► Extract req.user = { teacherId/studentId, role, ... }
│
├─► Controller Function
│   ├─► Validate input
│   ├─► Query database
│   ├─► Check authorization (ownership)
│   ├─► Execute business logic
│   └─► Return response
│
├─► Error Handler
│   ├─► Catch exceptions
│   └─► Return error response
│
       │
       │ HTTP Response
       │ + Status Code (200, 201, 400, 403, 404, 500)
       │ + JSON Body
       │
       ▼
CLIENT (Frontend)
```

---

## 7. Database Schema Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE HIERARCHY                           │
└─────────────────────────────────────────────────────────────────┘

Teacher (1)
├── Many Courses
│   │
│   ├── Course (1..n)
│   │   ├── Many Sections
│   │   │   │
│   │   │   ├── Section (1..m)
│   │   │   │   └── Many Lessons
│   │   │   │       │
│   │   │   │       └── Lesson (1..p)
│   │   │   │           └── ContentType: Video/PDF/Text
│   │   │   │
│   │   │   └── (Ordered by PositionOrder)
│   │   │
│   │   ├── Many Assignments
│   │   │   └── AssignmentSubmissions (per student)
│   │   │       └── MarksObtained, Feedback
│   │   │
│   │   ├── Many Quizzes
│   │   │   ├── Questions (multiple choice, etc)
│   │   │   └── QuizAttempts (per student per attempt)
│   │   │       └── Score, Passed: Y/N
│   │   │
│   │   └── Enrollments (many students)
│   │
│   └── Status: Draft → Published
│
├── TeacherDocuments
│   └── CV, Certificates, etc
│
└── TeacherStats
    └── TotalStudents, Rating, Courses, etc

Student (1)
├── Many Enrollments
│   │
│   ├── Enrollment (1..n)
│   │   ├── CourseID (FK)
│   │   ├── ProgressPercentage (0-100%)
│   │   ├── Status: Active/Completed/Restarted
│   │   └── EnrollDate
│   │
│   ├── ActivityLog (lessons viewed)
│   │   ├── LessonID
│   │   ├── ActivityType: LessonView, QuizAttempt, etc
│   │   └── ActivityDate
│   │
│   ├── AssignmentSubmissions
│   │   ├── AssignmentID
│   │   ├── FileURL
│   │   └── MarksObtained
│   │
│   ├── QuizAttempts
│   │   ├── QuizID
│   │   ├── Score
│   │   └── AttemptDate
│   │
│   └── Certificates
│       ├── CourseID (completed 100%)
│       └── IssueDate
│
└── Status: Active/Blocked
```

---

## 8. Authentication Token Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    JWT TOKEN FLOW                               │
└─────────────────────────────────────────────────────────────────┘

1. LOGIN REQUEST
   POST /auth/student/login
   Body: { "email": "...", "password": "..." }
        │
        ▼
   Database: SELECT * FROM Student WHERE Email = ?
        │
        ▼
   Verify Password: bcrypt.compare(password, PasswordHash)
        │
        ▼
   Success: Create JWT Token
        │
        ├─ Header: { alg: "HS256", typ: "JWT" }
        │
        ├─ Payload:
        │  ├─ studentId: 1
        │  ├─ fullName: "John Doe"
        │  ├─ email: "john@example.com"
        │  ├─ role: "student"
        │  ├─ iat: (issued at)
        │  └─ exp: (expires in 7 days)
        │
        └─ Signature: HMAC-SHA256(base64(header) + "." + base64(payload), SECRET_KEY)
        │
        ▼
   Response: { token: "JWT_TOKEN", student: {...} }

2. AUTHENTICATED REQUEST
   GET /student/courses
   Header: Authorization: Bearer JWT_TOKEN
        │
        ▼
   Middleware: isAuth
   ├─ Extract token from Bearer string
   ├─ Verify signature using SECRET_KEY
   ├─ Decode payload if signature valid
   └─ Attach req.user = decoded_payload
        │
        ▼
   Middleware: isStudent
   ├─ Check req.user.studentId exists
   └─ Proceed to controller if valid
        │
        ▼
   Controller: getStudentCourses
   ├─ Use req.user.studentId for query
   ├─ Fetch courses for this student
   └─ Return courses
        │
        ▼
   Response: [{ CourseID: 1, Title: "..." }]

3. EXPIRED/INVALID TOKEN
   GET /student/courses
   Header: Authorization: Bearer INVALID_TOKEN
        │
        ▼
   Middleware: isAuth
   ├─ Try to verify token
   ├─ Signature invalid or expired
   └─ Throw error
        │
        ▼
   Error Handler:
   Response: 401 Unauthorized "Invalid or expired token"
```

---

## 9. Request-Response Examples

### Example 1: Teacher Creates a Course with Structure

```
Step 1: Teacher Registers
─────────────────────────
Request:
POST /api/auth/teacher/register
{
  "fullName": "Prof. Smith",
  "email": "smith@example.com",
  "password": "secure123",
  "qualification": "M.Tech"
}

Response:
201 Created
{
  "teacherId": 1,
  "message": "Teacher registered successfully. Awaiting admin approval."
}

Step 2: Admin Approves Teacher (not shown)

Step 3: Teacher Logs In
───────────────────────
Request:
POST /api/auth/teacher/login
{
  "email": "smith@example.com",
  "password": "secure123"
}

Response:
200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "teacher": {
    "teacherId": 1,
    "fullName": "Prof. Smith",
    "email": "smith@example.com"
  }
}

Step 4: Teacher Creates a Course
────────────────────────────────
Request:
POST /api/courses
Headers: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
{
  "Title": "Python Programming",
  "Description": "Learn Python from scratch",
  "Category": "Programming",
  "Level": "Beginner",
  "ThumbnailURL": "https://..."
}

Response:
201 Created
{
  "CourseID": 1,
  "message": "Course created successfully in Draft status"
}

Step 5: Teacher Adds Section
─────────────────────────────
Request:
POST /api/courses/1/sections
Headers: Authorization: Bearer ...
{
  "Title": "Introduction to Python"
}

Response:
201 Created
{
  "SectionID": 1,
  "CourseID": 1,
  "Title": "Introduction to Python",
  "PositionOrder": 1
}

Step 6: Teacher Adds Lessons to Section
───────────────────────────────────────
Request:
POST /api/sections/1/lessons
Headers: Authorization: Bearer ...
{
  "Title": "Hello World",
  "ContentType": "Video",
  "ContentURL": "https://youtube.com/...",
  "PositionOrder": 1
}

Response:
201 Created
{
  "LessonID": 1,
  "message": "Lesson created successfully"
}

Step 7: Teacher Publishes Course
────────────────────────────────
Request:
PUT /api/courses/1
Headers: Authorization: Bearer ...
{
  "Title": "Python Programming",
  "Description": "Learn Python from scratch",
  "Category": "Programming",
  "Level": "Beginner",
  "Status": "Published"
}

Response:
200 OK
{
  "ok": true,
  "message": "Course updated successfully"
}

✅ Course is now visible to all students!
```

---

## 10. System Integration Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                   COMPLETE SYSTEM MAP                           │
└─────────────────────────────────────────────────────────────────┘

AUTH LAYER
├── Unified JWT System
├── Separate Student/Teacher flows
└── Role-based middleware

TEACHER LAYER
├── Profile Management
├── Document Upload
├── Course Creation & Management
├── Section & Lesson Organization
├── Assignment & Quiz Creation
└── Student Enrollment Monitoring

COURSE LAYER
├── Course CRUD (Draft → Published)
├── Hierarchical Structure (Course → Section → Lesson)
├── Udemy-style Curriculum View
├── Student Enrollment Management
└── Access Control by TeacherID

LEARNING LAYER
├── Lesson Content Delivery
├── Progress Tracking (per section)
├── Activity Logging
└── Section Completion Marking

ASSESSMENT LAYER
├── Assignments
│  ├── Creation, Submission, Grading
│  └── Feedback & Statistics
└── Quizzes
   ├── Question Management
   ├── Attempt Recording
   └── Automatic Scoring

STUDENT LAYER
├── Profile Management
├── Course Browsing & Enrollment
├── Learning Progress Tracking
├── Certificate Viewing
└── Activity History

DATABASE LAYER
├── 13 Main Tables
├── PascalCase Column Naming
├── Foreign Key Relationships
├── Proper Indexing
└── ACID Compliance

ERROR HANDLING
├── Status Codes (200, 201, 400, 401, 403, 404, 500)
├── Consistent Error Messages
└── Middleware Error Catching

All layers are tightly integrated with:
✅ Authentication at every protected endpoint
✅ Authorization (ownership verification)
✅ Data validation
✅ Transaction safety
✅ Proper error handling
✅ Logging & monitoring
```

---

## Quick Reference: Valid State Transitions

```
COURSE STATUS FLOW
Draft ──[Teacher Updates]--> Published
                              │
                              ├─[Stays Published]
                              │
                              └─[Can Delete if no enrollments]

ENROLLMENT STATUS FLOW
Active ──[100% Progress]--> Completed
  │         │
  │         └─[Issue Certificate]
  │
  └─[Student Unenrolls]--> Unenrolled

TEACHER STATUS FLOW
Pending ──[Admin Approves]─--> Approved
  │                              │
  └─[Admin Rejects]──> Rejected

STUDENT STATUS FLOW
Active ──[Admin Action]──> Blocked
  │                         │
  └─[Never Unblocked]◄──────
```

---

**End of Flow Diagrams**
**Total Controllers**: 10  
**Total Routes**: 84  
**Total Database Tables**: 13  
**All components fully integrated and ready for production!**
