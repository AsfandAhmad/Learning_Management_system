/**
 * Example: Teacher Dashboard with Lesson Management
 * Shows how to integrate the LessonForm component into your app
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LessonForm from '@/components/LessonForm';
import './TeacherDashboard.css';

export function TeacherDashboard() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  // Load courses on mount
  useEffect(() => {
    loadCourses();
  }, []);

  // Load lessons when section changes
  useEffect(() => {
    if (selectedSection) {
      loadLessons();
    }
  }, [selectedSection]);

  // Load all courses taught by this teacher
  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(response.data);
    } catch (error) {
      console.error('Error loading courses:', error);
      alert('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  // Load sections for selected course
  const loadSections = async (courseId) => {
    try {
      const response = await axios.get(`/api/courses/${courseId}/sections`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error loading sections:', error);
      return [];
    }
  };

  // Load lessons for selected section
  const loadLessons = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/sections/${selectedSection}/lessons`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLessons(response.data);
    } catch (error) {
      console.error('Error loading lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle course selection
  const handleSelectCourse = async (course) => {
    setSelectedCourse(course);
    const sections = await loadSections(course.CourseID);
    if (sections.length > 0) {
      setSelectedSection(sections[0].SectionID);
    } else {
      setSelectedSection(null);
    }
  };

  // Handle lesson creation success
  const handleLessonCreated = () => {
    setShowLessonForm(false);
    loadLessons(); // Refresh lessons list
  };

  // Delete lesson
  const deleteLesson = async (lessonId) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;

    try {
      await axios.delete(
        `/api/sections/${selectedSection}/lessons/${lessonId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadLessons();
      alert('Lesson deleted successfully');
    } catch (error) {
      alert('Error deleting lesson: ' + error.response?.data?.message);
    }
  };

  return (
    <div className="teacher-dashboard">
      <h1>👨‍🏫 Teacher Dashboard</h1>

      <div className="dashboard-layout">
        {/* Courses Sidebar */}
        <aside className="courses-sidebar">
          <h2>My Courses</h2>
          <div className="courses-list">
            {courses.map(course => (
              <div
                key={course.CourseID}
                className={`course-item ${selectedCourse?.CourseID === course.CourseID ? 'active' : ''}`}
                onClick={() => handleSelectCourse(course)}
              >
                <h3>{course.Title}</h3>
                <p>{course.Category}</p>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="dashboard-content">
          {selectedCourse ? (
            <>
              <div className="content-header">
                <h2>{selectedCourse.Title}</h2>
                <p>{selectedCourse.Description}</p>
              </div>

              {/* Lessons Section */}
              <section className="lessons-section">
                <div className="section-header">
                  <h3>📚 Lessons</h3>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowLessonForm(true)}
                  >
                    ➕ Add New Lesson
                  </button>
                </div>

                {loading ? (
                  <p>Loading lessons...</p>
                ) : lessons.length === 0 ? (
                  <p className="empty-state">
                    No lessons yet. Create your first lesson!
                  </p>
                ) : (
                  <div className="lessons-grid">
                    {lessons.map(lesson => (
                      <div key={lesson.LessonID} className="lesson-card">
                        <div className="lesson-header">
                          <h4>{lesson.Title}</h4>
                          <span className="content-type">{lesson.ContentType}</span>
                        </div>

                        {lesson.VideoDuration && (
                          <p className="duration">
                            ⏱️ {lesson.VideoDuration} minutes
                          </p>
                        )}

                        {lesson.Notes && (
                          <p className="notes">{lesson.Notes.substring(0, 100)}...</p>
                        )}

                        <div className="lesson-actions">
                          <button className="btn btn-small btn-edit">
                            ✏️ Edit
                          </button>
                          <button className="btn btn-small btn-delete"
                            onClick={() => deleteLesson(lesson.LessonID)}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          ) : (
            <div className="empty-state">
              <p>Select a course to manage its lessons</p>
            </div>
          )}
        </main>
      </div>

      {/* Lesson Form Modal */}
      {showLessonForm && selectedSection && (
        <LessonForm
          sectionId={selectedSection}
          courseId={selectedCourse.CourseID}
          onSuccess={handleLessonCreated}
          onCancel={() => setShowLessonForm(false)}
        />
      )}
    </div>
  );
}

export default TeacherDashboard;
