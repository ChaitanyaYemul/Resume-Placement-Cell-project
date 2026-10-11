// Run: mongosh --file database/mongodb/sample-data.js
db = db.getSiblingDB("placement_cell");
const now = new Date();

db.resumes.deleteMany({ student_id: { $in: [1, 2, 3, 4, 5] } });

db.resumes.insertMany([
  { student_id: 1, summary: "Aspiring backend developer",
    skills: ["Java", "SQL", "HTML", "CSS"],
    education: [{ degree: "B.Tech", branch: "Computer Engineering", institute: "Sample College", cgpa: 8.4, start_year: 2023, end_year: 2027 }],
    projects: [{ title: "Student Management System", technologies: ["Java", "MySQL"], description: "College DBMS project" }],
    certifications: ["Database Management Systems"], achievements: ["Hackathon finalist"],
    created_at: now, updated_at: now },
  { student_id: 2, summary: "Frontend enthusiast",
    skills: ["React", "JavaScript", "CSS", "HTML"],
    education: [{ degree: "B.Tech", branch: "Computer Engineering", institute: "Sample College", cgpa: 7.9, start_year: 2023, end_year: 2027 }],
    projects: [{ title: "Portfolio Website", technologies: ["React", "CSS"], description: "Personal site" }],
    certifications: ["Web Development"], achievements: [],
    created_at: now, updated_at: now },
  { student_id: 3, summary: "Data and Python learner",
    skills: ["Python", "SQL", "Pandas"],
    education: [{ degree: "B.Tech", branch: "Information Technology", institute: "Sample College", cgpa: 8.1, start_year: 2023, end_year: 2027 }],
    projects: [{ title: "Sales Dashboard", technologies: ["Python", "SQL"], description: "Analytics project" }],
    certifications: ["Python for Data Science"], achievements: ["College coding contest winner"],
    created_at: now, updated_at: now },
  { student_id: 4, summary: "Full stack beginner",
    skills: ["Node.js", "Express", "MongoDB", "JavaScript"],
    education: [{ degree: "B.Tech", branch: "Computer Engineering", institute: "Sample College", cgpa: 6.8, start_year: 2023, end_year: 2027 }],
    projects: [{ title: "Chat App", technologies: ["Node.js", "MongoDB"], description: "Realtime chat" }],
    certifications: [], achievements: [],
    created_at: now, updated_at: now },
  { student_id: 5, summary: "C++ and problem solving",
    skills: ["C++", "Java", "SQL"],
    education: [{ degree: "B.Tech", branch: "Computer Engineering", institute: "Sample College", cgpa: 9.0, start_year: 2023, end_year: 2027 }],
    projects: [{ title: "Library System", technologies: ["C++"], description: "Console app" }],
    certifications: ["DSA Certification"], achievements: ["Top 10 in college contest"],
    created_at: now, updated_at: now }
]);

print("Inserted resumes: " + db.resumes.countDocuments());