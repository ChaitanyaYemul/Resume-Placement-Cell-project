// Run: mongosh --file database/mongodb/queries.js
db = db.getSiblingDB("placement_cell");
const show = (label, v) => { print("\n== " + label); printjson(v); };

// CREATE
db.resumes.deleteOne({ student_id: 99 });
db.resumes.insertOne({ student_id: 99, summary: "Demo", skills: ["Python"], education: [],
  projects: [], certifications: [], achievements: [], created_at: new Date(), updated_at: new Date() });

// READ
show("One resume", db.resumes.findOne({ student_id: 1 }));
show("Students with Java", db.resumes.find({ skills: "Java" }, { _id: 0, student_id: 1, skills: 1 }).toArray());
show("Java AND SQL ($all)", db.resumes.find({ skills: { $all: ["Java", "SQL"] } }, { _id: 0, student_id: 1 }).toArray());
show("React OR Node.js ($in)", db.resumes.find({ skills: { $in: ["React", "Node.js"] } }, { _id: 0, student_id: 1 }).toArray());

// UPDATE
db.resumes.updateOne({ student_id: 1 }, { $set: { summary: "Backend developer in training" }, $currentDate: { updated_at: true } });
db.resumes.updateOne({ student_id: 1 }, { $addToSet: { skills: "Docker" } });            // add if missing
db.resumes.updateOne({ student_id: 1 }, { $push: { achievements: "Dean's list" } });     // append
db.resumes.updateOne({ student_id: 1 }, { $pull: { skills: "HTML" } });                  // remove value
db.resumes.updateOne({ student_id: 1 }, { $push: { projects: { title: "Placement Portal", technologies: ["React", "Node.js"], description: "DBMS mini project" } } });
show("After updates", db.resumes.findOne({ student_id: 1 }, { _id: 0, skills: 1, achievements: 1, "projects.title": 1 }));

// AGGREGATION
show("Skill frequency", db.resumes.aggregate([
  { $unwind: "$skills" },
  { $group: { _id: "$skills", students: { $sum: 1 } } },
  { $sort: { students: -1, _id: 1 } },
  { $limit: 10 }
]).toArray());

show("Projects per student", db.resumes.aggregate([
  { $project: { _id: 0, student_id: 1, project_count: { $size: "$projects" } } }
]).toArray());

// DELETE
db.resumes.deleteOne({ student_id: 99 });
print("\nDone");
