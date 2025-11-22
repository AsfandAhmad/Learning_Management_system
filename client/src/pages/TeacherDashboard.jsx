import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { coursesAPI, lessonsAPI, quizzesAPI } from '../api/services';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';

export default function TeacherDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
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
    setSelectedCourse(course);
    setSelectedSection(section || null);
    setShowLessonModal(true);
  };

  const handleAddQuiz = (course) => {
    setSelectedCourse(course);
    setShowQuizModal(true);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              P
            </div>
            <span className="font-bold text-2xl text-blue-600">Parhayi Likhai</span>
            <Badge variant="info">Teacher</Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Instructor</p>
              <p className="font-semibold text-gray-900">{user?.fullName || 'Teacher'}</p>
            </div>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
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
                  <p className="text-sm text-gray-600 mb-1">My Courses</p>
                  <p className="text-3xl font-bold text-gray-900">{courses.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <p className="text-sm text-gray-600 mb-1">Total Students</p>
                  <p className="text-3xl font-bold text-green-600">0</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <p className="text-sm text-gray-600 mb-1">Total Lessons</p>
                  <p className="text-3xl font-bold text-purple-600">0</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <p className="text-sm text-gray-600 mb-1">Total Quizzes</p>
                  <p className="text-3xl font-bold text-orange-600">0</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Header with Create Button */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
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
                <h3 className="mt-2 text-sm font-medium text-gray-900">No courses yet</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating your first course.</p>
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
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-grow">
                      <h3 className="text-xl font-bold mb-2">{course.Title}</h3>
                      <p className="text-blue-100 text-sm mb-3">{course.Description}</p>
                      <div className="flex gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Badge variant="info" className="text-xs">{course.Level || 'All Levels'}</Badge>
                        </span>
                        <span>{course.EstimatedHours ? `${course.EstimatedHours} hours` : 'N/A'}</span>
                      </div>
                    </div>
                      <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCourse(course)}
                        className="text-white border-white hover:bg-white hover:text-blue-600"
                      >
                        Edit
                      </Button>
                      {course.Status !== 'Published' ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handlePublishCourse(course)}
                          className="bg-white text-blue-600 hover:bg-blue-50"
                        >
                          Publish
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => alert('Course is already published')}
                          className="bg-white text-blue-600 hover:bg-blue-50"
                        >
                          Published
                        </Button>
                      )}
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAddSection(course)}
                        className="bg-white text-blue-600 hover:bg-blue-50"
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
                        className={`w-5 h-5 text-gray-600 transition-transform ${
                          expandedCourse === course.CourseID ? 'rotate-90' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="font-semibold text-gray-900">Course Sections</span>
                    </div>
                    <Badge variant="secondary">Expand</Badge>
                  </button>

                  {expandedCourse === course.CourseID && (
                    <CourseHierarchy course={course} onAddLesson={() => handleAddLesson(course)} />
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
            onClose={() => setShowLessonModal(false)}
            course={selectedCourse}
            section={selectedSection}
          />

      <QuizModal
        isOpen={showQuizModal}
        onClose={() => setShowQuizModal(false)}
        course={selectedCourse}
      />
    </div>
  );
}

// Course Hierarchy Component - Shows Sections and Lessons
function CourseHierarchy({ course, onAddLesson }) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    fetchSections();
  }, [course]);

  const fetchSections = async () => {
    try {
      const response = await coursesAPI.getSections(course.CourseID);
      setSections(response.data.sections || response.data || []);
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
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
            className="w-full flex items-center justify-between p-3 hover:bg-blue-50 transition"
          >
            <div className="flex items-center gap-3 flex-grow text-left">
              <svg
                className={`w-4 h-4 text-gray-600 transition-transform ${
                  expandedSection === section.SectionID ? 'rotate-90' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <div>
                <h4 className="font-semibold text-gray-900">{section.Title}</h4>
                <p className="text-xs text-gray-500">{section.Description}</p>
              </div>
            </div>
            <Badge variant="secondary" className="ml-2">Section</Badge>
          </button>

                    {expandedSection === section.SectionID && (
            <div className="border-t bg-gray-50 p-3 space-y-2">
                  {section.Lessons && section.Lessons.length > 0 ? (
                <>
                  {section.Lessons.map((lesson, idx) => (
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
                      <Button variant="outline" size="sm" className="ml-2">
                        Edit
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => onAddLesson(course, section)}
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    + Add Lesson to Section
                  </Button>
                </>
              ) : (
                <div className="text-center py-6 bg-white rounded">
                  <p className="text-sm text-gray-600 mb-3">No lessons in this section</p>
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
function LessonModal({ isOpen, onClose, course, section }) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // First, create section if needed, then create lesson
      // Note: This assumes the course has at least one section
      const lessonsData = {
        title: formData.title,
        contentType: formData.lessonType,
        videoURL: formData.videoURL,
        videoDuration: formData.duration ? parseInt(formData.duration) : 0,
        notes: formData.notes,
        lessonType: formData.lessonType
      };
      
      // Ensure section is selected
      const sectionId = section?.SectionID;
      if (!sectionId) {
        throw new Error('Please select or create a section before adding a lesson');
      }

      await lessonsAPI.createLesson(sectionId, lessonsData);
      setFormData({ title: '', content: '', duration: '', videoURL: '', notes: '', lessonType: 'Video' });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create lesson');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Lesson">
      <form onSubmit={handleSubmit}>
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
          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? 'Adding...' : 'Add Lesson'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// Quiz Creation Modal
function QuizModal({ isOpen, onClose, course }) {
  const [formData, setFormData] = useState({
    title: '',
    passingScore: 70
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await quizzesAPI.createQuiz(course?.CourseID, formData);
      setFormData({ title: '', passingScore: 70 });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Quiz">
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

        <div className="flex gap-3 mt-6">
          <Button type="button" variant="outline" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? 'Creating...' : 'Create Quiz'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
