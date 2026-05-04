#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:5000"
STUDENT_TOKEN=""
TEACHER_TOKEN=""
ADMIN_TOKEN=""

echo "=========================================="
echo "🧪 Testing All LMS APIs"
echo "=========================================="
echo ""

# Function to test API
test_api() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4
    local description=$5
    
    echo -n "Testing: $description... "
    
    if [ -n "$token" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token" \
            -d "$data" 2>&1)
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data" 2>&1)
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        echo "$body" | jq -C '.' 2>/dev/null || echo "$body"
    elif [ "$http_code" -ge 400 ] && [ "$http_code" -lt 500 ]; then
        echo -e "${YELLOW}⚠ CLIENT ERROR${NC} (HTTP $http_code)"
        echo "$body" | jq -C '.' 2>/dev/null || echo "$body"
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
        echo "$body" | jq -C '.' 2>/dev/null || echo "$body"
    fi
    echo ""
}

# 1. HEALTH CHECK
echo "=========================================="
echo "1. HEALTH CHECK"
echo "=========================================="
test_api "GET" "/api/health" "" "" "Health Check"

# 2. STUDENT AUTHENTICATION
echo "=========================================="
echo "2. STUDENT AUTHENTICATION"
echo "=========================================="

# Register Student
STUDENT_EMAIL="student_$(date +%s)@test.com"
test_api "POST" "/api/auth/student/register" \
    "{\"fullName\":\"Test Student\",\"email\":\"$STUDENT_EMAIL\",\"password\":\"password123\"}" \
    "" "Student Registration"

# Login Student
response=$(curl -s -X POST "$BASE_URL/api/auth/student/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$STUDENT_EMAIL\",\"password\":\"password123\"}")
STUDENT_TOKEN=$(echo $response | jq -r '.token')
echo "Student Token: ${STUDENT_TOKEN:0:50}..."
echo ""

# 3. TEACHER AUTHENTICATION
echo "=========================================="
echo "3. TEACHER AUTHENTICATION"
echo "=========================================="

# Register Teacher
TEACHER_EMAIL="teacher_$(date +%s)@test.com"
test_api "POST" "/api/auth/teacher/register" \
    "{\"fullName\":\"Test Teacher\",\"email\":\"$TEACHER_EMAIL\",\"password\":\"password123\",\"qualification\":\"PhD in Computer Science\"}" \
    "" "Teacher Registration"

# Login Teacher
response=$(curl -s -X POST "$BASE_URL/api/auth/teacher/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEACHER_EMAIL\",\"password\":\"password123\"}")
TEACHER_TOKEN=$(echo $response | jq -r '.token')
echo "Teacher Token: ${TEACHER_TOKEN:0:50}..."
echo ""

# 4. ADMIN AUTHENTICATION
echo "=========================================="
echo "4. ADMIN AUTHENTICATION"
echo "=========================================="

# Register Admin
ADMIN_EMAIL="admin_$(date +%s)@test.com"
test_api "POST" "/api/auth/admin/register" \
    "{\"fullName\":\"Test Admin\",\"email\":\"$ADMIN_EMAIL\",\"password\":\"password123\"}" \
    "" "Admin Registration"

# Login Admin
response=$(curl -s -X POST "$BASE_URL/api/auth/admin/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"password123\"}")
ADMIN_TOKEN=$(echo $response | jq -r '.token')
echo "Admin Token: ${ADMIN_TOKEN:0:50}..."
echo ""

# 5. COURSE MANAGEMENT
echo "=========================================="
echo "5. COURSE MANAGEMENT (Teacher)"
echo "=========================================="

# Create Course
response=$(curl -s -X POST "$BASE_URL/api/courses" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TEACHER_TOKEN" \
    -d '{"title":"Introduction to Programming","description":"Learn programming basics","category":"Programming","level":"Beginner"}')
COURSE_ID=$(echo $response | jq -r '.courseId // .course.courseId // .course.CourseID // empty')
echo "Created Course ID: $COURSE_ID"
echo ""

# Get All Courses
test_api "GET" "/api/courses" "" "" "Get All Courses"

# Get Course by ID
if [ -n "$COURSE_ID" ]; then
    test_api "GET" "/api/courses/$COURSE_ID" "" "" "Get Course by ID"
fi

# 6. SECTION MANAGEMENT
echo "=========================================="
echo "6. SECTION MANAGEMENT"
echo "=========================================="

if [ -n "$COURSE_ID" ]; then
    # Create Section
    response=$(curl -s -X POST "$BASE_URL/api/courses/$COURSE_ID/sections" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TEACHER_TOKEN" \
        -d '{"title":"Week 1: Introduction","description":"Getting started with programming","positionOrder":1}')
    SECTION_ID=$(echo $response | jq -r '.sectionId // .section.sectionId // .section.SectionID // empty')
    echo "Created Section ID: $SECTION_ID"
    echo ""
    
    # Get Sections for Course
    test_api "GET" "/api/courses/$COURSE_ID/sections" "" "$TEACHER_TOKEN" "Get Course Sections"
fi

# 7. LESSON MANAGEMENT
echo "=========================================="
echo "7. LESSON MANAGEMENT"
echo "=========================================="

if [ -n "$SECTION_ID" ]; then
    # Create Lesson
    response=$(curl -s -X POST "$BASE_URL/api/sections/$SECTION_ID/lessons" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TEACHER_TOKEN" \
        -d '{"title":"Introduction to Variables","contentType":"Video","notes":"Learn about variables","positionOrder":1}')
    LESSON_ID=$(echo $response | jq -r '.lessonId // .lesson.lessonId // .lesson.LessonID // empty')
    echo "Created Lesson ID: $LESSON_ID"
    echo ""
    
    # Get Lessons for Section
    test_api "GET" "/api/sections/$SECTION_ID/lessons" "" "$TEACHER_TOKEN" "Get Section Lessons"
fi

# 8. ENROLLMENT
echo "=========================================="
echo "8. ENROLLMENT"
echo "=========================================="

if [ -n "$COURSE_ID" ]; then
    # Enroll Student
    test_api "POST" "/api/enrollments" \
        "{\"courseId\":$COURSE_ID}" \
        "$STUDENT_TOKEN" "Enroll in Course"
    
    # Get Student Enrollments
    test_api "GET" "/api/enrollments" "" "$STUDENT_TOKEN" "Get Student Enrollments"
fi

# 9. QUIZ MANAGEMENT
echo "=========================================="
echo "9. QUIZ MANAGEMENT"
echo "=========================================="

if [ -n "$COURSE_ID" ]; then
    # Create Quiz
    response=$(curl -s -X POST "$BASE_URL/api/courses/$COURSE_ID/quizzes" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TEACHER_TOKEN" \
        -d '{"title":"Week 1 Quiz","totalMarks":10,"timeLimit":30}')
    QUIZ_ID=$(echo $response | jq -r '.quizId // .quiz.quizId // .quiz.QuizID // empty')
    echo "Created Quiz ID: $QUIZ_ID"
    echo ""
    
    # Get Quizzes for Course
    test_api "GET" "/api/courses/$COURSE_ID/quizzes" "" "$TEACHER_TOKEN" "Get Course Quizzes"
fi

# 10. ASSIGNMENT MANAGEMENT
echo "=========================================="
echo "10. ASSIGNMENT MANAGEMENT"
echo "=========================================="

if [ -n "$COURSE_ID" ]; then
    # Create Assignment
    response=$(curl -s -X POST "$BASE_URL/api/courses/$COURSE_ID/assignments" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TEACHER_TOKEN" \
        -d '{"title":"Week 1 Assignment","description":"Complete the exercises","dueDate":"2026-06-01","maxMarks":100}')
    ASSIGNMENT_ID=$(echo $response | jq -r '.assignmentId // .assignment.assignmentId // .assignment.AssignmentID // empty')
    echo "Created Assignment ID: $ASSIGNMENT_ID"
    echo ""
    
    # Get Assignments for Course
    test_api "GET" "/api/courses/$COURSE_ID/assignments" "" "$TEACHER_TOKEN" "Get Course Assignments"
fi

# 11. ADMIN OPERATIONS
echo "=========================================="
echo "11. ADMIN OPERATIONS"
echo "=========================================="

# Get All Students
test_api "GET" "/api/admin/students" "" "$ADMIN_TOKEN" "Get All Students"

# Get All Teachers
test_api "GET" "/api/admin/teachers" "" "$ADMIN_TOKEN" "Get All Teachers"

# Get Pending Teachers
test_api "GET" "/api/admin/teachers/pending" "" "$ADMIN_TOKEN" "Get Pending Teachers"

echo "=========================================="
echo "✅ API Testing Complete!"
echo "=========================================="
