# LMS Testing Guide

## 🧪 Complete Testing Instructions

### Prerequisites
- Access to deployed application: https://learning-management-system-wyz7.vercel.app
- Test accounts created
- Database migrations applied

---

## 1️⃣ Instructor Testing Flow

### Step 1: Login as Instructor
1. Navigate to: https://learning-management-system-wyz7.vercel.app/instructor/login
2. Use credentials: `k230698@nu.edu.pk` / `Asfand12345`
3. Verify: Dashboard loads with existing courses

### Step 2: Create a New Course
1. Click "Create New Course" button
2. Fill in:
   - Title: "Test Course - [Your Name]"
   - Description: "This is a test course for verification"
   - Category: "Technology"
   - Level: "Beginner"
3. Click "Create Course"
4. Verify: Course appears in course list

### Step 3: Add Section to Course
1. Click on the newly created course
2. Click "Add Section" button
3. Fill in:
   - Title: "Module 1 - Introduction"
   - Description: "Getting started with the basics"
4. Click "Add Section"
5. Verify: Section appears under the course

### Step 4: Add Lesson to Section
1. Click "Add Lesson to Section" button
2. Fill in:
   - Lesson Title: "Lesson 1 - Overview"
   - Content: "This is the lesson content"
   - Lesson Type: Select "Video" or "Reading"
3. Click "Add Lesson"
4. Verify: Lesson appears in the section

### Step 5: Create Quiz with Questions
1. Click "+ Quiz" button on the course card
2. Fill in quiz details:
   - Title: "Module 1 Quiz"
   - Description: "Test your knowledge"
   - Total Marks: 10
   - Time Limit: 30 (minutes)
   - Passing Score: 6
3. Click "Next" or "Save Quiz"
4. **Add Questions:**
   - Click "Add Question" button
   - Question Text: "What is the capital of France?"
   - Option A: "London"
   - Option B: "Paris"
   - Option C: "Berlin"
   - Option D: "Madrid"
   - Correct Answer: Select "B"
   - Marks: 5
   - Click "Add Question"
5. Add another question (repeat step 4)
6. Click "Save Quiz"
7. Verify: Quiz appears in the quiz list with question count

### Step 6: Create Assignment
1. Click "+ Assignment" button on the course card
2. Fill in:
   - Title: "Assignment 1 - Research Paper"
   - Description: "Write a 500-word essay"
   - Due Date: Select a future date
   - Max Marks: 20
   - Submission Type: "File Upload"
   - Allow Late Submission: Check/Uncheck
   - Max Attempts: 2
3. Upload a resource file (optional)
4. Click "Create Assignment"
5. Verify: Assignment appears in the assignment list

### Step 7: Edit Quiz
1. Find the quiz you created
2. Click "Edit" button
3. Modify the title or add/remove questions
4. Click "Save Changes"
5. Verify: Changes are reflected immediately

### Step 8: Edit Assignment
1. Find the assignment you created
2. Click "Edit" button
3. Modify the due date or description
4. Click "Save Changes"
5. Verify: Changes are reflected immediately

### Step 9: Delete Quiz (Optional)
1. Click "Delete" button on a quiz
2. Confirm deletion
3. Verify: Quiz is removed from the list

### Step 10: Delete Assignment (Optional)
1. Click "Delete" button on an assignment
2. Confirm deletion
3. Verify: Assignment is removed from the list

---

## 2️⃣ Student Testing Flow

### Step 1: Register/Login as Student
1. Navigate to: https://learning-management-system-wyz7.vercel.app/student/register
2. Create a new account or login with existing credentials
3. Verify: Student dashboard loads

### Step 2: Browse and Enroll in Course
1. Click "All Courses" tab
2. Find the test course created by instructor
3. Click "Enroll" button
4. Verify: Course appears in "My Courses" tab

### Step 3: View Course Details
1. Click on the enrolled course
2. Verify you can see:
   - Course overview
   - Lessons tab
   - Quizzes tab
   - Assignments tab

### Step 4: Take a Quiz
1. Click on "Quizzes" tab
2. Find the quiz created by instructor
3. Click "Take Quiz" button
4. Verify:
   - Timer starts counting down
   - Questions are displayed with options
   - Can select answers
5. Select answers for all questions
6. Click "Submit Quiz"
7. Verify:
   - Score is calculated
   - Correct/incorrect answers are shown
   - Can see which questions were right/wrong

### Step 5: Submit Assignment
1. Click on "Assignments" tab
2. Find the assignment created by instructor
3. Click "Submit Assignment" button
4. Verify submission form shows:
   - Assignment details
   - Due date
   - Teacher resources (if any)
5. Upload a file or enter text/link
6. Click "Submit Assignment"
7. Verify:
   - Success message appears
   - Submission appears in submission history

### Step 6: View Assignment Feedback (After Grading)
1. Return to the assignment submission page
2. Verify you can see:
   - Previous submissions
   - Grades (if graded by instructor)
   - Feedback (if provided)

---

## 3️⃣ Admin Testing Flow

### Step 1: Login as Admin
1. Navigate to admin login page
2. Use admin credentials
3. Verify: Admin dashboard loads

### Step 2: Approve Teacher
1. Navigate to pending teachers list
2. Find the test instructor
3. Click "Approve" button
4. Verify: Teacher status changes to "Approved"

### Step 3: Approve Course
1. Navigate to pending courses list
2. Find the test course
3. Click "Approve" button
4. Verify: Course status changes to "Published"

---

## 4️⃣ API Testing (Using Postman or cURL)

### Test Quiz Creation
```bash
POST https://learningmanagementsystem-production-76e0.up.railway.app/api/courses/1/quizzes
Headers:
  Authorization: Bearer <instructor_token>
  Content-Type: application/json
Body:
{
  "Title": "API Test Quiz",
  "Description": "Testing via API",
  "TotalMarks": 10,
  "TimeLimit": 30,
  "PassingMarks": 6
}
```

### Test Question Creation
```bash
POST https://learningmanagementsystem-production-76e0.up.railway.app/api/quizzes/1/questions
Headers:
  Authorization: Bearer <instructor_token>
  Content-Type: application/json
Body:
{
  "QuestionText": "What is 2+2?",
  "OptionA": "3",
  "OptionB": "4",
  "OptionC": "5",
  "OptionD": "6",
  "CorrectOption": "B",
  "Marks": 5
}
```

### Test Quiz Attempt
```bash
POST https://learningmanagementsystem-production-76e0.up.railway.app/api/quizzes/1/attempt
Headers:
  Authorization: Bearer <student_token>
  Content-Type: application/json
Body:
{
  "answers": [
    {"QuestionID": 1, "SelectedOption": "B"},
    {"QuestionID": 2, "SelectedOption": "A"}
  ]
}
```

---

## 5️⃣ Database Verification

### Check Quiz Questions
```sql
SELECT q.QuizID, q.Title, COUNT(qq.QuestionID) as QuestionCount
FROM Quiz q
LEFT JOIN QuizQuestions qq ON q.QuizID = qq.QuizID
GROUP BY q.QuizID;
```

### Check Quiz Attempts
```sql
SELECT qa.AttemptID, s.FullName, q.Title, qa.Score, qa.SubmittedAt
FROM QuizAttempt qa
JOIN Student s ON qa.StudentID = s.StudentID
JOIN Quiz q ON qa.QuizID = q.QuizID
ORDER BY qa.SubmittedAt DESC;
```

### Check Assignment Submissions
```sql
SELECT asub.SubmissionID, s.FullName, a.Title, asub.MarksObtained, asub.SubmittedAt
FROM AssignmentSubmission asub
JOIN Student s ON asub.StudentID = s.StudentID
JOIN Assignment a ON asub.AssignmentID = a.AssignmentID
ORDER BY asub.SubmittedAt DESC;
```

---

## 6️⃣ Error Scenarios to Test

### Test Invalid Quiz Submission
1. Try to submit quiz without answering all questions
2. Try to submit quiz after time expires
3. Try to take quiz without enrollment

### Test Invalid Assignment Submission
1. Try to submit assignment after due date (if late submission disabled)
2. Try to submit assignment without file (if file required)
3. Try to exceed max attempts

### Test Permission Errors
1. Try to access instructor dashboard as student
2. Try to create quiz without instructor role
3. Try to grade assignment without instructor role

---

## 7️⃣ Performance Testing

### Load Testing
1. Create 10 courses
2. Add 5 sections per course
3. Add 10 lessons per section
4. Create 5 quizzes per course with 10 questions each
5. Verify: System remains responsive

### Concurrent Users
1. Have 5 students take the same quiz simultaneously
2. Verify: All submissions are recorded correctly
3. Check: No race conditions or data corruption

---

## 8️⃣ Browser Compatibility

Test on:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## 9️⃣ Expected Results Summary

| Test Case | Expected Result | Status |
|-----------|----------------|--------|
| Instructor can create quiz | Quiz created with questions | ✅ |
| Instructor can edit quiz | Changes saved and reflected | ✅ |
| Instructor can delete quiz | Quiz removed from list | ✅ |
| Instructor can create assignment | Assignment created with resources | ✅ |
| Student can take quiz | Quiz submitted and graded | ✅ |
| Student can submit assignment | Submission recorded | ✅ |
| Timer works correctly | Countdown and auto-submit | ✅ |
| File upload works | Files uploaded successfully | ✅ |
| Auto-refresh works | Lists update without page reload | ✅ |

---

## 🐛 Known Issues & Workarounds

### Issue 1: Quiz not showing questions
**Workaround:** Ensure questions are added after quiz creation

### Issue 2: File upload fails
**Workaround:** Check file size limit (max 10MB)

### Issue 3: Timer not starting
**Workaround:** Refresh the page and try again

---

## 📞 Reporting Issues

If you encounter any issues during testing:

1. **Note the following:**
   - URL where error occurred
   - User role (student/instructor/admin)
   - Steps to reproduce
   - Error message (if any)
   - Browser and version

2. **Check browser console:**
   - Press F12
   - Go to Console tab
   - Copy any error messages

3. **Report via:**
   - GitHub Issues
   - Email: k230698@nu.edu.pk

---

**Testing Completed By:** _________________  
**Date:** _________________  
**Overall Status:** ✅ Pass / ❌ Fail  
**Notes:** _________________
