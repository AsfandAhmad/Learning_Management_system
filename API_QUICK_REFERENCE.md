# LMS API Quick Reference

## Base URL
```
http://localhost:5000/api
```

## Authentication Headers
All protected routes require:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

## Auth Endpoints

### Student Registration
```
POST /auth/student/register
Body: {
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "securepass123"
}
Response: { "studentId": 1, "message": "Student registered successfully" }
```

### Student Login
```
POST /auth/student/login
Body: { "email": "john@example.com", "password": "securepass123" }
Response: { 
  "token": "JWT_TOKEN",
  "student": { "studentId": 1, "fullName": "John Doe", "email": "john@example.com" }
}
```

### Teacher Registration
```
POST /auth/teacher/register
Body: {
  "fullName": "Prof. Smith",
  "email": "smith@example.com",
  "password": "securepass123",
  "qualification": "M.Tech"
}
Response: { "teacherId": 1, "message": "Teacher registered successfully. Awaiting admin approval." }
```

### Teacher Login
```
POST /auth/teacher/login
Body: { "email": "smith@example.com", "password": "securepass123" }
Response: {
  "token": "JWT_TOKEN",
  "teacher": { "teacherId": 1, "fullName": "Prof. Smith", ... }
}
```

---

## Courses API

### List All Published Courses
```
GET /courses
Query: None
Response: [
  {
    "CourseID": 1,
    "Title": "Python Basics",
    "Description": "...",
    "Category": "Programming",
    "Level": "Beginner",
    "TeacherName": "Prof. Smith",
    "StudentCount": 45,
    "SectionCount": 5
  }
]
```

### Get Course Details with Sections
```
GET /courses/:courseId
Response: {
  "CourseID": 1,
  "Title": "Python Basics",
  "sections": [
    { "SectionID": 1, "Title": "Introduction", "LessonCount": 3 }
  ]
}
```

### Create Course (Teacher Only)
```
POST /courses
Auth: Required (Teacher)
Body: {
  "Title": "Python Basics",
  "Description": "Learn Python programming",
  "Category": "Programming",
  "Level": "Beginner",
  "ThumbnailURL": "https://..."
}
Response: { "CourseID": 1, "message": "Course created successfully in Draft status" }
```

### Update Course (Teacher Only)
```
PUT /courses/:courseId
Auth: Required (Teacher)
Body: {
  "Title": "Python Advanced",
  "Description": "...",
  "Status": "Published"
}
```

### Delete Course (Teacher Only)
```
DELETE /courses/:courseId
Auth: Required (Teacher)
```

### Get Teacher's Courses
```
GET /courses/teacher/my-courses
Auth: Required (Teacher)
Response: [{ "CourseID": 1, "Title": "...", "StudentCount": 45 }]
```

### Get Student's Courses
```
GET /courses/student/my-courses
Auth: Required (Student)
Response: [{ "CourseID": 1, "Title": "...", "ProgressPercentage": 45 }]
```

### Enroll in Course
```
POST /courses/:courseId/enroll
Auth: Required (Student)
Response: { "EnrollmentID": 1, "message": "Enrolled in course successfully" }
```

### Get Course Enrollments (Teacher)
```
GET /courses/:courseId/enrollments
Auth: Required (Teacher)
Response: [
  { "EnrollmentID": 1, "StudentID": 1, "FullName": "John", "ProgressPercentage": 45 }
]
```

---

## Sections API (Course Structure)

### Get All Sections
```
GET /courses/:courseId/sections
Response: [
  { 
    "SectionID": 1, 
    "Title": "Introduction",
    "PositionOrder": 1,
    "LessonCount": 3,
    "VideoCount": 2,
    "PDFCount": 1
  }
]
```

### Get Course Curriculum (Udemy-style)
```
GET /courses/:courseId/sections/curriculum
Response: {
  "CourseID": 1,
  "Title": "Python Basics",
  "sections": [
    {
      "SectionID": 1,
      "Title": "Introduction",
      "lessons": [
        { "LessonID": 1, "Title": "Hello World", "ContentType": "Video", "icon": "🎥" }
      ]
    }
  ],
  "totalSections": 5,
  "totalLessons": 20
}
```

### Get Student Progress (Per Section)
```
GET /courses/:courseId/sections/student/progress
Auth: Required (Student)
Response: {
  "CourseProgress": 45,
  "SectionProgress": [
    { "SectionID": 1, "Title": "Introduction", "Progress": 100, "TotalLessons": 3 }
  ]
}
```

### Create Section (Teacher)
```
POST /courses/:courseId/sections
Auth: Required (Teacher)
Body: { "Title": "Introduction" }
Response: { "SectionID": 1, "PositionOrder": 1 }
```

### Mark Section Complete (Student)
```
POST /courses/:courseId/sections/:sectionId/complete
Auth: Required (Student)
```

---

## Lessons API

### Get Lessons in Section
```
GET /sections/:sectionId/lessons
Response: [
  { 
    "LessonID": 1, 
    "Title": "Hello World", 
    "ContentType": "Video",
    "ContentURL": "https://...",
    "PositionOrder": 1
  }
]
```

### Get Single Lesson
```
GET /sections/:sectionId/lessons/:lessonId
```

### Create Lesson (Teacher)
```
POST /sections/:sectionId/lessons
Auth: Required (Teacher)
Body: {
  "Title": "Hello World",
  "ContentType": "Video",
  "ContentURL": "https://...",
  "PositionOrder": 1
}
```

### Update Lesson (Teacher)
```
PUT /sections/:sectionId/lessons/:lessonId
Auth: Required (Teacher)
```

### Delete Lesson (Teacher)
```
DELETE /sections/:sectionId/lessons/:lessonId
Auth: Required (Teacher)
```

---

## Assignments API

### Get Assignments
```
GET /courses/:courseId/assignments
Response: [
  { "AssignmentID": 1, "Title": "Assignment 1", "DueDate": "2024-12-01", "SubmissionCount": 5 }
]
```

### Create Assignment (Teacher)
```
POST /courses/:courseId/assignments
Auth: Required (Teacher)
Body: {
  "Title": "Assignment 1",
  "Description": "...",
  "DueDate": "2024-12-01",
  "MaxMarks": 100
}
```

### Submit Assignment (Student)
```
POST /courses/:courseId/assignments/:assignmentId/submit
Auth: Required (Student)
Body: { "FileURL": "https://..." }
```

### Get Submissions (Teacher)
```
GET /courses/:courseId/assignments/:assignmentId/submissions
Auth: Required (Teacher)
```

### Grade Submission (Teacher)
```
PUT /courses/:courseId/assignments/submissions/:submissionId/grade
Auth: Required (Teacher)
Body: { "MarksObtained": 85, "Feedback": "Good work!" }
```

### Get Assignment Stats (Teacher)
```
GET /courses/:courseId/assignments/:assignmentId/stats
Auth: Required (Teacher)
```

---

## Quizzes API

### Get Quizzes
```
GET /courses/:courseId/quizzes
Response: [
  { "QuizID": 1, "Title": "Quiz 1", "TotalMarks": 50, "QuestionCount": 10 }
]
```

### Get Quiz with Questions
```
GET /courses/:courseId/quizzes/:quizId
Response: {
  "QuizID": 1,
  "Title": "Quiz 1",
  "questions": [
    { "QuestionID": 1, "Question": "...", "Options": ["A", "B", "C"] }
  ]
}
```

### Create Quiz (Teacher)
```
POST /courses/:courseId/quizzes
Auth: Required (Teacher)
Body: {
  "Title": "Quiz 1",
  "Description": "...",
  "TotalMarks": 50,
  "PassingMarks": 30
}
```

### Submit Quiz (Student)
```
POST /courses/:courseId/quizzes/:quizId/submit
Auth: Required (Student)
Body: { "answers": { "1": "A", "2": "B", "3": "C" } }
Response: { "Score": 45, "TotalMarks": 50, "Passed": true }
```

### Get Quiz Attempts (Student)
```
GET /courses/:courseId/quizzes/:quizId/attempts
Auth: Required (Student)
```

---

## Teacher API

### Get Teacher Profile
```
GET /teacher/profile
Auth: Required (Teacher)
Response: {
  "TeacherID": 1,
  "FullName": "Prof. Smith",
  "Email": "smith@example.com",
  "Qualification": "M.Tech"
}
```

### Update Teacher Profile
```
PUT /teacher/profile
Auth: Required (Teacher)
Body: { "FullName": "Prof. Smith", "Qualification": "M.Tech" }
```

### Get Teacher Documents
```
GET /teacher/documents
Auth: Required (Teacher)
```

### Upload Document
```
POST /teacher/documents
Auth: Required (Teacher)
Body: {
  "DocumentType": "CV",
  "FileName": "CV.pdf",
  "FileURL": "https://..."
}
```

### Get Teacher Statistics
```
GET /teacher/stats
Auth: Required (Teacher)
Response: {
  "TotalCourses": 5,
  "TotalStudents": 120,
  "AverageRating": 4.5
}
```

### Get Teacher Enrollments
```
GET /teacher/enrollments
Auth: Required (Teacher)
```

---

## Student API

### Get Student Profile
```
GET /student/profile
Auth: Required (Student)
```

### Update Student Profile
```
PUT /student/profile
Auth: Required (Student)
Body: { "fullName": "John Doe" }
```

### Get Student Courses
```
GET /student/courses
Auth: Required (Student)
Response: [
  { "CourseID": 1, "Title": "...", "ProgressPercentage": 45 }
]
```

### Get Overall Progress
```
GET /student/progress
Auth: Required (Student)
Response: [
  { "CourseID": 1, "Title": "...", "ProgressPercentage": 45 }
]
```

### Get Certificates
```
GET /student/certificates
Auth: Required (Student)
Response: [
  { "CertificateID": 1, "CourseName": "Python Basics", "IssueDate": "2024-01-01" }
]
```

### Get Activity History
```
GET /student/activity
Auth: Required (Student)
Response: [
  { "ActivityType": "LessonView", "ActivityDate": "2024-01-01" }
]
```

---

## Common Response Codes

| Code | Status | Meaning |
|------|--------|---------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource conflict (e.g., duplicate) |
| 500 | Server Error | Internal server error |

---

## Quick Tips

1. **Always include Authorization header** with Bearer token for protected routes
2. **Use courseId from course creation response** for subsequent requests
3. **Teacher courses must be "Published"** for students to enroll
4. **Student progress is calculated** from ActivityLog entries
5. **Sections and Lessons are ordered** by PositionOrder field
6. **Quiz passing** requires score >= PassingMarks

---

**Last Updated**: November 20, 2025
**Total Endpoints**: 84
**Authentication**: JWT Tokens
**Base URL**: http://localhost:5000/api
