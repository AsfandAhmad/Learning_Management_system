import { pool } from "../config/db.js";

// GET all published courses (public)
export async function listCourses(req, res, next) {
  try {
    const [courses] = await pool.query(
      `SELECT c.CourseID, c.Title, c.Description, c.Category, c.Level, c.ThumbnailURL, c.CreatedAt, c.Status,
              t.FullName AS TeacherName, t.TeacherID,
              (SELECT COUNT(*) FROM Enrollment WHERE CourseID = c.CourseID) AS StudentCount,
              (SELECT COUNT(*) FROM Section WHERE CourseID = c.CourseID) AS SectionCount
       FROM Course c 
       JOIN Teacher t ON c.TeacherID = t.TeacherID 
       ORDER BY c.CreatedAt DESC`
    );
    res.json(courses);
  } catch (e) { 
    next(e);
  }
}

// GET course details with sections, lessons, and additional data
export async function getCourseById(req, res, next) {
  try {
    const { courseId } = req.params;
    const userId = req.user?.studentId || req.user?.teacherId;
    const isTeacher = !!req.user?.teacherId;

    // Get basic course info
    let query = `SELECT 
        c.*, 
        t.FullName AS TeacherName, 
        t.Email AS TeacherEmail, 
        t.Qualification,
        (SELECT COUNT(*) FROM Enrollment WHERE CourseID = c.CourseID) AS StudentCount`;
    
    const params = [];
    
    if (userId) {
      query += `, EXISTS(SELECT 1 FROM Enrollment e WHERE e.StudentID = ? AND e.CourseID = c.CourseID) AS IsEnrolled`;
      params.push(userId);
    } else {
      query += `, 0 AS IsEnrolled`;
    }
    
    if (isTeacher) {
      query += `, c.TeacherID = ? AS IsInstructor`;
      params.push(userId);
    } else {
      query += `, 0 AS IsInstructor`;
    }
    
    query += ` FROM Course c JOIN Teacher t ON c.TeacherID = t.TeacherID WHERE c.CourseID = ?`;
    params.push(courseId);
    
    const [course] = await pool.query(query, params);
    
    if (!course.length) return res.status(404).json({ message: "Course not found" });

    // Get sections with lesson count
    const [sections] = await pool.query(
      `SELECT s.*, 
              (SELECT COUNT(*) FROM Lesson WHERE SectionID = s.SectionID) AS LessonCount,
              (SELECT COUNT(DISTINCT l.LessonID) 
               FROM Lesson l 
               LEFT JOIN LessonProgress lp ON l.LessonID = lp.LessonID AND lp.StudentID = ?
               WHERE l.SectionID = s.SectionID AND (lp.Completed = 1 OR ? = 1)) AS CompletedLessons
       FROM Section s 
       WHERE s.CourseID = ? 
       ORDER BY s.PositionOrder`,
      [userId || 0, isTeacher ? 1 : 0, courseId]
    );

      // Get prerequisites (table may not exist on older DBs)
      let prerequisites = [];
      try {
        const [rows] = await pool.query(
          `SELECT c.CourseID, c.Title, c.ThumbnailURL 
           FROM CoursePrerequisite cp
           JOIN Course c ON cp.PrerequisiteCourseID = c.CourseID
           WHERE cp.CourseID = ?`,
          [courseId]
        );
        prerequisites = rows;
      } catch (err) {
        // If migration not applied, ignore and continue with empty prerequisites
        if (err && (err.code === 'ER_NO_SUCH_TABLE' || err.code === 'ER_BAD_TABLE_ERROR')) {
          prerequisites = [];
        } else {
          throw err;
        }
      }

    // Get learning outcomes
      // Get learning outcomes (may not exist)
      let learningOutcomes = [];
      try {
        const [rows] = await pool.query(
          `SELECT OutcomeID, Description 
           FROM CourseLearningOutcome 
           WHERE CourseID = ? 
           ORDER BY SortOrder, OutcomeID`,
          [courseId]
        );
        learningOutcomes = rows;
      } catch (err) {
        if (err && (err.code === 'ER_NO_SUCH_TABLE' || err.code === 'ER_BAD_TABLE_ERROR')) {
          learningOutcomes = [];
        } else {
          throw err;
        }
      }

    // Get course resources
      // Get course resources (may not exist)
      let resources = [];
      try {
        const [rows] = await pool.query(
          `SELECT ResourceID, Title, Description, FileURL, FileType, SortOrder
           FROM CourseResource 
           WHERE CourseID = ? 
           ORDER BY SortOrder, Title`,
          [courseId]
        );
        resources = rows;
      } catch (err) {
        if (err && (err.code === 'ER_NO_SUCH_TABLE' || err.code === 'ER_BAD_TABLE_ERROR')) {
          resources = [];
        } else {
          throw err;
        }
      }

    // Parse JSON fields if they exist
    const courseData = {
      ...course[0],
      prerequisites: prerequisites,
      learningOutcomes: learningOutcomes.map(lo => lo.Description),
      resources,
      sections,
      // Parse JSON fields if they exist
      prerequisitesList: course[0].Prerequisites ? JSON.parse(course[0].Prerequisites) : [],
      learningOutcomesList: course[0].LearningOutcomes ? JSON.parse(course[0].LearningOutcomes) : []
    };

    // Remove the raw JSON fields
    delete courseData.Prerequisites;
    delete courseData.LearningOutcomes;

    res.json(courseData);
  } catch (e) { 
    next(e);
  }
}

// Helper function to process course data
const processCourseData = (data) => {
  // Support both lowercase and Title case field names
  const processed = {};
  const fields = [
    'title', 'description', 'category', 'level', 'thumbnailURL', 
    'prerequisites', 'learningOutcomes', 'estimatedHours', 'difficultyLevel'
  ];
  
  fields.forEach(field => {
    const titleCase = field.charAt(0).toUpperCase() + field.slice(1);
    processed[field] = data[field] !== undefined ? data[field] : data[titleCase];
  });
  
  return processed;
};

// Helper function to save course prerequisites
const savePrerequisites = async (courseId, prerequisites) => {
  if (!prerequisites || !Array.isArray(prerequisites)) return;
  
  // Delete existing prerequisites
  await pool.query('DELETE FROM CoursePrerequisite WHERE CourseID = ?', [courseId]);
  
  // Insert new prerequisites
  for (const prereqId of prerequisites) {
    if (prereqId !== courseId) { // Prevent self-referential
      await pool.query(
        'INSERT INTO CoursePrerequisite (CourseID, PrerequisiteCourseID) VALUES (?, ?)',
        [courseId, prereqId]
      );
    }
  }
};

// Helper function to save learning outcomes
const saveLearningOutcomes = async (courseId, outcomes) => {
  if (!outcomes || !Array.isArray(outcomes)) return;
  
  // Delete existing outcomes
  await pool.query('DELETE FROM CourseLearningOutcome WHERE CourseID = ?', [courseId]);
  
  // Insert new outcomes
  for (const [index, outcome] of outcomes.entries()) {
    if (outcome && outcome.trim()) {
      await pool.query(
        `INSERT INTO CourseLearningOutcome 
         (CourseID, Description, SortOrder) 
         VALUES (?, ?, ?)`,
        [courseId, outcome.trim(), index + 1]
      );
    }
  }
};

// POST create course (teacher only)
export async function createCourse(req, res, next) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  
  try {
    const teacherId = req.user.teacherId;
    const {
      title,
      description,
      category,
      level,
      thumbnailURL,
      prerequisites = [],
      learningOutcomes = [],
      estimatedHours,
      difficultyLevel
    } = processCourseData(req.body);

    // Insert the course
    const [result] = await connection.query(
      `INSERT INTO Course 
       (TeacherID, Title, Description, Category, Level, ThumbnailURL, 
        Prerequisites, LearningOutcomes, EstimatedHours, DifficultyLevel, Status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Draft')`,
      [
        teacherId,
        title,
        description,
        category,
        level,
        thumbnailURL,
        JSON.stringify(prerequisites),
        JSON.stringify(learningOutcomes),
        estimatedHours || null,
        difficultyLevel || 'Beginner'
      ]
    );

    const courseId = result.insertId;

    // Save prerequisites and learning outcomes
    await savePrerequisites(courseId, prerequisites);
    await saveLearningOutcomes(courseId, learningOutcomes);

    await connection.commit();
    
    res.status(201).json({
      CourseID: courseId,
      message: "Course created successfully in Draft status"
    });
  } catch (e) {
    await connection.rollback();
    next(e);
  } finally {
    connection.release();
  }
}

// PUT update course (teacher only)
export async function updateCourse(req, res, next) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  
  try {
    const { courseId } = req.params;
    const teacherId = req.user.teacherId;
    const {
      title,
      description,
      category,
      level,
      thumbnailURL,
      status,
      prerequisites = [],
      learningOutcomes = [],
      estimatedHours,
      difficultyLevel
    } = processCourseData(req.body);

    // Verify course belongs to teacher
    const [course] = await connection.query(
      "SELECT TeacherID FROM Course WHERE CourseID = ?",
      [courseId]
    );
    
    if (!course.length || course[0].TeacherID !== teacherId) {
      await connection.rollback();
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update the course
    await connection.query(
      `UPDATE Course SET 
        Title = COALESCE(?, Title),
        Description = COALESCE(?, Description),
        Category = COALESCE(?, Category),
        Level = COALESCE(?, Level),
        ThumbnailURL = COALESCE(?, ThumbnailURL),
        Status = COALESCE(?, Status),
        Prerequisites = COALESCE(?, Prerequisites),
        LearningOutcomes = COALESCE(?, LearningOutcomes),
        EstimatedHours = COALESCE(?, EstimatedHours),
        DifficultyLevel = COALESCE(?, DifficultyLevel)
      WHERE CourseID = ?`,
      [
        title,
        description,
        category,
        level,
        thumbnailURL,
        status,
        JSON.stringify(prerequisites),
        JSON.stringify(learningOutcomes),
        estimatedHours,
        difficultyLevel,
        courseId
      ]
    );

    // Save prerequisites and learning outcomes if provided
    if (prerequisites) await savePrerequisites(courseId, prerequisites);
    if (learningOutcomes) await saveLearningOutcomes(courseId, learningOutcomes);

    await connection.commit();
    res.json({ ok: true, message: "Course updated successfully" });
  } catch (e) { 
    await connection.rollback();
    next(e); 
  } finally {
    connection.release();
  }
}

// DELETE course (teacher only)
export async function deleteCourse(req, res, next) {
  try {
    const { courseId } = req.params;
    const teacherId = req.user.teacherId;

    // Verify course belongs to teacher
    const [course] = await pool.query(
      "SELECT TeacherID FROM Course WHERE CourseID = ?",
      [courseId]
    );
    if (!course.length || course[0].TeacherID !== teacherId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await pool.query("DELETE FROM Course WHERE CourseID = ?", [courseId]);
    res.json({ ok: true, message: "Course deleted successfully" });
  } catch (e) { 
    next(e);
  }
}

// GET teacher's courses
export async function getTeacherCourses(req, res, next) {
  try {
    const teacherId = req.user.teacherId;

    const [courses] = await pool.query(
      `SELECT c.CourseID, c.Title, c.Description, c.Category, c.Level, c.Status, c.CreatedAt,
              (SELECT COUNT(*) FROM Enrollment WHERE CourseID = c.CourseID) AS StudentCount,
              (SELECT COUNT(*) FROM Section WHERE CourseID = c.CourseID) AS SectionCount
       FROM Course c 
       WHERE c.TeacherID = ? 
       ORDER BY c.CreatedAt DESC`,
      [teacherId]
    );
    res.json(courses);
  } catch (e) { 
    next(e);
  }
}

// POST enroll student in course
export async function enrollCourse(req, res, next) {
  try {
    const { courseId } = req.params;
    const studentId = req.user.studentId;

    // Check if student is blocked
    const [student] = await pool.query("SELECT Status FROM Student WHERE StudentID = ?", [studentId]);
    if (!student.length || student[0].Status === 'Blocked') {
      return res.status(403).json({ message: "Student account is blocked" });
    }

    // Check if already enrolled
    const [exists] = await pool.query(
      "SELECT EnrollmentID FROM Enrollment WHERE StudentID = ? AND CourseID = ?",
      [studentId, courseId]
    );
    if (exists.length) {
      return res.status(409).json({ message: "Already enrolled in this course" });
    }

    // Verify course exists and is published
    const [course] = await pool.query(
      "SELECT CourseID, Status FROM Course WHERE CourseID = ?",
      [courseId]
    );
    if (!course.length) return res.status(404).json({ message: "Course not found" });
    if (course[0].Status !== 'Published') {
      return res.status(400).json({ message: "Course is not published yet" });
    }

    const [result] = await pool.query(
      "INSERT INTO Enrollment (StudentID, CourseID, Status) VALUES (?, ?, 'Active')",
      [studentId, courseId]
    );
    res.status(201).json({
      EnrollmentID: result.insertId,
      message: "Enrolled in course successfully",
      CourseID: courseId
    });
  } catch (e) { 
    next(e);
  }
}

// GET student's enrolled courses
export async function getStudentCourses(req, res, next) {
  try {
    const studentId = req.user.studentId;

    const [courses] = await pool.query(
      `SELECT c.CourseID, c.Title, c.Description, c.Category, c.Level, c.ThumbnailURL, 
              e.EnrollmentID, e.ProgressPercentage, e.Status as EnrollmentStatus, e.EnrollDate,
              t.FullName AS TeacherName,
              (SELECT COUNT(*) FROM Section WHERE CourseID = c.CourseID) AS SectionCount
       FROM Course c 
       JOIN Enrollment e ON c.CourseID = e.CourseID 
       JOIN Teacher t ON c.TeacherID = t.TeacherID 
       WHERE e.StudentID = ? 
       ORDER BY e.EnrollDate DESC`,
      [studentId]
    );
    res.json(courses);
  } catch (e) { 
    next(e);
  }
}

// GET course enrollments (teacher view)
export async function getCourseEnrollments(req, res, next) {
  try {
    const { courseId } = req.params;
    const teacherId = req.user.teacherId;

    // Verify course belongs to teacher
    const [course] = await pool.query(
      "SELECT TeacherID FROM Course WHERE CourseID = ?",
      [courseId]
    );
    if (!course.length || course[0].TeacherID !== teacherId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const [enrollments] = await pool.query(
      `SELECT e.EnrollmentID, e.StudentID, e.EnrollDate, e.ProgressPercentage, e.Status, e.CompletionDate,
              s.FullName, s.Email, s.LastActiveDate
       FROM Enrollment e 
       JOIN Student s ON e.StudentID = s.StudentID 
       WHERE e.CourseID = ? 
       ORDER BY e.EnrollDate DESC`,
      [courseId]
    );
    res.json(enrollments);
  } catch (e) { 
    next(e);
  }
}

// DELETE unenroll student (student or teacher)
export async function unenrollCourse(req, res, next) {
  try {
    const { enrollmentId } = req.params;
    const isStudent = req.user.studentId !== undefined;
    const isTeacher = req.user.teacherId !== undefined;

    if (isStudent) {
      // Student can only unenroll themselves
      const [enrollment] = await pool.query(
        "SELECT StudentID FROM Enrollment WHERE EnrollmentID = ?",
        [enrollmentId]
      );
      if (!enrollment.length || enrollment[0].StudentID !== req.user.studentId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
    } else if (isTeacher) {
      // Teacher can unenroll students from their courses
      const [enrollment] = await pool.query(
        `SELECT e.EnrollmentID, c.TeacherID 
         FROM Enrollment e 
         JOIN Course c ON e.CourseID = c.CourseID 
         WHERE e.EnrollmentID = ?`,
        [enrollmentId]
      );
      if (!enrollment.length || enrollment[0].TeacherID !== req.user.teacherId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
    }

    await pool.query("DELETE FROM Enrollment WHERE EnrollmentID = ?", [enrollmentId]);
    res.json({ ok: true, message: "Unenrolled successfully" });
  } catch (e) { 
    next(e);
  }
}
