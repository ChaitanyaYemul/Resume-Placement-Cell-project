const mongoose = require("mongoose");
const { Schema } = mongoose;

const educationSchema = new Schema({
  degree: { type: String, required: true, trim: true },
  branch: { type: String, trim: true },
  institute: { type: String, trim: true },
  cgpa: { type: Number, min: 0, max: 10 },
  start_year: Number,
  end_year: Number
}, { _id: false });

const projectSchema = new Schema({
  title: { type: String, required: true, trim: true },
  technologies: { type: [String], default: [] },
  description: { type: String, trim: true },
  link: { type: String, trim: true }
}, { _id: false });

const resumeSchema = new Schema({
  student_id: { type: Number, required: true, unique: true, min: 1 },
  summary: { type: String, maxlength: 500, trim: true },
  skills: { type: [String], default: [] },
  education: { type: [educationSchema], default: [] },
  projects: { type: [projectSchema], default: [] },
  certifications: { type: [String], default: [] },
  achievements: { type: [String], default: [] }
}, {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  versionKey: false
});

resumeSchema.index({ skills: 1 });

module.exports = mongoose.model("Resume", resumeSchema, "resumes");