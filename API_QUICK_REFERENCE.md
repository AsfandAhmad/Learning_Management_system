# LMS API Quick Reference Guide

## Base URL
```
http://localhost:5000/api
```

---

## 🔐 Authentication

### Register Student
```bash
curl -X POST http://localhost:5000/api/auth/student/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login Student
```bash
curl -X POST http://localhost:5000/api/auth/student/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Register Teacher
```bash
curl -X POST http://localhost:5000/api/auth/teacher/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Jane Smith",
    "email": "jane@example.com",
    "password": "password123",
    "qualification": "PhD in Computer Science"
  }'
```

### Login Teacher
```bash
curl -X POST http://localhost:5000/api/auth/teacher/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "password123"
  }'
```

---

## 📚 Course Management

### Get All Courses
```bash
curl http://localhost:5000/api/courses
```

### Get Course by ID
```bash
curl http://localhost:5000/api/courses/1
```

### Create Course (Teacher)
```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN" \
  -d '{
    "title": "Introduction to Python",
    "description": "Learn Python from scratch",
    "category": "Programming",
    "level": "Beginner"
  }'
```

### Update Course (Teacher)
```bash
curl -X PUT http://localhost:5000/api/courses/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN" \
  -d '{
    "title": "Advanced Python Programming",
    "status": "Published"
  }'
```

---

## 📖 Section Management

### Get Course Sections
```bash
curl http://localhost:5000/api/courses/1/sections \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Section (Teacher)
```bash
curl -X POST http://localhost:5000/api/courses/1/sections \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN" \
  -d '{
    "title": "Week 1: Introduction",
    "description": "Getting started",
    "positionOrder": 1
  }'
```

---

## 📝 Lesson Management

### Get Section Lessons
```bash
curl http://localhost:5000/api/sections/1/lessons \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Lesson (Teacher)
```bash
curl -X POST http://localhost:5000/api/sections/1/lessons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN" \
  -d '{
    "title": "Introduction to Variables",
    "contentType": "Video",
    "notes": "Learn about variables in Python",
    "positionOrder": 1
  }'
```

---

## 🎓 Enrollment

### Enroll in Course (Student)
```bash
curl -X POST http://localhost:5000/api/enrollments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
  -d '{
    "courseId": 1
  }'
```

### Get My Enrollments (Student)
```bash
curl http://localhost:5000/api/enrollments \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

---

## 📝 Quiz Management

### Get Course Quizzes
```bash
curl http://localhost:5000/api/courses/1/quizzes \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Quiz (Teacher)
```bash
curl -X POST http://localhost:5000/api/courses/1/quizzes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN" \
  -d '{
    "title": "Week 1 Quiz",
    "totalMarks": 10,
    "timeLimit": 30
  }'
```

---

## 📋 Assignment Management

### Get Course Assignments
```bash
curl http://localhost:5000/api/courses/1/assignments \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Assignment (Teacher)
```bash
curl -X POST http://localhost:5000/api/courses/1/assignments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN" \
  -d '{
    "Title": "Week 1 Assignment",
    "Description": "Complete the exercises",
    "DueDate": "2026-06-01",
    "MaxMarks": 100
  }'
```

---

## 👨‍💼 Admin Operations

### Get All Students
```bash
curl http://localhost:5000/api/admin/students \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Get All Teachers
```bash
curl http://localhost:5000/api/admin/teachers \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Get Pending Teachers
```bash
curl http://localhost:5000/api/admin/teachers/pending \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Approve Teacher
```bash
curl -X PATCH http://localhost:5000/api/admin/teachers/1/approve \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Block Student
```bash
curl -X PATCH http://localhost:5000/api/admin/students/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "status": "Blocked"
  }'
```

---

## 🔍 Common Patterns

### Authentication Flow
1. Register user → Get token
2. Use token in Authorization header for all protected routes
3. Token expires after 7 days

### Course Creation Flow (Teacher)
1. Login as teacher
2. Create course (Draft status)
3. Add sections to course
4. Add lessons to sections
5. Add quizzes/assignments
6. Update course status to "Published"

### Student Learning Flow
1. Login as student
2. Browse courses
3. Enroll in course
4. View course content
5. Complete lessons
6. Submit assignments
7. Take quizzes

---

## 💡 Tips

1. **Always include Authorization header** for protected routes
2. **Use consistent field names**: Both camelCase and PascalCase are supported
3. **Check HTTP status codes** for error handling
4. **Course must be Published** for students to enroll (except in dev mode)
5. **Teachers are auto-approved** in development mode

---

## 🐛 Debugging

### Check if server is running
```bash
curl http://localhost:5000/api/health
```

### View server logs
```bash
cd server
npm start
# Watch console output
```

### Test all APIs
```bash
./test-all-apis.sh
```

---

## 📱 Frontend Integration

### Using Axios (React)
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Register student
const register = async (data) => {
  const response = await api.post('/auth/student/register', data);
  return response.data;
};

// Get courses
const getCourses = async () => {
  const response = await api.get('/courses');
  return response.data;
};
```

---

## 🔄 Database Reset

### Reinitialize database
```bash
cd server
npm run db:init
```

This will:
- Drop all existing tables
- Create fresh tables with proper schema
- Reset all data

---

**Last Updated:** May 3, 2026
