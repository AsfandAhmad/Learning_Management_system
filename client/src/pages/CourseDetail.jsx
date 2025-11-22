import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { coursesAPI, lessonsAPI, quizzesAPI } from '../api/services';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Tabs from '../components/ui/Tabs';

export default function CourseDetail() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const [courseRes, lessonsRes, quizzesRes] = await Promise.all([
        coursesAPI.getCourseById(courseId),
        lessonsAPI.getCourseLessons(courseId),
        quizzesAPI.getCourseQuizzes(courseId)
      ]);
      setCourse(courseRes.data.course || courseRes.data);
      setLessons(lessonsRes.data.lessons || lessonsRes.data || []);
      setQuizzes(quizzesRes.data.quizzes || quizzesRes.data || []);
    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
          <Button onClick={() => navigate('/student/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      label: `Lessons (${lessons.length})`,
      content: <LessonsTab lessons={lessons} />
    },
    {
      label: `Quizzes (${quizzes.length})`,
      content: <QuizzesTab quizzes={quizzes} />
    },
    {
      label: 'About',
      content: <AboutTab course={course} />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/student/dashboard')}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                P
              </div>
              <span className="font-bold text-2xl text-blue-600">Parhayi Likhai</span>
            </div>
          </div>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>
      </header>

      {/* Course Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-start justify-between">
            <div>
              <Badge variant="default" className="mb-3 bg-white/20 text-white">
                {course.Level || 'Beginner'}
              </Badge>
              <h1 className="text-4xl font-bold mb-4">{course.Title || 'Course Title'}</h1>
              <p className="text-blue-100 text-lg max-w-3xl">
                {course.Description || 'No description available'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs tabs={tabs} />
      </main>
    </div>
  );
}

function LessonsTab({ lessons }) {
  if (lessons.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No lessons yet</h3>
        <p className="mt-1 text-sm text-gray-500">Lessons will be added soon.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {lessons.map((lesson, index) => (
        <Card key={lesson.LessonID || index} hover>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
              {index + 1}
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {lesson.Title || `Lesson ${index + 1}`}
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                {lesson.Content || 'No content available'}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {lesson.Duration || '30'} mins
                </span>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Start
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function QuizzesTab({ quizzes }) {
  if (quizzes.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No quizzes yet</h3>
        <p className="mt-1 text-sm text-gray-500">Quizzes will be added soon.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {quizzes.map((quiz, index) => (
        <Card key={quiz.QuizID || index} hover>
          <CardHeader>
            <CardTitle>{quiz.Title || `Quiz ${index + 1}`}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">10 Questions</span>
              <Badge variant="info">Not Attempted</Badge>
            </div>
            <Button variant="primary" fullWidth>
              Start Quiz
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AboutTab({ course }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About This Course</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
            <p className="text-gray-600">{course.Description || 'No description available'}</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Level</h4>
            <Badge variant="primary">{course.Level || 'Beginner'}</Badge>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">What You'll Learn</h4>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Master the fundamentals</li>
              <li>Build practical projects</li>
              <li>Develop professional skills</li>
              <li>Get hands-on experience</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
