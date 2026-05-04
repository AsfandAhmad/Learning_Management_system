import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { coursesAPI, enrollmentsAPI } from '../api/services';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'enrolled'
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, enrollmentsRes] = await Promise.all([
        coursesAPI.getAllCourses(),
        enrollmentsAPI.getMyEnrollments()
      ]);
      setCourses(coursesRes.data.courses || coursesRes.data || []);
      setEnrollments(enrollmentsRes.data.enrollments || enrollmentsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const isEnrolled = (courseId) => {
    return enrollments.some(e => e.CourseID === courseId || e.courseId === courseId);
  };

  const handleEnroll = async (courseId) => {
    try {
      await enrollmentsAPI.enrollInCourse(courseId);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error enrolling:', error);
      alert(error.response?.data?.message || 'Failed to enroll in course');
    }
  };

  const handleViewCourse = (courseId) => {
    navigate(`/student/course/${courseId}`);
  };

  const displayedCourses = activeTab === 'enrolled'
    ? courses.filter(c => isEnrolled(c.CourseID || c.courseId))
    : courses;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-page">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#6b00b3] to-black shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-[#6b00b3] font-bold">
                N
              </div>
              <span className="font-bold text-2xl text-white">NexLern</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-white/70">Welcome back,</p>
                <p className="font-semibold text-white">{user?.fullName || 'Student'}</p>
              </div>
              <Button 
                variant="outline" 
                onClick={logout} 
                className="border-white text-white hover:bg-white hover:text-[#6b00b3] whitespace-nowrap"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted mb-1">Total Courses</p>
                  <p className="text-3xl font-bold text-text-dark">{courses.length}</p>
                </div>
                <div className="w-12 h-12 bg-badge-blue/10 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-badge-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted mb-1">Enrolled Courses</p>
                  <p className="text-3xl font-bold text-badge-green">{enrollments.length}</p>
                </div>
                <div className="w-12 h-12 bg-badge-green/10 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-badge-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted mb-1">In Progress</p>
                  <p className="text-3xl font-bold text-badge-orange">{enrollments.length}</p>
                </div>
                <div className="w-12 h-12 bg-badge-orange/10 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-badge-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'all'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-dark hover:border-gray-300'
              }`}
            >
              All Courses ({courses.length})
            </button>
            <button
              onClick={() => setActiveTab('enrolled')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'enrolled'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-dark hover:border-gray-300'
              }`}
            >
              My Courses ({enrollments.length})
            </button>
          </nav>
        </div>

        {/* Courses Grid */}
        {displayedCourses.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-text-dark">No courses found</h3>
            <p className="mt-1 text-sm text-text-muted">
              {activeTab === 'enrolled' ? 'You haven\'t enrolled in any courses yet.' : 'No courses available at the moment.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedCourses.map((course) => (
              <CourseCard
                key={course.CourseID || course.courseId}
                course={course}
                isEnrolled={isEnrolled(course.CourseID || course.courseId)}
                onEnroll={handleEnroll}
                onView={handleViewCourse}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function CourseCard({ course, isEnrolled, onEnroll, onView }) {
  const courseId = course.CourseID || course.courseId;
  const title = course.Title || course.title || 'Untitled Course';
  const description = course.Description || course.description || 'No description available';
  const level = course.Level || course.level || 'Beginner';

  return (
    <Card hover>
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge variant={isEnrolled ? 'success' : 'primary'}>
            {level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-text-muted text-sm mb-4 line-clamp-3">{description}</p>
        
        <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Self-paced</span>
        </div>

        {isEnrolled ? (
          <Button variant="primary" fullWidth onClick={() => onView(courseId)}>
            Continue Learning
          </Button>
        ) : (
          <Button variant="outline" fullWidth onClick={() => onEnroll(courseId)}>
            Enroll Now
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
