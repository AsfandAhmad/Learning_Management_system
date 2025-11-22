# LMS API Testing Guide - Phase 1 Complete

## Quick Start

### 1. Start Both Servers

**Terminal 1 - Backend:**
```powershell
cd 'C:\Users\T L S\OneDrive\Pictures\Documents\DBS\Learning_Management_system\server'
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd 'C:\Users\T L S\OneDrive\Pictures\Documents\DBS\Learning_Management_system\client'
npm run dev
```

Access:
- Frontend: `http://localhost:5173/`
- Backend: `http://localhost:5000/`

---

## Testing Flow

### Step 1: Admin Approves Teacher
1. **Admin Login** (if available)
   ```
   Email: admin@example.com
   Password: adminpass
   ```

2. **View Pending Teachers**
   - Endpoint: `GET /api/admin/teachers/pending`
   - Returns list of teachers awaiting approval

3. **Teacher Register with CV**
   ```
   POST /api/auth/teacher/register
   {
     "fullName": "Dr. John Smith",
     "email": "john@university.edu",
     "password": "teach123",
     "qualification": "Ph.D. in Computer Science"
   }
   ```

4. **Upload CV**
   ```
   POST /api/teacher/cv/upload
   Headers: Authorization: Bearer {teacher_token}
   Form Data: 
     - cv: [PDF file]
   ```

5. **Admin Approves**
   ```
   PATCH /api/admin/teachers/{teacherId}/approve
   Headers: Authorization: Bearer {admin_token}
   ```

---

### Step 2: Teacher Creates Course with Sections & Lessons

1. **Create Course**
   ```
   POST /api/courses
   Headers: Authorization: Bearer {teacher_token}
   Body: {
     "title": "Advanced JavaScript",
     "description": "Master JavaScript from basics to advanced",
     "category": "Programming",
     "level": "Intermediate",
     "prerequisites": [],
     "learningOutcomes": ["Master async/await", "Learn React basics"]
   }
   ```

2. **Create Section**
   ```
   POST /api/courses/{courseId}/sections
   Headers: Authorization: Bearer {teacher_token}
   Body: {
     "title": "JavaScript Fundamentals",
     "description": "Learn JS basics",
     "positionOrder": 1
   }
   ```

3. **Create Lessons**
   ```
   POST /api/sections/{sectionId}/lessons
   Headers: Authorization: Bearer {teacher_token}
   Body: {
     "title": "Variables and Data Types",
     "contentType": "Video",
     "videoURL": "https://www.youtube.com/embed/VIDEO_ID",
     "videoDuration": 1200,
     "lessonType": "Video",
     "notes": "Important: Always use const by default",
     "positionOrder": 1
   }
   ```

4. **Create Assignment**
   ```
   POST /api/courses/{courseId}/assignments
   Headers: Authorization: Bearer {teacher_token}
   Body: {
     "title": "Build a Todo App",
     "description": "Create a simple todo application",
     "dueDate": "2025-12-31",
     "maxMarks": 100,
     "sectionId": {sectionId},
     "submissionType": "FileUpload",
     "maxAttempts": 3
   }
   ```

5. **Publish Course**
   ```
   PUT /api/courses/{courseId}
   Headers: Authorization: Bearer {teacher_token}
   Body: {
     "status": "Published"
   }
   ```

---

### Step 3: Student Enrolls and Learns

1. **Student Register**
   ```
   POST /api/auth/student/register
   Body: {
     "fullName": "Alice Johnson",
     "email": "alice@student.com",
     "password": "student123"
   }
   ```

2. **Enroll in Course**
   ```
   POST /api/enrollments/{courseId}
   Headers: Authorization: Bearer {student_token}
   ```

3. **View Course Progress**
   ```
   GET /api/progress/course/{courseId}
   Headers: Authorization: Bearer {student_token}
   
   Response:
   {
     "enrollment": {...},
     "overallProgress": 0,
     "sections": [
       {
         "sectionId": 1,
         "title": "Section 1",
         "totalLessons": 3,
         "completedLessons": 0,
         "sectionProgress": 0
       }
     ]
   }
   ```

4. **View Lesson**
   ```
   GET /api/sections/{sectionId}/lessons/{lessonId}
   Headers: Authorization: Bearer {student_token}
   ```

5. **Update Lesson Progress**
   ```
   PUT /api/sections/{sectionId}/lessons/{lessonId}/progress
   Headers: Authorization: Bearer {student_token}
   Body: {
     "Completed": true,
     "LastPosition": 1200,
     "TimeSpent": 1200
   }
   ```

6. **Save Notes**
   ```
   POST /api/sections/{sectionId}/lessons/{lessonId}/notes
   Headers: Authorization: Bearer {student_token}
   Body: {
     "Content": "Const creates block-scoped variables...",
     "VideoTimestamp": 120
   }
   ```

7. **Submit Assignment**
   ```
   POST /api/assignments/{assignmentId}/submit
   Headers: Authorization: Bearer {student_token}
   Form Data:
     - submission: [file]
   ```

---

### Step 4: Teacher Reviews Progress

1. **View Enrolled Students**
   ```
   GET /api/progress/course/{courseId}/enrollments
   Headers: Authorization: Bearer {teacher_token}
   
   Response:
   {
     "courseStats": {
       "averageProgress": 45,
       "completedStudents": 2,
       "activeStudents": 5,
       "totalStudents": 7
     },
     "enrollments": [...]
   }
   ```

2. **View Analytics Dashboard**
   ```
   GET /api/progress/instructor/analytics
   Headers: Authorization: Bearer {teacher_token}
   ```

3. **View Assignments**
   ```
   GET /api/courses/{courseId}/assignments
   Headers: Authorization: Bearer {teacher_token}
   ```

---

### Step 5: Student Views Analytics

1. **View Learning Stats**
   ```
   GET /api/progress/student/analytics
   Headers: Authorization: Bearer {student_token}
   
   Response:
   {
     "enrollments": [...],
     "timeStats": {
       "totalTimeSpent": 3600,
       "lessonsCompleted": 5
     },
     "quizStats": {
       "averageScore": 85,
       "quizzesTaken": 2
     },
     "assignmentStats": {
       "submissionsGraded": 3,
       "averageMarks": 88,
       "assignmentsSubmitted": 3
     }
   }
   ```

---

## Common Errors & Solutions

### 401 Unauthorized
```
Error: "Invalid or expired token"
Solution: 
1. Re-login to get new token
2. Include "Bearer {token}" in Authorization header
```

### 403 Forbidden
```
Error: "Unauthorized - Teacher access required"
Solution:
1. Make sure logged in as correct role
2. Use teacher token for teacher endpoints
3. Use student token for student endpoints
```

### File Upload Errors
```
Error: "Only PDF, DOC, and DOCX files allowed for CV"
Solution: Upload correct file format
- CV: .pdf, .doc, .docx (max 5MB)
- Resources: .pdf, .zip, images (max 50MB)
- Assignment: Common files (max 25MB)
```

### Database Connection
```
Error: "Failed to start: connect ETIMEDOUT"
Solution:
1. Check database connection in .env
2. Server will still run in development fallback mode
3. Features requiring DB will fail - fix DB connection
```

---

## Sample Postman Collection

Import this into Postman for easy testing:

```json
{
  "info": {
    "name": "LMS API - Phase 1",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Student Register",
          "request": {
            "method": "POST",
            "url": "http://localhost:5000/api/auth/student/register",
            "body": {
              "mode": "raw",
              "raw": "{\"fullName\": \"Student Name\", \"email\": \"student@test.com\", \"password\": \"pass123\"}"
            }
          }
        }
      ]
    }
  ]
}
```

---

## Feature Checklist

### Phase 1 Features (Complete)

- [x] Instructor CV upload (multipart file)
- [x] Admin approval workflow
- [x] Course creation by teacher
- [x] Course sections hierarchy
- [x] Lesson management with video URLs
- [x] Student progress tracking
- [x] Student note-taking with timestamps
- [x] Assignment creation and submission
- [x] Progress analytics for students
- [x] Enrollment analytics for teachers
- [x] File upload system (organized by type)
- [x] Database schema enhancements
- [x] API routes implementation

### Phase 2 Ready (Queued)

- [ ] Quiz system with question bank
- [ ] Certificate generation (auto-trigger)
- [ ] Rich text editor for notes
- [ ] Course reviews and ratings
- [ ] Notification system
- [ ] Mobile optimization
- [ ] Discussion forums
- [ ] Advanced search filters
- [ ] Gamification (badges/points)
- [ ] Course coupons/discounts

---

## API Documentation Summary

**Base URL:** `http://localhost:5000/api`

**Authentication:** JWT Bearer Token
```
Authorization: Bearer {token}
```

**Total Endpoints Implemented:** 40+

### Categories:
- Auth: 3 endpoints
- Courses: 8 endpoints
- Sections: 6 endpoints
- Lessons: 10 endpoints (including notes & progress)
- Assignments: 6 endpoints
- Teachers: 5 endpoints
- Admin: 6 endpoints
- Progress/Analytics: 4 endpoints
- Enrollment: 3 endpoints

---

**Status:** ✅ All Phase 1 features implemented and ready for testing

**Last Updated:** November 22, 2025

For detailed API documentation, see `IMPLEMENTATION_SUMMARY.md`
