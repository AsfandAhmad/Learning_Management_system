# Client UI Updates - Course Hierarchy & Admin Features

## Overview
Enhanced the client-side interface to support the complete course/section/lesson hierarchy with CV viewing capabilities for admins.

---

## 1. **Admin Dashboard - CV Viewing Feature**

### File: `AdminDashboard.jsx`

#### **Changes:**
- Added `Modal` component import
- Added `teacherAPI` to imports for CV retrieval
- Added CV viewing functionality to `PendingTeachersTab` component

#### **New Features:**
- **View CV Button** - Each pending teacher card now has a "View CV" button
- **CV Modal** - Displays the teacher's CV in an iframe
- **Download Option** - Admin can download the CV directly
- **File Preview** - Shows CV preview before download

#### **Implementation:**
```jsx
const handleViewCV = async (teacher) => {
  setSelectedTeacher(teacher);
  setCvLoading(true);
  try {
    const response = await teacherAPI.getCV(teacher.TeacherID);
    setCvUrl(`http://localhost:5000/uploads/cv/${teacher.TeacherID}.pdf`);
    setShowCVModal(true);
  } catch (error) {
    console.error('Error loading CV:', error);
    alert('Failed to load CV');
  } finally {
    setCvLoading(false);
  }
};
```

#### **Admin Workflow:**
1. Login as Admin
2. Go to "Pending Approval" tab
3. Click "View CV" on any teacher
4. Review CV in modal
5. Download if needed
6. Approve or Reject teacher

---

## 2. **Teacher Dashboard - Course Hierarchy**

### File: `TeacherDashboard.jsx`

#### **Changes:**
- Replaced grid layout with hierarchical course view
- Added `CourseHierarchy` component for section/lesson visualization
- Enhanced course cards with gradient headers
- Added expandable section/lesson structure

#### **New Course View:**
```
┌─ Course Card (Full Width)
│  ├─ Gradient Header (Title, Description, Level, Duration)
│  ├─ Action Buttons (Edit, + Section)
│  ├─ Course Sections (Expandable)
│  │  ├─ Section 1
│  │  │  ├─ Lesson 1 (Video - 30 min, Has Notes)
│  │  │  ├─ Lesson 2 (Text Content)
│  │  │  └─ + Add Lesson to Section
│  │  └─ Section 2
│  │     ├─ Lesson 1
│  │     └─ + Add Lesson to Section
```

#### **New Features:**

1. **Course Header Card**
   - Displays course title, description, level, estimated hours
   - Gradient background (blue to indigo)
   - "Edit" and "+ Section" buttons
   - Expandable sections toggle

2. **CourseHierarchy Component**
   - Shows all sections under a course
   - Expandable sections with collapse/expand animation
   - Shows section description
   - Lists lessons with metadata

3. **Lesson Display**
   - Video indicator with icon (red for video)
   - Text content indicator (blue)
   - Lesson duration display
   - "Has Notes" indicator
   - Edit button per lesson

4. **Section Actions**
   - View all lessons in section
   - Add lesson to section button
   - Shows lesson count

#### **Data Hierarchy Visualization:**
```
Course Details
├── Prerequisites
├── Learning Outcomes
├── Estimated Hours
└── Difficulty Level
    │
    ├── Section 1: HTML Basics
    │   ├── Lesson 1: HTML Introduction
    │   │   ├── Video URL: youtube.com/embed/...
    │   │   ├── Duration: 15 minutes
    │   │   ├── Notes: Key concepts about HTML tags
    │   │   └── Type: Video
    │   └── Lesson 2: HTML Tags Deep Dive
    │       ├── Duration: 20 minutes
    │       └── Type: Interactive
    │
    └── Section 2: CSS Basics
        ├── Lesson 1: CSS Selectors
        │   ├── Notes: Learn how CSS selectors work
        │   └── Duration: 25 minutes
        └── Lesson 2: CSS Layout
```

---

## 3. **Enhanced Instructor Registration**

### File: `InstructorRegister.jsx`

#### **Changes:**
- Added CV file upload during registration
- Added file validation (PDF, DOC, DOCX only)
- Added file size validation (5MB max)
- Integrated with `teacherAPI.uploadCV()`

#### **New Features:**

1. **CV Upload Field**
   - File input with drag-and-drop styled UI
   - Supported formats: PDF, DOC, DOCX
   - Maximum file size: 5MB
   - Visual feedback with file name preview

2. **Registration Flow with CV**
   ```
   1. Fill form (Name, Email, Password, Qualification)
   2. Upload CV (Optional but recommended)
   3. Submit registration
   4. Backend creates teacher account
   5. Frontend uploads CV automatically
   6. Success message and redirect to login
   ```

3. **Error Handling**
   - Invalid file type rejection
   - File size validation
   - CV upload failure doesn't block registration
   - User feedback on both success and error

#### **Implementation:**
```jsx
const handleCVChange = (e) => {
  const file = e.target.files?.[0];
  if (file) {
    const validTypes = ['application/pdf', 'application/msword', ...];
    if (!validTypes.includes(file.type)) {
      setError('Only PDF, DOC, and DOCX files allowed for CV');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('CV file must be less than 5MB');
      return;
    }
    setCvFile(file);
  }
};
```

---

## 4. **API Services Updates**

### File: `api/services.js`

#### **New Endpoints:**

1. **Courses API**
   ```javascript
   createSection: (courseId, data) => axios.post(`/courses/${courseId}/sections`, data)
   getSections: (courseId) => axios.get(`/courses/${courseId}/sections`)
   ```

2. **Teacher API (New)**
   ```javascript
   uploadCV: (formData) => axios.post('/teacher/cv/upload', formData, {
     headers: { 'Content-Type': 'multipart/form-data' }
   })
   getCV: (teacherId) => axios.get(`/teacher/cv/${teacherId}`)
   ```

---

## 5. **User Workflows**

### **Teacher Workflow:**
```
1. Register with CV upload
   ↓
2. Await admin approval
   ↓
3. Login to dashboard
   ↓
4. Create course (with prerequisites, learning outcomes, estimated hours)
   ↓
5. Add sections to course
   ↓
6. Add lessons to sections
   ├─ Add video URL (YouTube)
   ├─ Add duration
   ├─ Add notes
   ├─ Select lesson type (Video, Text, Interactive, Assignment)
   └─ Save lesson
   ↓
7. View complete course structure
```

### **Admin Workflow:**
```
1. Login to admin dashboard
   ↓
2. View pending teacher approvals
   ↓
3. For each teacher:
   ├─ Click "View CV" to review
   ├─ Download CV if needed
   └─ Approve or Reject
   ↓
4. View all teachers (approved/rejected)
   ↓
5. Monitor statistics
```

### **Student Workflow (Coming Soon):**
```
1. Enroll in course
   ↓
2. View course sections
   ↓
3. Watch lessons with video and notes
   ↓
4. Take notes while watching
   ↓
5. Track progress per section
   ↓
6. View learning analytics
   ↓
7. Submit assignments
   ↓
8. Take quizzes
```

---

## 6. **UI Component Hierarchy**

### **Teacher Dashboard Components:**
```
TeacherDashboard
├── Header
├── Stats (Courses, Students, Lessons, Quizzes)
├── CourseList
│  └── CourseHierarchy (for each course)
│     ├── SectionItem
│     │  └── LessonItem[]
│     └── AddLessonButton
└── Modals
   ├── CourseModal (Create/Edit)
   ├── SectionModal (Add Section)
   ├── LessonModal (Add Lesson with Video URL & Notes)
   └── QuizModal (Add Quiz)
```

### **Admin Dashboard Components:**
```
AdminDashboard
├── Header
├── Stats (Pending, Approved, Total Courses, Rejected)
├── Tabs
│  ├── PendingTeachersTab
│  │  └── TeacherCard
│  │     ├── Details
│  │     ├── View CV Button → CVModal
│  │     ├── Approve Button
│  │     └── Reject Button
│  ├── AllTeachersTab
│  └── StatisticsTab
└── CVModal (View & Download CV)
```

---

## 7. **Features Implemented**

✅ **Admin CV Viewing**
- View teacher CVs in modal
- Download CVs
- Approve/Reject based on review

✅ **Course Hierarchy Visualization**
- Sections nested under courses
- Lessons nested under sections
- Expandable/collapsible UI
- Visual hierarchy with icons

✅ **Enhanced Lesson Creation**
- Video URL support (YouTube embed links)
- Lesson duration tracking
- Rich notes/content field
- Lesson type classification
- Metadata display

✅ **Section Management**
- Create sections within courses
- Section description
- Organize lessons by section
- Section-wise progress

✅ **File Upload Integration**
- CV upload during teacher registration
- File validation (type and size)
- Automatic upload after registration
- Error handling

---

## 8. **Technical Implementation Details**

### **File Upload Handling:**
- Client uses `FormData` API
- `multipart/form-data` content type
- Axios automatic headers for multipart data
- Backend multer middleware processes uploads

### **State Management:**
- `expandedCourse` - Track expanded course
- `expandedSection` - Track expanded section
- `selectedCourse` - Selected course for operations
- `sections` - Fetched sections data
- `cvFile` - Uploaded CV file reference

### **API Integration:**
- Backend: `/api/courses/{id}/sections` - Get sections
- Backend: `/api/teacher/cv/upload` - Upload CV
- Backend: `/api/teacher/cv/{id}` - Get CV
- Frontend: Uses JWT authentication on all requests

---

## 9. **Styling & UX Improvements**

✅ **Gradient Backgrounds**
- Course headers with blue-to-indigo gradient
- Visual hierarchy through color

✅ **Icons & Visual Indicators**
- Video indicator (red play button)
- Text content indicator (blue file icon)
- Expandable arrow animations
- Status badges

✅ **Responsive Design**
- Full-width course cards on mobile
- Stacked sections on small screens
- Touch-friendly button sizes

✅ **Loading States**
- Spinner during CV loading
- Disabled buttons during requests
- Status feedback

✅ **Empty States**
- Helpful messages when no content
- Call-to-action buttons
- Guidance icons

---

## 10. **Testing Scenarios**

### **Test Case 1: Teacher Registration with CV**
1. Go to instructor registration
2. Fill form with valid data
3. Upload PDF/DOC file (under 5MB)
4. Submit
5. **Expected:** Registration succeeds, CV uploaded, redirected to login

### **Test Case 2: Admin Views Teacher CV**
1. Login as admin
2. Go to "Pending Approval" tab
3. Click "View CV" on any teacher
4. **Expected:** CV opens in modal, can view and download

### **Test Case 3: Teacher Creates Course Structure**
1. Login as approved teacher
2. Create course
3. Add section
4. Add lesson with video URL
5. Expand course to view hierarchy
6. **Expected:** Full hierarchy visible with all lesson details

---

## 11. **Known Limitations**

⚠️ **Current Phase 1 Limitations:**
- Sections fetching may return empty (backend needs section creation)
- Video URL requires YouTube embed format
- CV preview uses iframe (may need PDF viewer for better UX)
- Section/lesson ordering not yet implemented

---

## 12. **Next Phase (Phase 2) - TODO**

📋 **Planned Enhancements:**
- Quiz system with question bank
- Certificate generation
- Rich text editor for lesson notes
- Course reviews and ratings
- Notification system
- Mobile app optimization
- Discussion forums
- Advanced search and filters
- Gamification (badges, points)
- Course coupons and pricing

---

## **Deployment Instructions**

### **1. Backend Setup:**
```powershell
cd server
npm install
# Create .env file with JWT_SECRET and DB credentials
npm run db:init  # Run database migration
npm run dev      # Start backend
```

### **2. Frontend Setup:**
```powershell
cd client
npm install
npm run dev  # Start frontend on localhost:5173
```

### **3. Access Points:**
- Frontend: `http://localhost:5173/`
- Backend API: `http://localhost:5000/api/`
- Admin Dashboard: `http://localhost:5173/admin/dashboard`
- Teacher Dashboard: `http://localhost:5173/teacher/dashboard`
- Student Dashboard: `http://localhost:5173/student/dashboard`

---

**Last Updated:** November 22, 2025  
**Status:** ✅ Phase 1 Complete - Admin CV Viewing & Course Hierarchy UI
