// Run from project root:  mongosh --file database/mongodb/collections.js
db = db.getSiblingDB("placement_cell");

if (!db.getCollectionNames().includes("resumes")) {
  db.createCollection("resumes", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["student_id"],
        properties: {
          student_id: { bsonType: "number", minimum: 1,
            description: "MySQL students.student_id" },
          summary: { bsonType: "string", maxLength: 500 },
          skills: { bsonType: "array", items: { bsonType: "string" } },
          education: {
            bsonType: "array",
            items: {
              bsonType: "object",
              required: ["degree"],
              properties: {
                degree: { bsonType: "string" },
                branch: { bsonType: "string" },
                institute: { bsonType: "string" },
                cgpa: { bsonType: "number", minimum: 0, maximum: 10 },
                start_year: { bsonType: "number" },
                end_year: { bsonType: "number" }
              }
            }
          },
          projects: {
            bsonType: "array",
            items: {
              bsonType: "object",
              required: ["title"],
              properties: {
                title: { bsonType: "string" },
                technologies: { bsonType: "array", items: { bsonType: "string" } },
                description: { bsonType: "string" },
                link: { bsonType: "string" }
              }
            }
          },
          certifications: { bsonType: "array", items: { bsonType: "string" } },
          achievements: { bsonType: "array", items: { bsonType: "string" } },
          created_at: { bsonType: "date" },
          updated_at: { bsonType: "date" }
        }
      }
    }
  });
}

db.resumes.createIndex({ student_id: 1 }, { unique: true });
db.resumes.createIndex({ skills: 1 });

print("resumes collection ready");