const Resume = require("../models/resumeModel");

const ALLOWED_FIELDS = ["summary", "skills", "education", "projects", "certifications", "achievements"];

class ServiceError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// Blocks NoSQL operator injection such as {"$ne": ""}
function hasUnsafeKeys(value) {
  if (Array.isArray(value)) return value.some(hasUnsafeKeys);
  if (value && typeof value === "object") {
    return Object.entries(value).some(
      ([key, val]) => key.startsWith("$") || key.includes(".") || hasUnsafeKeys(val)
    );
  }
  return false;
}

function pickAllowed(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ServiceError("Request body must be a JSON object", 400);
  }
  if (hasUnsafeKeys(body)) throw new ServiceError("Invalid keys in payload", 400);
  const data = {};
  for (const field of ALLOWED_FIELDS) {
    if (body[field] !== undefined) data[field] = body[field];
  }
  return data;
}

exports.getByStudentId = async (studentId) => {
  const resume = await Resume.findOne({ student_id: studentId }).lean();
  if (!resume) throw new ServiceError("Resume not found", 404);
  return resume;
};

exports.create = async (studentId, body) => {
  // TODO(M1): once the MySQL layer is merged, verify studentId exists in `students` first
  const data = pickAllowed(body);
  try {
    return await Resume.create({ ...data, student_id: studentId });
  } catch (err) {
    if (err.code === 11000) throw new ServiceError("Resume already exists for this student", 409);
    throw err;
  }
};

exports.update = async (studentId, body) => {
  const data = pickAllowed(body);
  const resume = await Resume.findOneAndUpdate(
    { student_id: studentId },
    { $set: data },
    { new: true, runValidators: true }
  ).lean();
  if (!resume) throw new ServiceError("Resume not found", 404);
  return resume;
};

exports.remove = async (studentId) => {
  const resume = await Resume.findOneAndDelete({ student_id: studentId });
  if (!resume) throw new ServiceError("Resume not found", 404);
};