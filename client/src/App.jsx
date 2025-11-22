import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

// Pages
import LandingPage from './pages/landingpage.jsx';
import StudentLogin from './pages/StudentLogin.jsx';
import StudentRegister from './pages/StudentRegister.jsx';
import InstructorLogin from './pages/InstructorLogin.jsx';
import InstructorRegister from './pages/InstructorRegister.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import TeacherDashboard from './pages/TeacherDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import CourseDetail from './pages/CourseDetail.jsx';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/register" element={<StudentRegister />} />
          <Route path="/instructor/login" element={<InstructorLogin />} />
          <Route path="/instructor/register" element={<InstructorRegister />} />
          
          {/* Protected Student Routes */}
          <Route 
            path="/student/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/course/:courseId" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <CourseDetail />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected Teacher Routes */}
          <Route 
            path="/teacher/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
