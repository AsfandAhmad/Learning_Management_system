import axios from './http';

// ============ AUTH API ============
export const authAPI = {
  // Student
  registerStudent: (data) => axios.post('/auth/student/register', data),
  loginStudent: (data) => axios.post('/auth/student/login', data),
  
  // Teacher
  registerTeacher: (data) => axios.post('/auth/teacher/register', data),
  loginTeacher: (data) => axios.post('/auth/teacher/login', data),
  
  // Admin
  loginAdmin: (data) => axios.post('/auth/admin/login', data),
};

// ============ COURSES API ============
export const coursesAPI = {
  getAllCourses: () => axios.get('/courses'),
  getCourseById: (id) => axios.get(`/courses/${id}`),
  createCourse: (data) => axios.post('/courses', data),
  updateCourse: (id, data) => axios.put(`/courses/${id}`, data),
  publishCourse: (id) => axios.put(`/courses/${id}`, { status: 'Published' }),
  deleteCourse: (id) => axios.delete(`/courses/${id}`),
  getTeacherCourses: () => axios.get('/courses/teacher/my-courses'),
  createSection: (courseId, data) => axios.post(`/courses/${courseId}/sections`, data),
  getSections: (courseId) => axios.get(`/courses/${courseId}/sections`),
};

// ============ LESSONS API ============
export const lessonsAPI = {
  getCourseLessons: (courseId) => axios.get(`/courses/${courseId}/lessons`),
  // Create lesson under a specific section (server route: /sections/:sectionId/lessons)
  createLesson: (sectionId, data) => axios.post(`/sections/${sectionId}/lessons`, data),
  updateLesson: (lessonId, data) => axios.put(`/lessons/${lessonId}`, data),
  deleteLesson: (lessonId) => axios.delete(`/lessons/${lessonId}`),
};

// ============ MODULES API ============
export const modulesAPI = {
  getCourseModules: (courseId) => axios.get(`/courses/${courseId}/modules`),
  createModule: (courseId, data) => axios.post(`/courses/${courseId}/modules`, data),
  updateModule: (moduleId, data) => axios.put(`/modules/${moduleId}`, data),
  deleteModule: (moduleId) => axios.delete(`/modules/${moduleId}`),
};

// ============ QUIZZES API ============
export const quizzesAPI = {
  getCourseQuizzes: (courseId) => axios.get(`/courses/${courseId}/quizzes`),
  createQuiz: (courseId, data) => axios.post(`/courses/${courseId}/quizzes`, data),
  updateQuiz: (quizId, data) => axios.put(`/quizzes/${quizId}`, data),
  deleteQuiz: (quizId) => axios.delete(`/quizzes/${quizId}`),
  submitQuiz: (quizId, answers) => axios.post(`/quizzes/${quizId}/submit`, { answers }),
};

// ============ ENROLLMENTS API ============
export const enrollmentsAPI = {
  // Server route expects POST /enrollments/courses/:courseId
  enrollInCourse: (courseId) => axios.post(`/enrollments/courses/${courseId}`),
  getMyEnrollments: () => axios.get('/enrollments/my-enrollments'),
  getEnrollmentProgress: (enrollmentId) => axios.get(`/enrollments/${enrollmentId}/progress`),
  updateProgress: (enrollmentId, data) => axios.put(`/enrollments/${enrollmentId}/progress`, data),
};

// ============ ADMIN API ============
export const adminAPI = {
  getPendingTeachers: () => axios.get('/admin/teachers/pending'),
  getAllTeachers: () => axios.get('/admin/teachers'),
  approveTeacher: (teacherId) => axios.patch(`/admin/teachers/${teacherId}/approve`),
  rejectTeacher: (teacherId) => axios.patch(`/admin/teachers/${teacherId}/reject`),
  getStatistics: () => axios.get('/admin/statistics'),
};

// ============ TEACHER API ============
export const teacherAPI = {
  uploadCV: (formData) => axios.post('/teacher/cv/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  getCV: (teacherId) => axios.get(`/teacher/cv/${teacherId}`),
};
