// TEMPORARY: lets you test without login. Replace with the real authMiddleware
// from Member 4, which must also set req.user = { student_id, role }.
module.exports = (req, res, next) => {
  const role = (req.header("x-dev-role") || "STUDENT").toUpperCase();
  const studentId = Number(req.header("x-dev-student-id")) || null;
  if (role === "STUDENT" && !studentId) {
    return res.status(401).json({ success: false, message: "Missing x-dev-student-id header", errors: [] });
  }
  req.user = { student_id: studentId, role };
  next();
};