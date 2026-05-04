import jwt from "jsonwebtoken";

// Verify JWT and extract user info
export function isAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "No token provided" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// Verify user is a teacher/instructor
export function isInstructor(req, res, next) {
  try {
    if (!req.user || !req.user.teacherId) {
      return res.status(403).json({ message: "Unauthorized - Teacher access required" });
    }
    next();
  } catch (e) {
    return res.status(403).json({ message: "Forbidden" });
  }
}

// Verify user is a student
export function isStudent(req, res, next) {
  try {
    if (!req.user || !req.user.studentId) {
      return res.status(403).json({ message: "Unauthorized - Student access required" });
    }
    next();
  } catch (e) {
    return res.status(403).json({ message: "Forbidden" });
  }
}

// Verify user is an admin
export function isAdmin(req, res, next) {
  try {
    if (!req.user || !req.user.adminId) {
      return res.status(403).json({ message: "Unauthorized - Admin access required" });
    }
    next();
  } catch (e) {
    return res.status(403).json({ message: "Forbidden" });
  }
}
