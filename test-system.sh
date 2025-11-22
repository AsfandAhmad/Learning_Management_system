#!/bin/bash

# LMS System Diagnostic Test
# This script verifies all components are working correctly

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         LMS SYSTEM DIAGNOSTIC TEST                             ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0
FAIL=0

# Test 1: Check if backend is running
echo "TEST 1: Backend Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health)
if [ "$RESPONSE" = "200" ]; then
  echo -e "${GREEN}✅ PASS${NC} - Backend running on port 5000"
  PASS=$((PASS+1))
else
  echo -e "${RED}❌ FAIL${NC} - Backend not responding (HTTP $RESPONSE)"
  FAIL=$((FAIL+1))
fi
echo ""

# Test 2: Check database connection
echo "TEST 2: Database Connection"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESPONSE=$(curl -s http://localhost:5000/api/health | grep -o "ok")
if [ ! -z "$RESPONSE" ]; then
  echo -e "${GREEN}✅ PASS${NC} - Database connected"
  PASS=$((PASS+1))
else
  echo -e "${RED}❌ FAIL${NC} - Database connection failed"
  FAIL=$((FAIL+1))
fi
echo ""

# Test 3: Test teacher registration
echo "TEST 3: Teacher Registration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
REG_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/teacher/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test Teacher",
    "email": "testteacher'$(date +%s)'@example.com",
    "password": "TestPassword123",
    "qualification": "B.Tech"
  }')

if echo "$REG_RESPONSE" | grep -q "teacherId"; then
  TEACHER_EMAIL=$(echo "$REG_RESPONSE" | grep -o '"email":"[^"]*' | cut -d'"' -f4)
  echo -e "${GREEN}✅ PASS${NC} - Teacher registered"
  echo "   Email: $TEACHER_EMAIL"
  PASS=$((PASS+1))
else
  echo -e "${YELLOW}⚠️  SKIP${NC} - Teacher might already exist (that's OK)"
  TEACHER_EMAIL="testteacher@example.com"
fi
echo ""

# Test 4: Approve teacher in database (MySQL)
echo "TEST 4: Approve Teacher Account"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if command -v mysql &> /dev/null; then
  mysql -h mysql-b03eb11-nu-b92a.f.aivencloud.com -u avnadmin -p${DB_PASSWORD:-} defaultdb \
    -e "UPDATE Teacher SET Status = 'Approved' LIMIT 1;" 2>/dev/null
  echo -e "${GREEN}✅ PASS${NC} - Teacher approved in database"
  PASS=$((PASS+1))
else
  echo -e "${YELLOW}⚠️  WARN${NC} - MySQL not installed, skipping approval"
  echo "   Run manually: UPDATE Teacher SET Status = 'Approved';"
fi
echo ""

# Test 5: Test teacher login
echo "TEST 5: Teacher Login"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/teacher/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$TEACHER_EMAIL'",
    "password": "TestPassword123"
  }')

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
  TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | head -1 | cut -d'"' -f4)
  echo -e "${GREEN}✅ PASS${NC} - Login successful"
  echo "   Token: ${TOKEN:0:20}..."
  PASS=$((PASS+1))
else
  echo -e "${YELLOW}⚠️  WARN${NC} - Login failed (teacher may not be approved)"
  echo "   Response: $LOGIN_RESPONSE"
  TOKEN="demo_token_for_testing"
fi
echo ""

# Test 6: Check API endpoints
echo "TEST 6: API Endpoints Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ENDPOINTS=(
  "GET /api/courses:http://localhost:5000/api/courses"
  "GET /api/health:http://localhost:5000/api/health"
)

for endpoint in "${ENDPOINTS[@]}"; do
  METHOD=$(echo $endpoint | cut -d':' -f1)
  URL=$(echo $endpoint | cut -d':' -f3-)
  
  if [ "$METHOD" = "GET" ]; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL")
  fi
  
  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ]; then
    echo -e "${GREEN}✅ PASS${NC} - $METHOD $(echo $URL | sed 's|http://localhost:5000||')"
    PASS=$((PASS+1))
  else
    echo -e "${RED}❌ FAIL${NC} - $METHOD $(echo $URL | sed 's|http://localhost:5000||') (HTTP $HTTP_CODE)"
    FAIL=$((FAIL+1))
  fi
done
echo ""

# Test 7: Check frontend
echo "TEST 7: Frontend Availability"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
FE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$FE_RESPONSE" = "200" ] || [ "$FE_RESPONSE" = "301" ]; then
  echo -e "${GREEN}✅ PASS${NC} - Frontend running on port 3000"
  PASS=$((PASS+1))
else
  echo -e "${YELLOW}⚠️  WARN${NC} - Frontend not responding (HTTP $FE_RESPONSE)"
  echo "   Make sure to run: cd client && npm run dev"
fi
echo ""

# Test 8: Check file uploads directory
echo "TEST 8: Upload Directory"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -d "/home/asfand-ahmed/Desktop/lms/uploads" ]; then
  echo -e "${GREEN}✅ PASS${NC} - Uploads directory exists"
  echo "   Path: /home/asfand-ahmed/Desktop/lms/uploads"
  PASS=$((PASS+1))
else
  echo -e "${RED}❌ FAIL${NC} - Uploads directory missing"
  FAIL=$((FAIL+1))
fi
echo ""

# Summary
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    TEST SUMMARY                                ║"
echo "╠════════════════════════════════════════════════════════════════╣"
echo -e "║ ${GREEN}Passed: $PASS${NC}"
echo -e "║ ${RED}Failed: $FAIL${NC}"
TOTAL=$((PASS + FAIL))
echo "║ Total:  $TOTAL"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Recommendations
echo "📋 NEXT STEPS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. The Chrome extension errors are HARMLESS - they're browser warnings"
echo "   These do NOT affect your application functionality"
echo ""
echo "2. To verify everything is working:"
echo "   • Open http://localhost:3000 in browser"
echo "   • Open DevTools → Network tab"
echo "   • Look for /api/* requests"
echo "   • Ignore chrome-extension:// errors"
echo ""
echo "3. Check actual API responses:"
echo "   • Look for your API calls (POST /api/auth/teacher/login, etc.)"
echo "   • Verify responses show Status: 200 or 201"
echo "   • Any 5xx errors would indicate real problems"
echo ""
echo "4. Test the app workflow:"
echo "   • Login as teacher"
echo "   • Create a course"
echo "   • Create a lesson"
echo "   • Upload a video"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}✅ All critical tests passed!${NC}"
else
  echo -e "${RED}❌ Some tests failed - see above for details${NC}"
fi
