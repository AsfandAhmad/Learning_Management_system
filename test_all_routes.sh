#!/bin/bash
# Comprehensive API Test Suite

echo "================================================"
echo "LMS API - COMPREHENSIVE TEST SUITE"
echo "================================================"
echo ""
echo "Test Date: $(date)"
echo "Server: http://localhost:5000"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Test function
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local expected_status=$4
    local data=$5
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$endpoint" -H "Content-Type: application/json" -d "$data")
    fi
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [[ "$status_code" == "$expected_status"* ]]; then
        echo -e "${GREEN}✓${NC} $method $endpoint"
        echo "  Description: $description"
        echo "  Status: $status_code (Expected: $expected_status)"
        PASSED=$((PASSED+1))
    else
        echo -e "${RED}✗${NC} $method $endpoint"
        echo "  Description: $description"
        echo "  Status: $status_code (Expected: $expected_status)"
        echo "  Response: $body"
        FAILED=$((FAILED+1))
    fi
    echo ""
}

echo "================================================================"
echo "1. HEALTH & SYSTEM ENDPOINTS"
echo "================================================================"
test_endpoint "GET" "http://localhost:5000/api/health" "Health check" "200"

echo "================================================================"
echo "2. AUTHENTICATION ENDPOINTS"
echo "================================================================"
test_endpoint "POST" "http://localhost:5000/api/auth/student/login" "Student login (no credentials)" "400"
test_endpoint "POST" "http://localhost:5000/api/auth/teacher/login" "Teacher login (no credentials)" "400"
test_endpoint "POST" "http://localhost:5000/api/auth/admin/login" "Admin login (no credentials)" "400"

echo "================================================================"
echo "3. COURSES ENDPOINTS"
echo "================================================================"
test_endpoint "GET" "http://localhost:5000/api/courses" "List all courses" "200"

echo "================================================================"
echo "4. STUDENT ENDPOINTS"
echo "================================================================"
test_endpoint "GET" "http://localhost:5000/api/student/profile" "Get student profile (no auth)" "401"
test_endpoint "GET" "http://localhost:5000/api/student/courses" "Get student courses (no auth)" "401"

echo "================================================================"
echo "5. TEACHER ENDPOINTS"
echo "================================================================"
test_endpoint "GET" "http://localhost:5000/api/teacher/profile" "Get teacher profile (no auth)" "401"
test_endpoint "GET" "http://localhost:5000/api/teacher/courses" "Get teacher courses (no auth)" "401"

echo "================================================================"
echo "6. ADMIN ENDPOINTS"
echo "================================================================"
test_endpoint "GET" "http://localhost:5000/api/admin/teachers" "Get all teachers (no auth)" "401"

echo "================================================================"
echo "7. QUIZ ENDPOINTS"
echo "================================================================"
test_endpoint "GET" "http://localhost:5000/api/courses/1/quizzes" "Get quizzes for course 1" "200"

echo "================================================================"
echo "8. SECTIONS ENDPOINTS"
echo "================================================================"
test_endpoint "GET" "http://localhost:5000/api/courses/1/sections" "Get sections for course 1" "200"

echo "================================================================"
echo "9. ACTIVITY LOG ENDPOINTS (FIXED)"
echo "================================================================"
test_endpoint "GET" "http://localhost:5000/api/activities/student/activities" "Get student activities (no auth)" "401"
test_endpoint "GET" "http://localhost:5000/api/activities/student/activity-summary" "Get activity summary (no auth)" "401"

echo "================================================================"
echo "10. ENROLLMENT ENDPOINTS"
echo "================================================================"
test_endpoint "GET" "http://localhost:5000/api/enrollments" "Get enrollments (no auth)" "401"

echo "================================================================"
echo "11. PROGRESS ENDPOINTS"
echo "================================================================"
test_endpoint "GET" "http://localhost:5000/api/progress/course/1" "Get course progress (no auth)" "401"

echo "================================================================"
echo "12. STATIC FILES & UPLOADS"
echo "================================================================"
test_endpoint "GET" "http://localhost:5000/uploads/test.txt" "Serve static file (doesn't exist)" "404"

echo ""
echo "================================================"
echo "TEST SUMMARY"
echo "================================================"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo "Total: $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
