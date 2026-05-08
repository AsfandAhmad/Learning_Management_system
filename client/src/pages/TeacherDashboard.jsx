import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { coursesAPI, lessonsAPI, quizzesAPI, assignmentsAPI } from '../api/services';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';
import QuestionManager from '../components/QuestionManager';

export default function TeacherDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [assessmentsRefreshKey, setAssessmentsRefreshKey] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await coursesAPI.getTeacherCourses();
      setCourses(response.data.courses || response.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = () => {
    setSelectedCourse(null);
    setShowCourseModal(true);
  };

  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    setShowCourseModal(true);
  };

  const handlePublishCourse = async (course) => {
    try {
      await coursesAPI.publishCourse(course.CourseID);
      fetchCourses();
      alert('Course published successfully');
    } catch (err) {
      console.error('Error publishing course:', err);
      alert(err.response?.data?.message || 'Failed to publish course');
    }
  };

  const handleAddLesson = (course, section) => {
    console.log('🎯 Handle Add Lesson called with:', { course, section });
    console.log('📊 Course object:', course);
    console.log('📍 Section object:', section);
    console.log('🔍 Section ID value:', section?.SectionID);
    console.log('🔍 Section Title value:', section?.Title);
    setSelectedCourse(course);
    setSelectedSection(section || null);
    console.log('✅ State updated - Section set to:', section?.SectionID || 'NULL');
    setShowLessonModal(true);
  };

  const handleEditLesson = (course, section, lesson) => {
    setSelectedCourse(course);
    setSelectedSection(section || null);
    setSelectedLesson(lesson || null);
    setShowLessonModal(true);
  };

  const handleAddQuiz = (course) => {
    setSelectedCourse(course);
    setEditingQuiz(null);
    setShowQuizModal(true);
  };

  const handleAddAssignment = (course) => {
    setSelectedCourse(course);
    setEditingAssignment(null);
    setShowAssignmentModal(true);
  };

  const handleEditQuiz = (course, quiz) => {
    setSelectedCourse(course);
    setEditingQuiz(quiz);
    setShowQuizModal(true);
  };

  const handleEditAssignment = (course, assignment) => {
    setSelectedCourse(course);
    setEditingAssignment(assignment);
    setShowAssignmentModal(true);
  };

  const handleAssessmentsUpdated = () => {
    setAssessmentsRefreshKey((prev) => prev + 1);
  };

  const handleAddSection = (course) => {
    setSelectedCourse(course);
    setShowSectionModal(true);
  };

  const handleToggleCourse = (courseId) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

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
              <Badge variant="info" className="bg-white text-[#6b00b3]">Teacher</Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-white/70">Instructor</p>
                <p className="font-semibold text-white">{user?.fullName || 'Teacher'}</p>
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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted mb-1">My Courses</p>
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
                  <p className="text-sm text-text-muted mb-1">Total Students</p>
                  <p className="text-3xl font-bold text-badge-green">0</p>
                </div>
                <div className="w-12 h-12 bg-badge-green/10 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-badge-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted mb-1">Total Lessons</p>
                  <p className="text-3xl font-bold text-badge-purple">0</p>
                </div>
                <div className="w-12 h-12 bg-badge-purple/10 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-badge-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted mb-1">Total Quizzes</p>
                  <p className="text-3xl font-bold text-badge-orange">0</p>
                </div>
                <div className="w-12 h-12 bg-badge-orange/10 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-badge-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Header with Create Button */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-dark">My Courses</h2>
          <Button variant="primary" onClick={handleCreateCourse}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Course
          </Button>
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-text-dark">No courses yet</h3>
                <p className="mt-1 text-sm text-text-muted">Get started by creating your first course.</p>
                <div className="mt-6">
                  <Button variant="primary" onClick={handleCreateCourse}>
                    Create Your First Course
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {courses.map((course) => (
              <Card key={course.CourseID} className="overflow-hidden">
                <div className="bg-[#6b00b3] px-6 py-4 text-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-grow">
                      <h3 className="text-xl font-bold mb-2">{course.Title}</h3>
                      <p className="text-white/80 text-sm mb-3">{course.Description}</p>
                      <div className="flex gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Badge variant="info" className="text-xs bg-white text-[#6b00b3]">{course.Level || 'All Levels'}</Badge>
                        </span>
                        <span>{course.EstimatedHours ? `${course.EstimatedHours} hours` : 'N/A'}</span>
                      </div>
                    </div>
                      <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCourse(course)}
                        className="text-white border-white hover:bg-white hover:text-[#6b00b3]"
                      >
                        Edit
                      </Button>
                      {course.Status !== 'Published' ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handlePublishCourse(course)}
                          className="bg-white text-[#6b00b3] hover:bg-white/90"
                        >
                          Publish
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => alert('Course is already published')}
                          className="bg-white text-[#6b00b3] hover:bg-white/90"
                        >
                          Published
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddQuiz(course)}
                        className="bg-white text-[#6b00b3] hover:bg-white/90"
                      >
                        + Quiz
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddAssignment(course)}
                        className="bg-white text-[#6b00b3] hover:bg-white/90"
                      >
                        + Assignment
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAddSection(course)}
                      >
                        + Section
                      </Button>
                    </div>
                  </div>
                </div>

                <CardContent>
                  <button
                    onClick={() => handleToggleCourse(course.CourseID)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg mb-4"
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        className={`w-5 h-5 text-text-muted transition-transform ${
                          expandedCourse === course.CourseID ? 'rotate-90' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="font-semibold text-text-dark">Course Sections</span>
                    </div>
                    <Badge variant="secondary">Expand</Badge>
                  </button>

                  {expandedCourse === course.CourseID && (
                    <div className="space-y-4">
                      <CourseHierarchy course={course} onAddLesson={handleAddLesson} onEditLesson={handleEditLesson} />
                      <CourseAssessments
                        course={course}
                        refreshKey={assessmentsRefreshKey}
                        onAddQuiz={handleAddQuiz}
                        onAddAssignment={handleAddAssignment}
                        onEditQuiz={handleEditQuiz}
                        onEditAssignment={handleEditAssignment}
                        onAssessmentsUpdated={handleAssessmentsUpdated}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <CourseModal
        isOpen={showCourseModal}
        onClose={() => setShowCourseModal(false)}
        course={selectedCourse}
        onSuccess={fetchCourses}
      />

      <SectionModal
        isOpen={showSectionModal}
        onClose={() => setShowSectionModal(false)}
        course={selectedCourse}
        onSuccess={fetchCourses}
      />

      <LessonModal
        isOpen={showLessonModal}
        onClose={() => { setShowLessonModal(false); setSelectedLesson(null); }}
        course={selectedCourse}
        section={selectedSection}
        lesson={selectedLesson}
          />

      <QuizModal
        isOpen={showQuizModal}
        onClose={() => {
          setShowQuizModal(false);
          setEditingQuiz(null);
        }}
        course={selectedCourse}
        quiz={editingQuiz}
        onSuccess={handleAssessmentsUpdated}
      />

      <AssignmentModal
        isOpen={showAssignmentModal}
        onClose={() => {
          setShowAssignmentModal(false);
          setEditingAssignment(null);
        }}
        course={selectedCourse}
        assignment={editingAssignment}
        onSuccess={handleAssessmentsUpdated}
      />
    </div>
  );
}

// Course Hierarchy Component - Shows Sections and Lessons
function CourseHierarchy({ course, onAddLesson, onEditLesson }) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    fetchSections();
  }, [course]);

  const fetchSections = async () => {
    try {
      const [sectionsResponse, lessonsResponse] = await Promise.all([
        coursesAPI.getSections(course.CourseID),
        lessonsAPI.getCourseLessons(course.CourseID)
      ]);

      // API returns array directly, handle both array and wrapped responses
      const sectionsData = Array.isArray(sectionsResponse.data)
        ? sectionsResponse.data
        : (sectionsResponse.data.sections || sectionsResponse.data || []);
      const lessonsData = Array.isArray(lessonsResponse.data)
        ? lessonsResponse.data
        : (lessonsResponse.data.lessons || lessonsResponse.data || []);

      const lessonsBySection = lessonsData.reduce((acc, lesson) => {
        const sectionId = lesson.SectionID;
        if (!sectionId) return acc;
        if (!acc[sectionId]) acc[sectionId] = [];
        acc[sectionId].push(lesson);
        return acc;
      }, {});

      const mergedSections = sectionsData.map((section) => ({
        ...section,
        lessons: lessonsBySection[section.SectionID] || []
      }));

      setSections(mergedSections);
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <p className="text-sm text-gray-600">No sections yet. Create one to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <div key={section.SectionID} className="border border-gray-200 rounded-lg">
          <button
            onClick={() => setExpandedSection(expandedSection === section.SectionID ? null : section.SectionID)}
            className="w-full flex items-center justify-between p-3 hover:bg-primary-light transition"
          >
            <div className="flex items-center gap-3 flex-grow text-left">
              <svg
                className={`w-4 h-4 text-text-muted transition-transform ${
                  expandedSection === section.SectionID ? 'rotate-90' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <div>
                <h4 className="font-semibold text-text-dark">{section.Title}</h4>
                <p className="text-xs text-text-muted">{section.Description}</p>
              </div>
            </div>
            <Badge variant="secondary" className="ml-2">Section</Badge>
          </button>

                    {expandedSection === section.SectionID && (
            <div className="border-t bg-gray-50 p-3 space-y-2">
                    {section.lessons && section.lessons.length > 0 ? (
                <>
                  {section.lessons.map((lesson, idx) => (
                    <div key={idx} className="bg-white p-3 rounded border border-gray-200 flex items-start justify-between">
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-1">
                          {lesson.VideoURL ? (
                            <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19.615 15.823q0 .87-.568 1.438t-1.438.568H6.391q-.87 0-1.438-.568t-.568-1.438V8.177q0-.87.568-1.438T6.391 6.171h11.218q.87 0 1.438.568t.568 1.438zm2.306-7.646v15.292q0 .87-.568 1.438t-1.438.568H4.085q-.87 0-1.438-.568t-.568-1.438V8.177q0-.87.568-1.438t1.438-.568h15.83q.87 0 1.438.568t.568 1.438z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          )}
                          <span className="font-medium text-sm text-gray-900">{lesson.Title}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                          {lesson.LessonType && <span>Type: {lesson.LessonType}</span>}
                          {lesson.VideoDuration && <span>•</span>}
                          {lesson.VideoDuration && <span>Duration: {lesson.VideoDuration} min</span>}
                          {lesson.Notes && <span className="text-green-600">• Has Notes</span>}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="ml-2" onClick={() => onEditLesson(course, section, lesson)}>
                        Edit
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => onAddLesson(course, section)}
                    className="text-primary border-primary hover:bg-primary-light"
                  >
                    + Add Lesson to Section
                  </Button>
                </>
              ) : (
                <div className="text-center py-6 bg-white rounded">
                  <p className="text-sm text-text-muted mb-3">No lessons in this section</p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onAddLesson(course, section)}
                  >
                    + Create First Lesson
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function CourseAssessments({
  course,
  refreshKey,
  onAddQuiz,
  onAddAssignment,
  onEditQuiz,
  onEditAssignment,
  onAssessmentsUpdated
}) {
  const [quizzes, setQuizzes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!course?.CourseID) return;

    const fetchAssessments = async () => {
      try {
        const [quizResponse, assignmentResponse] = await Promise.all([
          quizzesAPI.getCourseQuizzes(course.CourseID),
          assignmentsAPI.getCourseAssignments(course.CourseID)
        ]);

        const quizData = Array.isArray(quizResponse.data)
          ? quizResponse.data
          : (quizResponse.data.quizzes || quizResponse.data || []);
        const assignmentData = Array.isArray(assignmentResponse.data)
          ? assignmentResponse.data
          : (assignmentResponse.data.assignments || assignmentResponse.data || []);

        setQuizzes(quizData);
        setAssignments(assignmentData);
      } catch (error) {
        console.error('Error fetching assessments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, [course, refreshKey]);

  const handleDeleteQuiz = async (quizId) => {
    if (!quizId) return;
    if (!window.confirm('Delete this quiz?')) return;

    try {
      await quizzesAPI.deleteQuiz(quizId);
      onAssessmentsUpdated();
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert(error.response?.data?.message || 'Failed to delete quiz');
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!assignmentId) return;
    if (!window.confirm('Delete this assignment?')) return;

    try {
      await assignmentsAPI.deleteAssignment(assignmentId);
      onAssessmentsUpdated();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      const message = error.response?.data?.message || 'Failed to delete assignment';
      alert(message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="border border-gray-200 rounded-lg bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-text-dark">Quizzes</h4>
          <Button variant="outline" size="sm" onClick={() => onAddQuiz(course)}>
            + Add Quiz
          </Button>
        </div>
        {quizzes.length === 0 ? (
          <p className="text-sm text-text-muted">No quizzes yet.</p>
        ) : (
          <div className="space-y-2">
            {quizzes.map((quiz) => (
              <div key={quiz.QuizID} className="flex items-center justify-between text-sm">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">{quiz.Title || 'Untitled Quiz'}</span>
                  <span className="text-gray-500">{quiz.PassingMarks ?? 'N/A'}% pass</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEditQuiz(course, quiz)}>
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteQuiz(quiz.QuizID)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border border-gray-200 rounded-lg bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-text-dark">Assignments</h4>
          <Button variant="outline" size="sm" onClick={() => onAddAssignment(course)}>
            + Add Assignment
          </Button>
        </div>
        {assignments.length === 0 ? (
          <p className="text-sm text-text-muted">No assignments yet.</p>
        ) : (
          <div className="space-y-2">
            {assignments.map((assignment) => (
              <div key={assignment.AssignmentID} className="flex items-center justify-between text-sm">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">{assignment.Title || 'Untitled Assignment'}</span>
                  <span className="text-gray-500">{assignment.DueDate || 'No due date'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEditAssignment(course, assignment)}>
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteAssignment(assignment.AssignmentID)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Course Creation/Edit Modal
function CourseModal({ isOpen, onClose, course, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'Beginner',
    prerequisites: '',
    learningOutcomes: '',
    estimatedHours: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.Title || '',
        description: course.Description || '',
        level: course.Level || 'Beginner',
        prerequisites: course.Prerequisites || '',
        learningOutcomes: course.LearningOutcomes || '',
        estimatedHours: course.EstimatedHours || ''
      });
    } else {
      setFormData({ title: '', description: '', level: 'Beginner', prerequisites: '', learningOutcomes: '', estimatedHours: '' });
    }
  }, [course, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (course) {
        await coursesAPI.updateCourse(course.CourseID, formData);
      } else {
        await coursesAPI.createCourse(formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={course ? 'Edit Course' : 'Create New Course'}>
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <Input
          label="Course Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          placeholder="e.g., Introduction to Web Development"
        />

        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          placeholder="Describe what students will learn..."
          rows={4}
        />

        <Select
          label="Level"
          value={formData.level}
          onChange={(e) => setFormData({ ...formData, level: e.target.value })}
          options={[
            { value: 'Beginner', label: 'Beginner' },
            { value: 'Intermediate', label: 'Intermediate' },
            { value: 'Advanced', label: 'Advanced' }
          ]}
          required
        />

        <Input
          label="Prerequisites (comma separated)"
          value={formData.prerequisites}
          onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
          placeholder="e.g., HTML, CSS, Basic JavaScript"
        />

        <Textarea
          label="Learning Outcomes"
          value={formData.learningOutcomes}
          onChange={(e) => setFormData({ ...formData, learningOutcomes: e.target.value })}
          placeholder="What will students learn? (comma separated)"
          rows={3}
        />

        <Input
          label="Estimated Hours"
          type="number"
          value={formData.estimatedHours}
          onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
          placeholder="e.g., 40"
        />

        <div className="flex gap-3 mt-6">
          <Button type="button" variant="outline" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? 'Saving...' : course ? 'Update Course' : 'Create Course'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// Section Creation Modal
function SectionModal({ isOpen, onClose, course, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await coursesAPI.createSection(course?.CourseID, formData);
      setFormData({ title: '', description: '' });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create section');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Section">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <Input
          label="Section Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          placeholder="e.g., HTML Basics"
        />

        <Textarea
          label="Section Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe what this section covers..."
          rows={3}
        />

        <div className="flex gap-3 mt-6">
          <Button type="button" variant="outline" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? 'Creating...' : 'Create Section'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// Lesson Creation Modal
function LessonModal({ isOpen, onClose, course, section, lesson }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    duration: '',
    videoURL: '',
    notes: '',
    lessonType: 'Video'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Debug: Log section changes
  useEffect(() => {
    console.log('📋 LessonModal - Section updated:', section);
  }, [section]);

  // Populate form when editing an existing lesson
  useEffect(() => {
    if (lesson) {
      setFormData({
        title: lesson.Title || '',
        content: lesson.Content || lesson.Notes || '',
        duration: lesson.VideoDuration ? String(lesson.VideoDuration) : '',
        videoURL: lesson.VideoURL || lesson.ContentURL || '',
        notes: lesson.Notes || '',
        lessonType: lesson.LessonType || 'Video'
      });
    } else {
      setFormData({ title: '', content: '', duration: '', videoURL: '', notes: '', lessonType: 'Video' });
    }
  }, [lesson]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('📝 Lesson submission started');
      console.log('  Course:', course);
      console.log('  Section:', section);
      console.log('  Form Data:', formData);

      // Validate section
      if (!section || !section.SectionID) {
        console.error('❌ Section missing or invalid:', section);
        setError('Please close this modal, select a section, and try again');
        setLoading(false);
        return;
      }

      // Prepare lesson data
      const lessonNotes = [formData.notes, formData.content]
        .filter((value) => value && String(value).trim())
        .join('\n\n');

      const payload = {
        Title: formData.title || 'Untitled Lesson',
        ContentType: formData.lessonType || 'Video',
        ContentURL: formData.videoURL || null,
        VideoURL: formData.videoURL || null,
        VideoDuration: formData.duration ? parseInt(formData.duration) : 0,
        Notes: lessonNotes || null,
        LessonType: formData.lessonType || 'Video'
      };

      const sectionId = section?.SectionID;
      if (lesson && lesson.LessonID) {
        // Update existing lesson
        console.log('📝 Updating lesson:');
        console.log('   Section ID:', sectionId);
        console.log('   Lesson ID:', lesson.LessonID);
        console.log('   Payload:', payload);
        await lessonsAPI.updateLesson(sectionId, lesson.LessonID, payload);
        console.log('✅ Lesson updated successfully:', lesson.LessonID);
      } else {
        // Create new lesson
        console.log('📝 Creating new lesson:');
        console.log('   Section ID:', sectionId);
        console.log('   Payload:', payload);
        const response = await lessonsAPI.createLesson(sectionId, payload);
        console.log('✅ Lesson created successfully:', response.data);
      }

      // Reset form
      setFormData({ title: '', content: '', duration: '', videoURL: '', notes: '', lessonType: 'Video' });
      onClose();
    } catch (err) {
      console.error('❌ Lesson creation error:', err);
      console.error('   Status:', err.response?.status);
      console.error('   URL:', err.response?.config?.url);
      console.error('   Message:', err.response?.data?.message || err.message);
      console.error('   Full response:', err.response?.data);
      setError(err.response?.data?.message || err.message || 'Failed to create lesson');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Lesson">
      <form onSubmit={handleSubmit}>
        {/* Show section info */}
        {section && section.SectionID && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-sm">
            <p className="font-semibold">📍 Adding to Section:</p>
            <p>{section.Title || 'Untitled Section'}</p>
          </div>
        )}

        {!section || !section.SectionID ? (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-sm">
            <p className="font-semibold">⚠️ No Section Selected</p>
            <p>Please close this modal, select a section, and try again</p>
          </div>
        ) : null}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <Input
          label="Lesson Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          placeholder="e.g., Introduction to HTML Tags"
        />

        <Select
          label="Lesson Type"
          value={formData.lessonType}
          onChange={(e) => setFormData({ ...formData, lessonType: e.target.value })}
          options={[
            { value: 'Video', label: 'Video' },
            { value: 'Text', label: 'Text Content' },
            { value: 'Interactive', label: 'Interactive' },
            { value: 'Assignment', label: 'Assignment' }
          ]}
        />

        <Input
          label="Video URL (YouTube embed link)"
          value={formData.videoURL}
          onChange={(e) => setFormData({ ...formData, videoURL: e.target.value })}
          placeholder="https://www.youtube.com/embed/VIDEO_ID"
        />

        <Input
          label="Duration (minutes)"
          type="number"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
          placeholder="30"
        />

        <Textarea
          label="Lesson Notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Add important points, tips, or references..."
          rows={4}
        />

        <Textarea
          label="Content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Lesson content..."
          rows={3}
        />

        <div className="flex gap-3 mt-6">
          <Button type="button" variant="outline" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            fullWidth 
            disabled={loading || !section || !section.SectionID}
            title={!section || !section.SectionID ? 'Please select a section first' : ''}
          >
            {loading ? 'Adding...' : 'Add Lesson'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// Quiz Creation Modal
function QuizModal({ isOpen, onClose, course, quiz, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    passingScore: 70
  });
  const [quizFiles, setQuizFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quizCreated, setQuizCreated] = useState(false);
  const [currentQuizId, setCurrentQuizId] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setQuizCreated(false);
      setCurrentQuizId(null);
      setQuizFiles([]);
      return;
    }
    if (quiz) {
      setFormData({
        title: quiz.Title || '',
        passingScore: quiz.PassingMarks ?? 70
      });
      setQuizCreated(true);
      setCurrentQuizId(quiz.QuizID);
    } else {
      setFormData({ title: '', passingScore: 70 });
      setQuizCreated(false);
      setCurrentQuizId(null);
      setQuizFiles([]);
    }
  }, [isOpen, quiz]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setQuizFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index) => {
    setQuizFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let quizId;
      
      if (quiz?.QuizID) {
        await quizzesAPI.updateQuiz(quiz.QuizID, {
          Title: formData.title,
          PassingMarks: Number(formData.passingScore)
        });
        quizId = quiz.QuizID;
      } else {
        const response = await quizzesAPI.createQuiz(course?.CourseID, formData);
        quizId = response.data.QuizID || response.data.id;
      }
      
      // Handle file uploads if any files are selected
      if (quizFiles.length > 0 && quizId) {
        const fileFormData = new FormData();
        quizFiles.forEach(file => {
          fileFormData.append('files', file);
        });
        
        try {
          // Note: This endpoint may need to be created on the backend
          // For now, we'll store the intention but not fail if it doesn't exist
          await fetch(`${import.meta.env.VITE_API_URL}/courses/${course?.CourseID}/quizzes/${quizId}/resources`, {
            method: 'POST',
            body: fileFormData,
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }).catch(() => {
            console.warn('Quiz resource upload endpoint not available yet');
          });
        } catch (fileErr) {
          console.warn('File upload failed but quiz was created:', fileErr);
        }
      }
      
      setCurrentQuizId(quizId);
      setQuizCreated(true);
      
      // Show success message temporarily
      if (!quiz) {
        // Only auto-close if creating new; if editing, keep open for question management
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ title: '', passingScore: 70 });
    setQuizCreated(false);
    setCurrentQuizId(null);
    setQuizFiles([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={quiz ? 'Edit Quiz' : 'Create Quiz'} size="lg">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <Input
          label="Quiz Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          placeholder="e.g., HTML Basics Quiz"
        />

        <Input
          label="Passing Score (%)"
          type="number"
          value={formData.passingScore}
          onChange={(e) => setFormData({ ...formData, passingScore: e.target.value })}
          required
          min="0"
          max="100"
          placeholder="70"
        />

        {/* File Upload Section */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-text-dark mb-2">
            Quiz Resources (Optional)
          </label>
          <p className="text-xs text-text-muted mb-3">
            Upload study materials, instructions, or reference files (PDF, DOC, ZIP, images)
          </p>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.zip,.jpg,.png,.gif,.jpeg"
            className="block w-full text-sm text-text-muted
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-badge-orange file:text-white
              hover:file:bg-opacity-90"
          />
          
          {/* Display selected files */}
          {quizFiles.length > 0 && (
            <div className="mt-3 space-y-2">
              {quizFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200">
                  <span className="text-sm text-text-dark truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <p className="text-xs text-text-muted">
                {quizFiles.length} file(s) selected
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Button type="button" variant="outline" fullWidth onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? 'Creating...' : quizCreated ? 'Update Quiz' : 'Create & Manage Questions'}
          </Button>
        </div>
      </form>

      {/* Question Manager - Show after quiz is created */}
      {quizCreated && currentQuizId && course?.CourseID && (
        <QuestionManager 
          courseId={course.CourseID} 
          quizId={currentQuizId}
          isOpen={true}
        />
      )}
    </Modal>
  );
}

// Assignment Creation Modal
function AssignmentModal({ isOpen, onClose, course, assignment, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxMarks: 100,
    sectionId: '',
    submissionType: 'FileUpload',
    allowLateSubmission: true,
    maxAttempts: 1
  });
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [assignmentFiles, setAssignmentFiles] = useState([]);

  // Helper to format ISO date to yyyy-MM-dd for date inputs
  const toDateInput = (iso) => iso ? iso.split('T')[0] : '';

  useEffect(() => {
    if (!isOpen) {
      setAssignmentFiles([]);
      return;
    }
    if (assignment) {
      setFormData({
        title: assignment.Title || '',
        description: assignment.Description || '',
        dueDate: toDateInput(assignment.DueDate) || '',
        maxMarks: assignment.MaxMarks ?? 100,
        sectionId: assignment.SectionID ? String(assignment.SectionID) : '',
        submissionType: assignment.SubmissionType || 'FileUpload',
        allowLateSubmission: assignment.AllowLateSubmission ?? true,
        maxAttempts: assignment.MaxAttempts ?? 1
      });
    } else {
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        maxMarks: 100,
        sectionId: '',
        submissionType: 'FileUpload',
        allowLateSubmission: true,
        maxAttempts: 1
      });
    }
  }, [isOpen, assignment]);

  useEffect(() => {
    if (!isOpen || !course?.CourseID) return;

    const fetchSections = async () => {
      try {
        const response = await coursesAPI.getSections(course.CourseID);
        const data = Array.isArray(response.data)
          ? response.data
          : (response.data.sections || response.data || []);
        setSections(data);
      } catch (err) {
        console.error('Error fetching sections:', err);
      }
    };

    fetchSections();
  }, [isOpen, course]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setAssignmentFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index) => {
    setAssignmentFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        Title: formData.title,
        Description: formData.description,
        DueDate: formData.dueDate || null,
        MaxMarks: Number(formData.maxMarks) || 0,
        SectionID: formData.sectionId || null,
        SubmissionType: formData.submissionType,
        AllowLateSubmission: !!formData.allowLateSubmission,
        MaxAttempts: Number(formData.maxAttempts) || 1
      };

      let assignmentId;
      if (assignment?.AssignmentID) {
        await assignmentsAPI.updateAssignment(assignment.AssignmentID, payload);
        assignmentId = assignment.AssignmentID;
      } else {
        const response = await assignmentsAPI.createAssignment(course?.CourseID, payload);
        assignmentId = response.data.AssignmentID || response.data.id;
      }

      // Handle file uploads if any files are selected
      if (assignmentFiles.length > 0 && assignmentId) {
        const fileFormData = new FormData();
        assignmentFiles.forEach(file => {
          fileFormData.append('files', file);
        });
        
        try {
          // Note: This endpoint may need to be created on the backend
          await fetch(`${import.meta.env.VITE_API_URL}/courses/${course?.CourseID}/assignments/${assignmentId}/resources`, {
            method: 'POST',
            body: fileFormData,
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }).catch(() => {
            console.warn('Assignment resource upload endpoint not available yet');
          });
        } catch (fileErr) {
          console.warn('File upload failed but assignment was created:', fileErr);
        }
      }

      setFormData({
        title: '',
        description: '',
        dueDate: '',
        maxMarks: 100,
        sectionId: '',
        submissionType: 'FileUpload',
        allowLateSubmission: true,
        maxAttempts: 1
      });
      setAssignmentFiles([]);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={assignment ? 'Edit Assignment' : 'Create Assignment'} size="lg">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <Input
          label="Assignment Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          placeholder="e.g., Build a Landing Page"
        />

        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Assignment instructions and requirements..."
          rows={3}
        />

        <Select
          label="Section (optional)"
          value={formData.sectionId}
          onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
          options={[
            { value: '', label: 'No specific section' },
            ...sections.map((section) => ({
              value: String(section.SectionID),
              label: section.Title || `Section ${section.SectionID}`
            }))
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />

          <Input
            label="Max Marks"
            type="number"
            value={formData.maxMarks}
            onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })}
            min="0"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Submission Type"
            value={formData.submissionType}
            onChange={(e) => setFormData({ ...formData, submissionType: e.target.value })}
            options={[
              { value: 'FileUpload', label: 'File Upload' },
              { value: 'Text', label: 'Text' },
              { value: 'Link', label: 'Link' }
            ]}
          />

          <Input
            label="Max Attempts"
            type="number"
            value={formData.maxAttempts}
            onChange={(e) => setFormData({ ...formData, maxAttempts: e.target.value })}
            min="1"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-text-dark mt-2">
          <input
            type="checkbox"
            checked={formData.allowLateSubmission}
            onChange={(e) => setFormData({ ...formData, allowLateSubmission: e.target.checked })}
          />
          Allow late submission
        </label>

        {/* File Upload Section for Teacher Resources */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-text-dark mb-2">
            Assignment Resources (Optional)
          </label>
          <p className="text-xs text-text-muted mb-3">
            Upload starter files, templates, or reference materials for students
          </p>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.zip,.jpg,.png,.gif,.jpeg,.txt,.html,.css,.js"
            className="block w-full text-sm text-text-muted
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-badge-orange file:text-white
              hover:file:bg-opacity-90"
          />
          
          {/* Display selected files */}
          {assignmentFiles.length > 0 && (
            <div className="mt-3 space-y-2">
              {assignmentFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200">
                  <span className="text-sm text-text-dark truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <p className="text-xs text-text-muted">
                {assignmentFiles.length} file(s) selected
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Button type="button" variant="outline" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? 'Creating...' : 'Create Assignment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
