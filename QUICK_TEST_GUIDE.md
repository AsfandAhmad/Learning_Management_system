# Quick Start - Test Course Hierarchy & Admin CV Viewing

## 🚀 Start Both Servers

### Terminal 1 - Backend
```powershell
cd 'C:\Users\T L S\OneDrive\Pictures\Documents\DBS\Learning_Management_system\server'
npm run dev
```
✅ Backend running on `http://localhost:5000`

### Terminal 2 - Frontend
```powershell
cd 'C:\Users\T L S\OneDrive\Pictures\Documents\DBS\Learning_Management_system\client'
npm run dev
```
✅ Frontend running on `http://localhost:5173`

---

## 📋 Test Scenario 1: Teacher Registration with CV Upload

### Steps:
1. **Open Browser:** `http://localhost:5173/`
2. **Click:** "Register as Instructor"
3. **Fill Form:**
   - Full Name: `Dr. Jane Smith`
   - Email: `jane.smith@university.edu`
   - Qualification: `PhD in Computer Science`
   - Password: `teacher123`
   - Confirm Password: `teacher123`

4. **Upload CV:**
   - Click the CV upload area
   - Select a PDF or DOC file from your computer
   - File should be < 5MB
   - See file name appear in preview

5. **Submit:**
   - Check Terms checkbox
   - Click "Create Account"
   - Wait for registration to complete
   - Should redirect to login page

### ✅ Expected Results:
- Registration succeeds
- CV file uploaded to server
- Can login as teacher (pending approval)

---

## 👨‍💼 Test Scenario 2: Admin Reviews & Approves Teacher

### Steps:
1. **Login as Admin:**
   - URL: `http://localhost:5173/admin/login`
   - Email: `admin@example.com`
   - Password: `adminpass`

2. **Go to Admin Dashboard**
   - Click on "Pending Approval" tab
   - Should see the teacher you just registered

3. **Review Teacher:**
   - See teacher name, email, qualification
   - Click **"View CV"** button
   - CV should open in a modal

4. **In CV Modal:**
   - View PDF preview
   - Click **"Download CV"** to save locally
   - Review teacher's CV

5. **Approve Teacher:**
   - Close CV modal
   - Click **"Approve"** button
   - Teacher status changes to "Approved"

6. **View All Teachers:**
   - Click "All Teachers" tab
   - Approved teacher appears in list

### ✅ Expected Results:
- Admin can view pending teachers
- CV displays in iframe modal
- CV can be downloaded
- Approve button successfully approves teacher
- Approved teacher moves to "All Teachers" tab

---

## 🎓 Test Scenario 3: Teacher Creates Course with Sections & Lessons

### Steps:
1. **Login as Teacher (Approved):**
   - URL: `http://localhost:5173/instructor/login`
   - Email: `jane.smith@university.edu`
   - Password: `teacher123`

2. **Go to Teacher Dashboard**
   - Click "Instructor Dashboard" or go directly
   - You'll see dashboard with stats

3. **Create Course:**
   - Click **"Create Course"** button
   - Fill in:
     - **Title:** `Introduction to JavaScript`
     - **Description:** `Learn JavaScript from basics to advanced concepts`
     - **Level:** `Beginner`
     - **Prerequisites:** `HTML, CSS basics`
     - **Learning Outcomes:** `Understand variables and functions, Master async programming, Learn DOM manipulation`
     - **Estimated Hours:** `40`
   - Click "Create Course"

4. **View Course:**
   - Course appears in dashboard
   - You see course card with gradient header
   - Shows title, description, level, hours

5. **Add Section:**
   - Click **"+ Section"** button on course
   - Fill form:
     - **Section Title:** `JavaScript Fundamentals`
     - **Description:** `Learn JavaScript basics and syntax`
   - Click "Create Section"

6. **View Section:**
   - Click **"View Sections"** button (or "Expand")
   - Section appears with "JavaScript Fundamentals" title
   - Shows description
   - Shows "No lessons" message

7. **Add Lesson:**
   - Click **"+ Create First Lesson"** in section
   - Fill form:
     - **Title:** `Variables and Data Types`
     - **Lesson Type:** `Video`
     - **Video URL:** `https://www.youtube.com/embed/dQw4w9WgXcQ`
     - **Duration:** `15`
     - **Lesson Notes:** `Variables are containers for storing data. There are 3 ways to declare: var, let, const`
     - **Content:** `In this lesson we cover...`
   - Click "Create Lesson"

8. **View Complete Hierarchy:**
   - Go back to "View Sections"
   - See lesson under section with:
     - ▶ Video indicator (red icon)
     - Lesson title
     - Duration: 15 min
     - ✓ Has Notes
   - Click "+ Add Lesson to Section" to add more lessons

### ✅ Expected Results:
- Course created successfully
- Section added to course
- Lesson added to section
- Full hierarchy visible:
  ```
  Course: Introduction to JavaScript
  └─ Section: JavaScript Fundamentals
     └─ Lesson: Variables and Data Types
        ├─ Type: Video
        ├─ Duration: 15 minutes
        └─ Has Notes
  ```

---

## 🎯 Test Scenario 4: View Course Structure

### Steps:
1. **From Teacher Dashboard:**
   - Find your course
   - Click **"View Sections"** to expand/collapse

2. **Expand Course:**
   - See all sections listed
   - Each section is collapsible/expandable

3. **Expand Section:**
   - Click on a section to see lessons
   - All lessons display with:
     - Icon (video/text)
     - Title
     - Metadata (duration, notes status)
     - Edit button

4. **Add More Lessons:**
   - Click "Add Lesson to Section" 
   - Create another lesson with different type:
     - **Type:** `Text`
     - No video URL needed
     - Add notes and content

### ✅ Expected Results:
- Expandable/collapsible course tree
- Sections show lessons underneath
- Different lesson types display different icons
- Can add multiple lessons per section

---

## 📊 Admin Dashboard Stats

### Should Display:
- **Pending Approvals:** Count of pending teachers (decreases when approved)
- **Approved Teachers:** Count increases when you approve teachers
- **Total Courses:** Shows courses created by all teachers
- **Rejected:** Count of rejected applications

---

## 🔧 Troubleshooting

### Issue: CV doesn't display in modal
**Solution:**
- Check if file was uploaded to `/server/uploads/cv/` directory
- Browser console may show CORS errors
- Try downloading instead of viewing

### Issue: Section/Lesson not appearing
**Solution:**
- Refresh page to reload data
- Check browser console for errors
- Verify backend received the request (check server logs)

### Issue: File upload fails
**Solution:**
- Ensure file is PDF, DOC, or DOCX
- Check file size (< 5MB for CV)
- Check network connection

### Issue: Course not showing
**Solution:**
- Wait for page refresh
- Check if course was actually created (look for success message)
- Try logging out and back in

---

## 📱 Page URLs

| Feature | URL |
|---------|-----|
| Home Page | `http://localhost:5173/` |
| Teacher Register | `http://localhost:5173/instructor/register` |
| Teacher Login | `http://localhost:5173/instructor/login` |
| Teacher Dashboard | `http://localhost:5173/teacher/dashboard` |
| Admin Login | `http://localhost:5173/admin/login` |
| Admin Dashboard | `http://localhost:5173/admin/dashboard` |
| Student Register | `http://localhost:5173/student/register` |
| Student Dashboard | `http://localhost:5173/student/dashboard` |

---

## 🎯 Key Features to Test

### ✅ Admin Features:
- [ ] View pending teacher applications
- [ ] Click "View CV" and see PDF preview
- [ ] Download teacher CV
- [ ] Approve teacher
- [ ] Reject teacher (moves to rejected tab)
- [ ] View all teachers (pending/approved/rejected)
- [ ] View dashboard statistics

### ✅ Teacher Features:
- [ ] Register with CV upload
- [ ] Wait for admin approval
- [ ] Login to dashboard
- [ ] Create course with full details
- [ ] Add section to course
- [ ] Add lesson with video URL
- [ ] Add lesson with duration
- [ ] Add lesson with notes
- [ ] View complete course hierarchy
- [ ] Expand/collapse sections
- [ ] See lesson metadata (video icon, duration, notes indicator)

### ✅ UI Features:
- [ ] Gradient course headers
- [ ] Expandable arrows animation
- [ ] Icons for lesson types (video, text)
- [ ] Badges for course level
- [ ] Loading spinners
- [ ] Empty state messages
- [ ] Success notifications
- [ ] Error messages

---

## 📝 Database Check

To verify data in MySQL:

```sql
-- Check teachers
SELECT TeacherID, FullName, Email, Status FROM Teacher;

-- Check courses
SELECT CourseID, Title, InstructorID FROM Course;

-- Check sections
SELECT SectionID, Title, CourseID FROM Section;

-- Check lessons
SELECT LessonID, Title, SectionID, VideoURL FROM Lesson;

-- Check CV uploads
SELECT * FROM Teacher WHERE Bio IS NOT NULL;
```

---

## 🚀 Next Steps

After testing this:
1. Create multiple courses with different structures
2. Add sections with 3-4 lessons each
3. Test with student enrollment (Phase 2)
4. Test progress tracking (Phase 2)
5. Test quizzes and assignments (Phase 2)

---

**Status:** ✅ Ready for Testing  
**Last Updated:** November 22, 2025
