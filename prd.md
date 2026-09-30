# PRD — Web-Based Resume and Placement Management System Using MySQL and MongoDB

| Field | Value |
|---|---|
| Repository | `Resume-Placement-Cell-project` |
| Course | Database Management Systems (DBMS) |
| Document type | Product Requirements Document + Build Guide |
| Team size | 4 members |
| Version | 1.0 |
| Status | Architecture finalized; schema + ER diagram are the next deliverable |

---

## 1. Overview

### 1.1 Problem
College placement activity (student data, resumes, company visits, job openings, applications, interviews, offers) is usually tracked in spreadsheets and emails. This causes duplicate data, missed deadlines, no eligibility enforcement and no analytics.

### 1.2 Solution
A web application where:
- **Students** build a resume, browse jobs, check eligibility, apply, and track applications, interviews and offers.
- **Admin / Placement Officer** manages students, companies, jobs, placement drives, applications, interviews, placements and analytics.

### 1.3 Key design decision
**Companies are NOT users.** They never register or log in. Company, job and drive records are created and maintained only by the Admin.

### 1.4 Dual-database rationale

| Database | Used for | Why |
|---|---|---|
| MySQL | users, students, companies, drives, jobs, applications, interviews, placements, history | Structured, relational, needs transactions, constraints, procedures, triggers, views, privileges |
| MongoDB | resumes | Flexible documents with arrays and embedded objects (skills, projects, certifications, education, achievements) |

### 1.5 Goals
1. Working end-to-end placement workflow for two roles.
2. Cover the full DBMS syllabus (Units 1 to 6) through real features.
3. Clean separation of work across 4 members with a frozen schema/API contract.

### 1.6 Non-goals (out of scope)
- Company login or company self-service portal.
- Email/SMS notifications, payment, video interviews.
- Resume PDF parsing or AI scoring.
- Mobile app.

### 1.7 Assumptions
- One college, one placement cell, one admin team.
- CGPA is the main eligibility filter (plus active backlogs and deadline).
- Project runs locally or on a single small host; Unit 6 (distributed/parallel DB) is covered as documentation and design, not a live cluster.

---

## 2. Users and Permissions

| Role | How created | Capabilities |
|---|---|---|
| STUDENT | Self-registration (`/auth/register/student`) | Own profile, own resume, browse jobs, apply, track own applications, view own interviews and placement |
| ADMIN | Seeded in DB (`04_seed.sql`) or inserted by an existing admin | Everything on students, companies, jobs, drives, applications, interviews, placements, analytics |

### 2.1 Permission matrix

| Feature | Student | Admin |
|---|:-:|:-:|
| Register / login / change password | Yes | Login only |
| View/edit own profile | Yes | No |
| View any student | No | Yes |
| Activate/deactivate student | No | Yes |
| Create/read/update/delete own resume | Yes | No |
| View any resume | No | Yes (read-only) |
| CRUD companies | No | Yes |
| CRUD jobs, open/close job | No | Yes |
| Browse open jobs | Yes | Yes |
| CRUD drives, change drive status | No | Yes |
| Apply to job | Yes | No |
| View own applications | Yes | No |
| Review/shortlist/reject applications | No | Yes |
| Schedule interview, record result | No | Yes |
| View own interviews | Yes | No |
| Create/update placements | No | Yes |
| View own placement | Yes | No |
| Analytics and dashboard | No | Yes |

---

## 3. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18 + JavaScript, Vite | SPA UI |
| Routing | react-router-dom v6 | Client routes, guarded routes |
| HTTP client | axios | API calls with interceptors |
| Styling | HTML5, CSS3 (CSS Modules or plain CSS) | UI |
| Backend | Node.js 20 LTS, Express 4 | REST API |
| MySQL driver | `mysql2` (promise API, connection pool) | SQL, stored procedures, transactions |
| MongoDB driver | `mongoose` | Resume schema + CRUD |
| Auth | `jsonwebtoken`, `bcrypt`, `cookie-parser` | JWT in httpOnly cookie, password hashing |
| Validation | `joi` (or `zod`) | Request validation |
| Security | `helmet`, `cors`, `express-rate-limit` | Headers, CORS, rate limiting |
| Logging | `morgan` | HTTP logs |
| Config | `dotenv` | Environment variables |
| Dev tools | `nodemon`, `eslint`, `prettier` | Developer experience |
| API testing | Postman | Collection stored in `/postman` |
| Version control | Git + GitHub | Branch-per-member workflow |
| Databases | MySQL 8.x, MongoDB 6+/7 | Data stores |

---

## 4. System Architecture

```text
                    WEB APPLICATION
                          |
                    React Frontend (Vite)
                          |
                    REST API / JSON  (/api/v1)
                          |
                  Node.js + Express
         (routes -> middleware -> controllers -> services)
                          |
             +------------+------------+
             |                         |
           MySQL                   MongoDB
      (mysql2 pool)              (mongoose)
             |                         |
     Relational Data            Resume Documents
```

### 4.1 Backend layering

| Layer | Folder | Responsibility |
|---|---|---|
| Route | `routes/` | URL + method + middleware chain |
| Middleware | `middleware/` | JWT auth, role check, error handling |
| Controller | `controllers/` | Parse request, call service, send response |
| Service | `services/` | Business logic, transactions, calling procedures |
| Model | `models/` | Mongoose resume schema |
| Config | `config/` | MySQL pool, Mongo connection |
| Utils | `utils/` | Validators, response helper |

### 4.2 Cross-database link
MongoDB has no foreign keys. `resumes.student_id` stores the MySQL `students.student_id`.

| Rule | Detail |
|---|---|
| Source of truth for CGPA, branch, graduation year | MySQL `students` (used for eligibility) |
| Resume `education[].cgpa` | Informational only, never used for eligibility |
| Creating a resume | Service verifies `student_id` exists in MySQL first |
| Deactivating a student | Resume is kept (soft state), not deleted |
| One resume per student | Unique index on `student_id` in MongoDB |

---

## 5. Repository Structure

```text
Resume-Placement-Cell-project/
│
├── frontend/
├── backend/
├── database/
├── docs/
├── postman/
├── README.md
└── .gitignore
```

### 5.1 Backend

```text
backend/
├── config/
│   ├── mysql.js              # mysql2 pool
│   └── mongodb.js            # mongoose connect
├── controllers/
│   ├── authController.js
│   ├── studentController.js
│   ├── resumeController.js
│   ├── adminController.js
│   ├── companyController.js
│   ├── jobController.js
│   ├── driveController.js
│   ├── applicationController.js
│   ├── interviewController.js
│   ├── placementController.js
│   └── analyticsController.js
├── routes/
│   ├── authRoutes.js
│   ├── studentRoutes.js
│   ├── resumeRoutes.js
│   ├── adminRoutes.js
│   ├── companyRoutes.js
│   ├── jobRoutes.js
│   ├── driveRoutes.js
│   ├── applicationRoutes.js
│   ├── interviewRoutes.js
│   ├── placementRoutes.js
│   └── analyticsRoutes.js
├── middleware/
│   ├── authMiddleware.js     # verify JWT, attach req.user
│   ├── roleMiddleware.js     # requireRole('ADMIN')
│   └── errorMiddleware.js    # central error handler
├── services/
│   ├── applicationService.js # calls apply_for_job, status transitions
│   ├── placementService.js
│   └── analyticsService.js
├── models/
│   └── resumeModel.js
├── utils/
│   ├── validation.js
│   └── response.js
├── app.js                    # express app, middleware, route mounting
├── server.js                 # DB connect + listen
├── .env.example
└── package.json
```

### 5.2 Frontend

```text
frontend/
└── src/
    ├── components/
    │   ├── Navbar.jsx
    │   ├── Sidebar.jsx
    │   ├── Button.jsx
    │   ├── Modal.jsx
    │   ├── FormInput.jsx
    │   ├── DataTable.jsx
    │   ├── DashboardCard.jsx
    │   ├── JobCard.jsx
    │   ├── StatusBadge.jsx
    │   └── LoadingSpinner.jsx
    ├── pages/
    │   ├── auth/      Login.jsx, Register.jsx
    │   ├── student/   Dashboard.jsx, Profile.jsx, Resume.jsx, ResumeBuilder.jsx,
    │   │              Jobs.jsx, JobDetails.jsx, Applications.jsx
    │   └── admin/     Dashboard.jsx, Students.jsx, Companies.jsx, Jobs.jsx, Drives.jsx,
    │                  Applications.jsx, Interviews.jsx, Placements.jsx, Analytics.jsx
    ├── services/
    │   ├── api.js                  # axios instance, withCredentials, interceptors
    │   ├── authService.js
    │   ├── jobService.js
    │   ├── applicationService.js
    │   ├── resumeService.js
    │   └── analyticsService.js
    ├── context/AuthContext.jsx
    ├── routes/AppRoutes.jsx        # public / student / admin guarded routes
    ├── App.jsx
    └── main.jsx
```

### 5.3 Database

```text
database/
├── mysql/
│   ├── 01_schema.sql             # CREATE TABLE
│   ├── 02_constraints.sql        # FK, CHECK, UNIQUE (if split from schema)
│   ├── 03_indexes.sql
│   ├── 04_seed.sql               # admin, students, companies, jobs, apps
│   ├── 05_queries.sql            # syllabus query showcase
│   ├── 06_procedures.sql
│   ├── 07_functions.sql
│   ├── 08_triggers.sql
│   ├── 09_views.sql
│   ├── 10_roles_privileges.sql
│   └── 11_transactions.sql
└── mongodb/
    ├── collections.js            # create collection + validator + indexes
    ├── sample-data.js
    └── queries.js
```

### 5.4 Docs

```text
docs/
├── ER-Diagram/
├── Normalization/
├── Relational-Algebra/
├── SQL/
├── Transactions/
├── MongoDB/
├── Data-Warehouse/
└── Distributed-DB/
```

---

## 6. Functional Requirements

### 6.1 Student module

| ID | Requirement | Acceptance criteria |
|---|---|---|
| S-01 | Register | Email unique, password min 8 chars, PRN unique, CGPA 0 to 10; creates `users` + `students` rows in one transaction |
| S-02 | Login/logout | Valid credentials set httpOnly JWT cookie; logout clears it; deactivated users cannot log in |
| S-03 | Manage profile | Edit name, phone, branch, graduation year, CGPA, backlogs |
| S-04 | Build resume | Add/edit/remove education, skills, projects, certifications, achievements |
| S-05 | Browse jobs | List only `OPEN` jobs with deadline in the future; search + filter by company, type, min package |
| S-06 | Check eligibility | Job details page shows Eligible / Not eligible with reason (CGPA, backlogs, deadline, closed, already applied) |
| S-07 | Apply | Calls `apply_for_job`; clear error message per failed check |
| S-08 | Track applications | List with status badge and status history |
| S-09 | View interviews | Rounds, date, mode, venue/link, result |
| S-10 | View placement | Company, role, package, joining date |
| S-11 | Withdraw application | Allowed only while status is `APPLIED` or `SHORTLISTED` |

### 6.2 Admin module

| ID | Area | Requirement |
|---|---|---|
| A-01 | Students | List, search, view, activate/deactivate |
| A-02 | Companies | Add, edit, delete (blocked if jobs exist), view |
| A-03 | Jobs | Create, edit, delete (blocked if applications exist), open/close, view applicants |
| A-04 | Drives | Create, update, cancel, complete; link jobs to a drive |
| A-05 | Applications | Filter by job/status, review, shortlist, reject, update status |
| A-06 | Interviews | Schedule rounds, edit, record PASSED/FAILED |
| A-07 | Placements | Create from a SELECTED application, edit package/dates |
| A-08 | Analytics | Branch-wise, company-wise, package stats, year-wise, application stats |
| A-09 | Dashboard | Totals: students, companies, open jobs, applications, placed students, placement % |

---

## 7. Application Flow

### 7.1 End-to-end business flow

```text
ADMIN
  |
  +-- Add Company
  +-- Create Placement Drive
  +-- Create Job (linked to company and drive)
        |
        v
     STUDENT
        |
   Register -> Login -> Complete Profile -> Build Resume
        |
   Browse Jobs -> Check Eligibility -> Apply
        |
        v
   APPLICATION (status = APPLIED)
        |
        v
      ADMIN reviews
        |
    +---+---+
    |       |
 REJECTED  SHORTLISTED
             |
             v
         INTERVIEW (Round 1..N)
             |
       +-----+-----+
       |           |
  NOT_SELECTED   SELECTED
                    |
                    v
               PLACEMENT record
```

### 7.2 Application status state machine

| From | To | Who | Condition |
|---|---|---|---|
| (new) | APPLIED | Student | `apply_for_job` passes all checks |
| APPLIED | SHORTLISTED | Admin | Reviewed |
| APPLIED | REJECTED | Admin | Reviewed |
| APPLIED | WITHDRAWN | Student | Own application |
| SHORTLISTED | IN_INTERVIEW | System | First interview scheduled |
| SHORTLISTED | REJECTED | Admin | Dropped before interview |
| SHORTLISTED | WITHDRAWN | Student | Own application |
| IN_INTERVIEW | SELECTED | Admin | Final round PASSED |
| IN_INTERVIEW | NOT_SELECTED | Admin | Any round FAILED |
| SELECTED | (placement row) | Admin | `create_placement` |

Any transition not in this table is rejected by the trigger and the service layer. Every change writes a row in `application_status_history`.

### 7.3 Apply-for-job flow (server side)

```text
POST /api/v1/applications  { job_id }
   |
   +-- authMiddleware: valid JWT
   +-- roleMiddleware: STUDENT
   +-- validate body
   +-- resolve student_id from req.user.user_id
   +-- CALL apply_for_job(student_id, job_id)
          |
          1. student exists and user is active
          2. job exists
          3. job.status = 'OPEN'
          4. NOW() <= job.application_deadline
          5. student.cgpa >= job.min_cgpa
          6. student.active_backlogs <= job.max_backlogs
          7. no existing application (student_id, job_id)
          8. student not already placed (policy, see section 17)
          9. INSERT application (status APPLIED)
   +-- 201 Created  |  400/403/404/409 with reason
```

### 7.4 Authentication flow

```text
Register -> hash password (bcrypt, 10+ rounds) -> INSERT users + students (transaction)
Login    -> find user by email -> bcrypt.compare -> sign JWT {user_id, role, exp}
         -> Set-Cookie: token (httpOnly, sameSite=lax, secure in prod)
Each request -> authMiddleware reads cookie -> verifies JWT -> req.user
Frontend     -> AuthContext calls GET /auth/me on load to restore session
Logout       -> clear cookie
```

---

## 8. MySQL Design

### 8.1 Entity relationships

```text
users 1 ──── 1 students
users 1 ──── 1 admins
companies 1 ──── N placement_drives
companies 1 ──── N jobs
placement_drives 1 ──── N jobs
students N ──── M jobs   (through applications)
applications 1 ──── N interviews
applications 1 ──── 0..1 placements
applications 1 ──── N application_status_history
```

### 8.2 Tables

#### `users`
| Column | Type | Constraints |
|---|---|---|
| user_id | INT | PK, AUTO_INCREMENT |
| email | VARCHAR(150) | NOT NULL, UNIQUE |
| password_hash | VARCHAR(255) | NOT NULL |
| role | ENUM('STUDENT','ADMIN') | NOT NULL |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |

#### `students`
| Column | Type | Constraints |
|---|---|---|
| student_id | INT | PK, AUTO_INCREMENT |
| user_id | INT | NOT NULL, UNIQUE, FK → users(user_id) |
| prn | VARCHAR(20) | NOT NULL, UNIQUE |
| full_name | VARCHAR(100) | NOT NULL |
| phone | VARCHAR(15) | |
| branch | VARCHAR(50) | NOT NULL |
| graduation_year | YEAR | NOT NULL |
| cgpa | DECIMAL(4,2) | NOT NULL, CHECK (cgpa BETWEEN 0 AND 10) |
| active_backlogs | INT | NOT NULL, DEFAULT 0, CHECK (active_backlogs >= 0) |
| created_at / updated_at | TIMESTAMP | as above |

#### `admins`
| Column | Type | Constraints |
|---|---|---|
| admin_id | INT | PK, AUTO_INCREMENT |
| user_id | INT | NOT NULL, UNIQUE, FK → users(user_id) |
| full_name | VARCHAR(100) | NOT NULL |
| designation | VARCHAR(100) | DEFAULT 'Placement Officer' |

#### `companies`
| Column | Type | Constraints |
|---|---|---|
| company_id | INT | PK, AUTO_INCREMENT |
| company_name | VARCHAR(150) | NOT NULL, UNIQUE |
| industry | VARCHAR(100) | |
| location | VARCHAR(150) | |
| website | VARCHAR(200) | |
| description | TEXT | |
| contact_person | VARCHAR(100) | |
| contact_email | VARCHAR(150) | |
| created_at / updated_at | TIMESTAMP | |

#### `placement_drives`
| Column | Type | Constraints |
|---|---|---|
| drive_id | INT | PK, AUTO_INCREMENT |
| company_id | INT | NOT NULL, FK → companies(company_id) |
| drive_title | VARCHAR(200) | NOT NULL |
| drive_date | DATE | NOT NULL |
| venue | VARCHAR(200) | |
| mode | ENUM('ONLINE','OFFLINE','HYBRID') | NOT NULL |
| status | ENUM('UPCOMING','ONGOING','COMPLETED','CANCELLED') | NOT NULL, DEFAULT 'UPCOMING' |
| academic_year | VARCHAR(9) | NOT NULL (e.g. 2026-2027) |
| created_by | INT | FK → admins(admin_id) |
| created_at / updated_at | TIMESTAMP | |

#### `jobs`
| Column | Type | Constraints |
|---|---|---|
| job_id | INT | PK, AUTO_INCREMENT |
| company_id | INT | NOT NULL, FK → companies(company_id) |
| drive_id | INT | NULL, FK → placement_drives(drive_id) |
| job_title | VARCHAR(150) | NOT NULL |
| description | TEXT | |
| job_type | ENUM('FULL_TIME','INTERNSHIP','INTERN_PLUS_PPO') | NOT NULL |
| location | VARCHAR(150) | |
| package_lpa | DECIMAL(6,2) | CHECK (package_lpa >= 0) |
| min_cgpa | DECIMAL(4,2) | NOT NULL, DEFAULT 0 |
| max_backlogs | INT | NOT NULL, DEFAULT 0 |
| openings | INT | DEFAULT 1, CHECK (openings > 0) |
| application_deadline | DATETIME | NOT NULL |
| status | ENUM('OPEN','CLOSED') | NOT NULL, DEFAULT 'OPEN' |
| created_by | INT | FK → admins(admin_id) |
| created_at / updated_at | TIMESTAMP | |

#### `applications`
| Column | Type | Constraints |
|---|---|---|
| application_id | INT | PK, AUTO_INCREMENT |
| student_id | INT | NOT NULL, FK → students(student_id) |
| job_id | INT | NOT NULL, FK → jobs(job_id) |
| status | ENUM('APPLIED','SHORTLISTED','REJECTED','IN_INTERVIEW','SELECTED','NOT_SELECTED','WITHDRAWN') | NOT NULL, DEFAULT 'APPLIED' |
| remarks | VARCHAR(255) | |
| applied_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP |
| | | **UNIQUE (student_id, job_id)** |

The natural key is the composite `(student_id, job_id)`; a surrogate `application_id` is used as PK for easy referencing from interviews/placements, and the composite is kept UNIQUE.

#### `interviews`
| Column | Type | Constraints |
|---|---|---|
| interview_id | INT | PK, AUTO_INCREMENT |
| application_id | INT | NOT NULL, FK → applications(application_id) |
| round_number | INT | NOT NULL, CHECK (round_number > 0) |
| round_type | ENUM('APTITUDE','TECHNICAL','HR','GROUP_DISCUSSION') | NOT NULL |
| scheduled_at | DATETIME | NOT NULL |
| mode | ENUM('ONLINE','OFFLINE') | NOT NULL |
| venue_or_link | VARCHAR(255) | |
| result | ENUM('PENDING','PASSED','FAILED') | NOT NULL, DEFAULT 'PENDING' |
| feedback | TEXT | |
| | | **UNIQUE (application_id, round_number)** |

#### `placements`
| Column | Type | Constraints |
|---|---|---|
| placement_id | INT | PK, AUTO_INCREMENT |
| application_id | INT | NOT NULL, UNIQUE, FK → applications(application_id) |
| package_lpa | DECIMAL(6,2) | NOT NULL, CHECK (package_lpa >= 0) |
| offer_date | DATE | NOT NULL |
| joining_date | DATE | |
| created_at / updated_at | TIMESTAMP | |

Student, job and company are derived by joining through `application_id` (keeps the table in 3NF; no redundant copies).

#### `application_status_history`
| Column | Type | Constraints |
|---|---|---|
| history_id | INT | PK, AUTO_INCREMENT |
| application_id | INT | NOT NULL, FK → applications(application_id) |
| old_status | VARCHAR(20) | NULL for first row |
| new_status | VARCHAR(20) | NOT NULL |
| changed_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

### 8.3 Delete rules

| Parent → Child | Rule |
|---|---|
| users → students/admins | ON DELETE RESTRICT (use `is_active` to deactivate) |
| companies → jobs/drives | RESTRICT |
| jobs → applications | RESTRICT |
| applications → interviews/history | CASCADE |
| applications → placements | RESTRICT |

### 8.4 Indexes (`03_indexes.sql`)

| Index | Purpose |
|---|---|
| `users(email)` (unique) | Login lookup |
| `students(branch, graduation_year)` | Branch/year analytics |
| `jobs(status, application_deadline)` | Open job listing |
| `jobs(company_id)` | Company → jobs joins |
| `applications(job_id, status)` | Applicants per job |
| `applications(student_id)` | My applications |
| `interviews(application_id)` | Interviews per application |
| `placements(offer_date)` | Year-wise stats |

Run `EXPLAIN` before and after indexes and save screenshots in `docs/SQL/` for the query optimization unit.

---

## 9. MongoDB Design

### 9.1 Collection `resumes`

```javascript
{
  student_id: 101,                        // MySQL students.student_id, unique
  summary: "Aspiring software engineer",
  skills: ["C++", "Java", "SQL", "HTML", "CSS"],
  education: [
    { degree: "B.Tech", branch: "Computer Engineering",
      institute: "Example College", cgpa: 8.4, start_year: 2023, end_year: 2027 }
  ],
  projects: [
    { title: "Student Management System", technologies: ["Java", "MySQL"],
      description: "College DBMS project", link: "" }
  ],
  certifications: ["Database Management Systems", "Web Development"],
  achievements: ["Hackathon finalist"],
  created_at: ISODate(), updated_at: ISODate()
}
```

### 9.2 Rules

| Rule | Implementation |
|---|---|
| One resume per student | Unique index on `student_id` |
| Required fields | `student_id`; arrays default to `[]` |
| Validation | Mongoose schema + `$jsonSchema` validator in `collections.js` |
| Array edits | `$push`, `$pull`, `$set` for CRUD demonstration |
| Skill search (admin) | Index on `skills`; query `{ skills: { $in: [...] } }` |

### 9.3 Files
- `collections.js`: create collection, validator, indexes.
- `sample-data.js`: seed resumes matching seeded students.
- `queries.js`: insert, find, update, delete, `$push/$pull`, aggregation (skill frequency).

---

## 10. Normalization Plan

| Form | Application in this project |
|---|---|
| 1NF | All MySQL columns atomic; repeating groups (skills, projects) moved out to MongoDB arrays |
| 2NF | `applications` attributes depend on the whole key `(student_id, job_id)`, not on part of it |
| 3NF | Company data lives in `companies`, not repeated in `jobs`; placement derives student/job/company via `application_id` |
| BCNF | Document FDs per table, list candidate keys, show every determinant is a superkey (write-up in `docs/Normalization/`) |
| 4NF | Resume shows independent multivalued dependencies: `student_id ->> skill`, `student_id ->> project`, `student_id ->> certification`; stored as separate arrays rather than one cross-product table |

Also produce in `docs/Normalization/`: functional dependency list, closure, minimal cover, lossless decomposition check, dependency preservation check, relational synthesis example.

---

## 11. Database Programming Objects

### 11.1 Stored procedures (`06_procedures.sql`)

| Procedure | Purpose |
|---|---|
| `apply_for_job(p_student_id, p_job_id)` | Validates and inserts application (flow in 7.3) |
| `update_application_status(p_application_id, p_new_status, p_remarks)` | Validates transition, updates status |
| `schedule_interview(p_application_id, p_round_type, p_scheduled_at, p_mode, p_venue)` | Creates next round, moves application to IN_INTERVIEW |
| `record_interview_result(p_interview_id, p_result, p_feedback)` | Sets result; FAILED → NOT_SELECTED |
| `create_placement(p_application_id, p_package, p_offer_date, p_joining_date)` | Allowed only for SELECTED; inserts placement |

Errors use `SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '...'` so the API can map messages to HTTP codes.

### 11.2 Functions (`07_functions.sql`)

| Function | Returns |
|---|---|
| `get_student_application_count(p_student_id)` | INT |
| `calculate_placement_percentage()` | DECIMAL: placed students / total active students × 100 |
| `calculate_average_package()` | DECIMAL |
| `is_student_eligible(p_student_id, p_job_id)` | BOOLEAN, reused by eligibility UI |

### 11.3 Triggers (`08_triggers.sql`)

| Trigger | Event | Purpose |
|---|---|---|
| `trg_applications_status_history` | AFTER INSERT/UPDATE on applications | Write to `application_status_history` |
| `trg_applications_workflow_guard` | BEFORE UPDATE on applications | Reject invalid status transitions (7.2) |
| `trg_jobs_block_past_deadline_open` | BEFORE INSERT/UPDATE on jobs | Deadline must be in the future for OPEN jobs |
| `trg_placement_guard` | BEFORE INSERT on placements | Application must be SELECTED |

`updated_at` is handled with `ON UPDATE CURRENT_TIMESTAMP` on columns; add a trigger version only if you need to demonstrate it explicitly.

### 11.4 Views (`09_views.sql`)

| View | Columns / purpose |
|---|---|
| `student_application_view` | student, job, company, status, applied_at |
| `placement_summary_view` | student, branch, company, job, package, offer_date |
| `job_applicant_count_view` | job, company, total applicants, shortlisted count |
| `branch_placement_view` | branch, total students, placed, percentage (used by analytics) |

### 11.5 Roles and privileges (`10_roles_privileges.sql`)

| MySQL role | Grants |
|---|---|
| `app_admin` | SELECT, INSERT, UPDATE, DELETE on all project tables; EXECUTE on procedures |
| `app_student` | SELECT on jobs, views; EXECUTE `apply_for_job`; INSERT/UPDATE limited tables |
| `report_reader` | SELECT on views only |

Demonstrate GRANT, REVOKE and `SHOW GRANTS`.

### 11.6 Transactions (`11_transactions.sql`)

| Scenario | Shows |
|---|---|
| Student registration (users + students) | COMMIT / ROLLBACK |
| Schedule interview + update application status | Atomic multi-statement change |
| Create placement + update application | Atomicity, consistency |
| Bulk shortlist with SAVEPOINT | `SAVEPOINT` / `ROLLBACK TO SAVEPOINT` |
| Two sessions applying for last opening | Isolation levels, locking (`SELECT ... FOR UPDATE`) |

Also document ACID, transaction states, schedules, conflict and view serializability, and recovery (log-based) in `docs/Transactions/`.

### 11.7 Query showcase (`05_queries.sql`)

| Category | Examples to include |
|---|---|
| Basic | SELECT, WHERE, ORDER BY, LIMIT |
| Aggregation | COUNT, SUM, AVG, MIN, MAX with GROUP BY and HAVING |
| Joins | INNER, LEFT, multi-table (students-applications-jobs-companies) |
| Set operations | UNION; INTERSECT and EXCEPT via MySQL 8 or `IN`/`NOT IN` equivalents |
| Subqueries | IN, ANY, ALL, EXISTS, nested, correlated |
| String | UPPER, LOWER, CONCAT, LENGTH, SUBSTRING |
| Date | CURRENT_DATE, YEAR, MONTH, DATEDIFF |
| Numeric | ROUND, CEIL, FLOOR, ABS |
| Relational algebra | Write RA expression next to 5 to 6 key queries in `docs/Relational-Algebra/` |

---

## 12. REST API Specification

Base URL: `/api/v1`

### 12.1 Conventions

| Item | Convention |
|---|---|
| Format | JSON |
| Auth | httpOnly cookie `token` |
| Success envelope | `{ "success": true, "message": "...", "data": { } }` |
| Error envelope | `{ "success": false, "message": "...", "errors": [ ] }` |
| Pagination | `?page=1&limit=10`; response includes `{ total, page, limit }` |
| Dates | ISO 8601 |

| HTTP code | Meaning |
|---|---|
| 200 / 201 | OK / Created |
| 400 | Validation or business rule failed |
| 401 | Not logged in / invalid token |
| 403 | Wrong role or not allowed |
| 404 | Not found |
| 409 | Duplicate (email, application, company name) |
| 500 | Server error |

### 12.2 Endpoints

**Auth**

| Method | Path | Role | Purpose |
|---|---|---|---|
| POST | `/auth/register/student` | Public | Register student |
| POST | `/auth/login` | Public | Login, set cookie |
| POST | `/auth/logout` | Any | Clear cookie |
| GET | `/auth/me` | Any | Current user + role + profile id |
| PUT | `/auth/change-password` | Any | Change password |

**Students**

| Method | Path | Role | Purpose |
|---|---|---|---|
| GET | `/students/me` | Student | Own profile |
| PUT | `/students/me` | Student | Update profile |
| GET | `/students/:id` | Admin | Student details |
| GET | `/students/:id/applications` | Admin | Student applications |
| GET | `/students/:id/placements` | Admin | Student placements |

Admin also needs a list and activate/deactivate route: add `GET /admin/students` and `PATCH /admin/students/:id/status` (new; add to the frozen contract before coding).

**Resumes (MongoDB)**

| Method | Path | Role | Purpose |
|---|---|---|---|
| GET | `/resumes/me` | Student | Own resume |
| POST | `/resumes` | Student | Create resume |
| PUT | `/resumes/me` | Student | Update resume |
| DELETE | `/resumes/me` | Student | Delete resume |
| GET | `/resumes/student/:id` | Admin | View a student's resume |

**Companies**

| Method | Path | Role |
|---|---|---|
| GET | `/admin/companies` | Admin |
| POST | `/admin/companies` | Admin |
| GET | `/admin/companies/:id` | Admin |
| PUT | `/admin/companies/:id` | Admin |
| DELETE | `/admin/companies/:id` | Admin |

**Jobs**

| Method | Path | Role | Purpose |
|---|---|---|---|
| GET | `/admin/jobs` | Admin | All jobs |
| POST | `/admin/jobs` | Admin | Create |
| PUT | `/admin/jobs/:id` | Admin | Update |
| DELETE | `/admin/jobs/:id` | Admin | Delete |
| PATCH | `/admin/jobs/:id/status` | Admin | Open/close |
| GET | `/jobs` | Student | Open jobs |
| GET | `/jobs/:id` | Student | Job details + eligibility flag |

**Placement drives**

| Method | Path | Role |
|---|---|---|
| GET | `/admin/drives` | Admin |
| POST | `/admin/drives` | Admin |
| PUT | `/admin/drives/:id` | Admin |
| DELETE | `/admin/drives/:id` | Admin |
| PATCH | `/admin/drives/:id/status` | Admin |

**Applications**

| Method | Path | Role | Purpose |
|---|---|---|---|
| POST | `/applications` | Student | Apply (`apply_for_job`) |
| GET | `/applications/me` | Student | Own applications |
| GET | `/applications` | Admin | Filter by job/status (new; add to contract) |
| GET | `/applications/:id` | Owner or Admin | Details + history |
| PATCH | `/applications/:id/status` | Admin | Shortlist/reject/etc. |
| DELETE | `/applications/:id` | Student | Withdraw (sets WITHDRAWN) |

**Interviews**

| Method | Path | Role |
|---|---|---|
| POST | `/interviews` | Admin |
| GET | `/interviews/:id` | Owner or Admin |
| PUT | `/interviews/:id` | Admin |
| PATCH | `/interviews/:id/result` | Admin |
| GET | `/interviews/application/:applicationId` | Owner or Admin |

**Placements**

| Method | Path | Role |
|---|---|---|
| GET | `/placements` | Admin |
| GET | `/placements/:id` | Owner or Admin |
| POST | `/placements` | Admin |
| PUT | `/placements/:id` | Admin |
| GET | `/placements/student/:id` | Owner or Admin |

**Analytics**

| Method | Path | Role |
|---|---|---|
| GET | `/admin/dashboard` | Admin |
| GET | `/analytics/placement-summary` | Admin |
| GET | `/analytics/branch-wise` | Admin |
| GET | `/analytics/company-wise` | Admin |
| GET | `/analytics/package-summary` | Admin |
| GET | `/analytics/year-wise` | Admin |
| GET | `/analytics/job-statistics` | Admin |

### 12.3 Sample payloads

`POST /auth/register/student`
```json
{
  "email": "student@college.edu",
  "password": "Str0ngPass!",
  "full_name": "Student Name",
  "prn": "PRN12345",
  "branch": "Computer Engineering",
  "graduation_year": 2027,
  "cgpa": 8.4,
  "active_backlogs": 0
}
```

`POST /applications`
```json
{ "job_id": 12 }
```
Failure example:
```json
{ "success": false, "message": "CGPA below job requirement", "errors": [] }
```

`PATCH /applications/:id/status`
```json
{ "status": "SHORTLISTED", "remarks": "Resume matches requirements" }
```

`POST /interviews`
```json
{
  "application_id": 55,
  "round_type": "TECHNICAL",
  "scheduled_at": "2027-01-15T10:00:00",
  "mode": "ONLINE",
  "venue_or_link": "https://meet.example.com/abc"
}
```

`POST /placements`
```json
{ "application_id": 55, "package_lpa": 7.5, "offer_date": "2027-02-01", "joining_date": "2027-07-01" }
```

---

## 13. Backend Details

### 13.1 Environment variables (`.env.example`)

```text
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=placement_app
MYSQL_PASSWORD=change_me
MYSQL_DATABASE=placement_cell

MONGO_URI=mongodb://localhost:27017/placement_cell

JWT_SECRET=change_me_long_random
JWT_EXPIRES_IN=1d
COOKIE_NAME=token
BCRYPT_ROUNDS=10
```

### 13.2 `app.js` middleware order
1. `helmet()`
2. `cors({ origin: CLIENT_URL, credentials: true })`
3. `express.json()`
4. `cookieParser()`
5. `morgan('dev')`
6. rate limiter on `/auth/*`
7. route mounting under `/api/v1`
8. 404 handler
9. `errorMiddleware`

### 13.3 Middleware

| File | Behavior |
|---|---|
| `authMiddleware.js` | Read cookie, verify JWT, load user, reject inactive users, set `req.user = { user_id, role }` |
| `roleMiddleware.js` | `requireRole('ADMIN')`, returns 403 otherwise |
| `errorMiddleware.js` | Maps MySQL `SIGNAL` messages and duplicate-entry errors to 400/409, hides stack traces in production |

### 13.4 Coding rules
- Always use parameterized queries (`?` placeholders). Never concatenate user input into SQL.
- Controllers stay thin; logic and transactions live in services.
- Use one connection per transaction: `getConnection → beginTransaction → commit/rollback → release`.
- All responses go through `utils/response.js`.
- Validate every body/query with Joi before the controller runs.

---

## 14. Frontend Details

### 14.1 Routes

| Path | Page | Guard |
|---|---|---|
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/student/dashboard` | Student Dashboard | Student |
| `/student/profile` | Profile | Student |
| `/student/resume` | Resume view | Student |
| `/student/resume/build` | Resume Builder | Student |
| `/student/jobs` | Jobs | Student |
| `/student/jobs/:id` | Job Details | Student |
| `/student/applications` | My Applications | Student |
| `/admin/dashboard` | Admin Dashboard | Admin |
| `/admin/students` | Students | Admin |
| `/admin/companies` | Companies | Admin |
| `/admin/jobs` | Jobs | Admin |
| `/admin/drives` | Drives | Admin |
| `/admin/applications` | Applications | Admin |
| `/admin/interviews` | Interviews | Admin |
| `/admin/placements` | Placements | Admin |
| `/admin/analytics` | Analytics | Admin |

### 14.2 State and services
- `AuthContext`: `{ user, role, loading, login(), logout() }`; calls `/auth/me` on mount.
- `ProtectedRoute` wrapper in `AppRoutes.jsx`: redirects to `/login` if unauthenticated, to the correct dashboard if role mismatches.
- `api.js`: axios instance with `baseURL`, `withCredentials: true`, response interceptor redirecting to `/login` on 401.
- Page-level state with `useState`/`useEffect`; no extra state library needed.

### 14.3 Shared components

| Component | Used for |
|---|---|
| `DataTable` | All admin lists (sort, paginate, action column) |
| `Modal` | Create/edit forms |
| `FormInput` | Labeled input with error text |
| `StatusBadge` | Colored status chip (application, job, drive, interview) |
| `JobCard` | Student job listing |
| `DashboardCard` | KPI tiles |
| `LoadingSpinner` | Loading state |
| `Navbar`, `Sidebar` | Layout by role |

### 14.4 UI states every page must handle
Loading, empty list, API error message, success confirmation, form validation errors.

---

## 15. Security Requirements

| Area | Requirement |
|---|---|
| Passwords | bcrypt hashed, never returned in any response |
| Session | JWT in httpOnly cookie, `sameSite=lax`, `secure` in production |
| Authorization | Role middleware on every `/admin/*` route; ownership check on student-scoped routes |
| SQL injection | Parameterized queries only |
| NoSQL injection | Validate resume payload; reject keys starting with `$` |
| Rate limiting | Login/register endpoints |
| DB least privilege | App connects as `placement_app` user with the roles in 11.5, not root |
| Secrets | `.env` in `.gitignore`; only `.env.example` committed |
| Input | Joi validation, length limits, email format |

---

## 16. Build Flow (Step by Step)

### Phase 0 — Setup (Member 4 leads)

| Step | Action |
|---|---|
| 0.1 | Create GitHub repo `Resume-Placement-Cell-project` manually; add all 4 members as collaborators |
| 0.2 | Clone; create folders from section 5; add `.gitignore` (node_modules, .env, build) |
| 0.3 | Branches: `main` (protected), `develop`, and `feature/<member>-<module>` |
| 0.4 | Install MySQL 8 and MongoDB; create database `placement_cell` and MySQL user `placement_app` |
| 0.5 | Commit this `prd.md` into `docs/` and README skeleton |

### Phase 1 — Design freeze (all members, before any code)

| Step | Deliverable | Output location |
|---|---|---|
| 1.1 | ER diagram | `docs/ER-Diagram/` |
| 1.2 | EER diagram (generalization of users → student/admin) | `docs/ER-Diagram/` |
| 1.3 | Relational schema | `docs/ER-Diagram/` |
| 1.4 | Functional dependencies + normalization to 3NF/BCNF | `docs/Normalization/` |
| 1.5 | `01_schema.sql` (+ constraints, indexes) | `database/mysql/` |
| 1.6 | MongoDB schema | `database/mongodb/collections.js` |
| 1.7 | API contract (section 12) agreed and committed | `docs/` + Postman collection |
| 1.8 | `04_seed.sql`, `sample-data.js` | `database/` |

**Rule:** after this phase, schema and API contract changes go through a team discussion and a single PR; individuals never change them alone.

### Phase 2 — Backend foundation (Member 4 with help from all)

```bash
cd backend
npm init -y
npm i express mysql2 mongoose bcrypt jsonwebtoken cookie-parser cors helmet morgan dotenv joi express-rate-limit
npm i -D nodemon eslint prettier
```

| Step | Action |
|---|---|
| 2.1 | `config/mysql.js` (pool) and `config/mongodb.js` |
| 2.2 | `app.js`, `server.js`, scripts: `"dev": "nodemon server.js"` |
| 2.3 | `utils/response.js`, `utils/validation.js` |
| 2.4 | `authMiddleware`, `roleMiddleware`, `errorMiddleware` |
| 2.5 | Auth routes/controller (register, login, logout, me, change-password) |
| 2.6 | Test auth in Postman; merge to `develop` |

### Phase 3 — Frontend foundation

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm i react-router-dom axios
```

| Step | Action |
|---|---|
| 3.1 | `services/api.js`, `context/AuthContext.jsx`, `routes/AppRoutes.jsx` |
| 3.2 | Shared components (`Navbar`, `Sidebar`, `FormInput`, `Button`, `Modal`, `DataTable`, `StatusBadge`, `LoadingSpinner`) |
| 3.3 | Login and Register pages wired to backend |
| 3.4 | Protected routing for student and admin layouts |

### Phase 4 — Parallel module development

| Member | Module | Build order |
|---|---|---|
| M1 | Student + Resume | 1. students API → 2. Mongoose `resumeModel` → 3. resume CRUD → 4. Profile page → 5. Resume Builder → 6. Student Dashboard → 7. `collections.js`, `queries.js`, 4NF doc |
| M2 | Admin + Companies + Jobs + Drives | 1. companies CRUD → 2. drives CRUD → 3. jobs CRUD + status → 4. student job list APIs → 5. admin pages → 6. student Jobs/JobDetails pages → 7. indexes + EXPLAIN report |
| M3 | Applications + Interviews + Placements | 1. `06_procedures.sql` (`apply_for_job` first) → 2. triggers + history → 3. application APIs + service → 4. interviews → 5. placements → 6. admin Applications/Interviews/Placements pages → 7. student Applications page → 8. `11_transactions.sql`, concurrency demo |
| M4 | Analytics + Advanced | 1. views → 2. analytics queries/APIs → 3. admin Dashboard + Analytics pages → 4. roles/privileges → 5. data warehouse + OLAP doc → 6. distributed/parallel DB doc → 7. integration and Postman collection |

Each member works on `feature/*` branches, opens PRs into `develop`, and another member reviews.

### Phase 5 — Integration (Member 4 leads)

| Step | Action |
|---|---|
| 5.1 | Merge all feature branches into `develop`; resolve route and sidebar conflicts |
| 5.2 | Run full flow manually (see 18.1) |
| 5.3 | Fix API/UI mismatches against Postman collection |
| 5.4 | Load complete seed data; verify analytics numbers against raw SQL |
| 5.5 | Merge `develop` → `main`, tag `v1.0` |

### Phase 6 — Documentation and demo

| Step | Action |
|---|---|
| 6.1 | Fill all `docs/` folders (ER, normalization, RA, SQL, transactions, MongoDB, DW, distributed) |
| 6.2 | README: overview, setup steps, env vars, seed instructions, demo credentials, screenshots |
| 6.3 | Prepare demo script (18.1) and rehearse |

### 16.1 Local run instructions (for README)

```bash
# 1. Databases
mysql -u root -p < database/mysql/01_schema.sql   # then 02..11 in order
mongosh < database/mongodb/collections.js

# 2. Backend
cd backend && cp .env.example .env && npm install && npm run dev

# 3. Frontend
cd frontend && npm install && npm run dev
```

---

## 17. Business Rules Summary

| # | Rule |
|---|---|
| BR-1 | A student can apply to a job only once |
| BR-2 | Application allowed only if job is OPEN and deadline not passed |
| BR-3 | Student CGPA must be ≥ `min_cgpa`; active backlogs ≤ `max_backlogs` |
| BR-4 | Only valid status transitions (7.2) are allowed |
| BR-5 | Placement can be created only for a SELECTED application, once per application |
| BR-6 | Company cannot be deleted while jobs or drives reference it |
| BR-7 | Deactivated users cannot log in or apply |
| BR-8 | A failed interview round moves the application to NOT_SELECTED |
| BR-9 | **Open policy:** whether a placed student may apply to more companies (default in this PRD: no, blocked in `apply_for_job`; team can relax to "allowed for higher package only") |

---

## 18. Testing and Acceptance

### 18.1 End-to-end demo scenario

1. Admin logs in, adds company "Acme", creates a drive, creates a job (min CGPA 7.0, deadline next week).
2. Student registers (CGPA 8.4), completes profile, builds resume.
3. Student opens job, sees "Eligible", applies.
4. Second student with CGPA 6.5 tries to apply and is rejected with a clear message.
5. Student tries to apply again and gets a duplicate error.
6. Admin shortlists the application; history shows both transitions.
7. Admin schedules Technical and HR rounds; records both as PASSED.
8. Admin marks SELECTED and creates a placement (7.5 LPA).
9. Student sees interviews and placement; admin dashboard and analytics show updated counts.

### 18.2 Test types

| Type | Scope | Tool |
|---|---|---|
| API tests | Every endpoint, success and failure | Postman collection |
| DB tests | Procedures, triggers, constraints with bad data | SQL scripts |
| Concurrency | Two sessions applying for same job, transaction isolation | Two MySQL sessions |
| UI smoke | Login, apply flow, admin CRUD | Manual checklist |
| Security | Student calling admin API returns 403; no cookie returns 401 | Postman |

### 18.3 Definition of done (per module)
- Endpoints match the contract and return the standard envelope.
- Validation and error cases handled.
- Frontend pages handle loading, empty and error states.
- SQL objects for the module exist in the correct numbered file.
- Postman requests added; docs for the module's syllabus topics written.
- PR reviewed by another member and merged to `develop`.

---

## 19. Team Division

| Member | Owns (tables / collections) | Backend | Frontend | DBMS focus |
|---|---|---|---|---|
| M1 | `students`, `resumes` | studentController, resumeController, studentRoutes, resumeRoutes, resumeService | Student Dashboard, Profile, Resume, Resume Builder | MongoDB, NoSQL, 4NF, multivalued dependencies |
| M2 | `admins`, `companies`, `jobs`, `placement_drives` | adminController, companyController, jobController, driveController | Admin Dashboard shell, Companies, Jobs, Drives, student Jobs/JobDetails | DDL, DML, constraints, FKs, joins, indexes, optimization |
| M3 | `applications`, `interviews`, `placements` | applicationController, interviewController, placementController, applicationService, placementService | Applications, Interviews, Placements | Nested queries, transactions, ACID, procedures, functions, triggers, concurrency, recovery |
| M4 | analytics, views, reports | analyticsController, analyticsService | Admin Dashboard KPIs, Analytics, Reports | Aggregates, GROUP BY/HAVING, views, data warehouse, OLAP, distributed and parallel DB, integration |

Shared: `users` table and auth are built in Phase 2 by M4 with review from all; `applicationStatusHistory` belongs to M3.

---

## 20. Syllabus Coverage Map

| Unit | Topics | Where covered |
|---|---|---|
| 1 | DBMS need and architecture, ER, EER, relational model, Codd's rules | `docs/ER-Diagram/`, 3-tier architecture diagram, Codd's rules mapped to MySQL |
| 2 | FDs, closure, minimal cover, decomposition, 1NF to BCNF, MVD, 4NF, synthesis | `docs/Normalization/`, section 10 |
| 3 | RA, DDL, DML, all query types, DCL, TCL, procedures, functions, triggers, assertions (via CHECK/trigger), roles, embedded and dynamic SQL | `database/mysql/01` to `11`, `docs/Relational-Algebra/`, dynamic SQL via `PREPARE/EXECUTE` demo |
| 4 | Query processing and optimization, transactions, ACID, schedules, serializability, concurrency, recovery | `docs/Transactions/`, `EXPLAIN` reports, `11_transactions.sql` |
| 5 | NoSQL, document DB, MongoDB CRUD, BASE, CAP, Big Data, Hadoop, HDFS, MapReduce, warehouse, schemas, OLAP | `database/mongodb/`, `docs/MongoDB/`, `docs/Data-Warehouse/` (star schema on placements: fact_placement with dim_student, dim_company, dim_time; OLAP roll-up/drill-down examples) |
| 6 | Distributed architecture, I/O/inter/intra-query/operation parallelism, distributed storage and query processing | `docs/Distributed-DB/` (design: fragmenting placement data by branch or year, replication, parallel aggregate example) |

---

## 21. Milestones

| Week | Milestone | Owner |
|---|---|---|
| 1 | Repo setup, ER/EER, relational schema, FDs, `01_schema.sql`, Mongo schema, API contract frozen | All |
| 2 | Backend foundation + auth + frontend foundation + seed data | M4 + all |
| 3 to 4 | Parallel module development | M1 to M4 |
| 5 | Integration, bug fixing, analytics complete | M4 + all |
| 6 | Documentation, Postman collection, demo rehearsal, final tag `v1.0` | All |

---

## 22. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Schema changes mid-development break others | Freeze after Phase 1; changes via PR with all members informed |
| Two databases get out of sync | Service-layer check on resume creation; MySQL is source of truth for eligibility fields |
| Merge conflicts in shared files (`app.js`, `AppRoutes.jsx`, `Sidebar.jsx`) | One line per module, M4 owns these files, others send PRs |
| Workload imbalance | M4 carries integration and docs, so keep M4's feature scope small |
| Transaction/concurrency demo hard to show | Prepare scripted two-session demo early (week 3) |
| Unit 5/6 topics have no live implementation | Treat as design docs with small runnable examples (star-schema queries, fragment queries) |

---

## 23. Open Decisions

| # | Decision | Default in this PRD |
|---|---|---|
| 1 | Branch-wise eligibility per job | Not included; optional extension table `job_eligible_branches(job_id, branch)` |
| 2 | Can a placed student apply again | No (BR-9) |
| 3 | Student self-withdraw | Allowed before interview |
| 4 | Admin creation | Seeded; no public admin registration |
| 5 | Resume export to PDF | Out of scope for v1 |
| 6 | Hosting | Local demo; optional deploy later (Render/Railway + Atlas/PlanetScale-style hosted DBs) |

---

## 24. Immediate Next Actions

1. Create the GitHub repository and add all members.
2. Draw the ER and EER diagrams from section 8.1.
3. Write `01_schema.sql` from section 8.2 (and `02` to `03`).
4. Write `database/mongodb/collections.js` from section 9.
5. Freeze the API contract, including the three additions flagged in section 12 (`GET /admin/students`, `PATCH /admin/students/:id/status`, `GET /applications`).
6. Each member says **"I am Member N"** in the chat to get guided on their module.
