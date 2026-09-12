-- ============================================================================
-- AcademiaAI - Enterprise Oracle Relational Database Schema
-- Compatible with Oracle Database 19c, 21c, 23ai & Autonomous Database
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Drop existing tables in reverse dependency order (if recreating)
-- ----------------------------------------------------------------------------
BEGIN
  FOR t IN (
    SELECT table_name FROM user_tables 
    WHERE table_name IN (
      'NOTIFICATIONS', 'AI_GENERATIONS', 'NOTES', 'QUIZ_RESULTS', 'QUIZZES',
      'STUDY_PLANS', 'GRADES', 'ATTENDANCE', 'EXAMS', 'ASSIGNMENTS',
      'TIMETABLE', 'SUBJECTS', 'STUDENTS', 'USERS'
    )
  ) LOOP
    EXECUTE IMMEDIATE 'DROP TABLE ' || t.table_name || ' CASCADE CONSTRAINTS PURGE';
  END LOOP;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END;
/

-- ----------------------------------------------------------------------------
-- 1. USERS Table (Authentication & Access Control)
-- ----------------------------------------------------------------------------
CREATE TABLE USERS (
    id VARCHAR2(64) PRIMARY KEY,
    email VARCHAR2(255) NOT NULL UNIQUE,
    password_hash VARCHAR2(255) NOT NULL,
    role VARCHAR2(20) DEFAULT 'STUDENT' NOT NULL,
    status VARCHAR2(20) DEFAULT 'ACTIVE' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_user_role CHECK (role IN ('STUDENT', 'ADMIN', 'INSTRUCTOR')),
    CONSTRAINT chk_user_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED'))
);

COMMENT ON TABLE USERS IS 'Core identity table for platform authentication and roles';
COMMENT ON COLUMN USERS.role IS 'Role of the account: STUDENT, ADMIN, INSTRUCTOR';

-- ----------------------------------------------------------------------------
-- 2. STUDENTS Table (Student Academic Profile)
-- ----------------------------------------------------------------------------
CREATE TABLE STUDENTS (
    id VARCHAR2(64) PRIMARY KEY,
    user_id VARCHAR2(64) NOT NULL UNIQUE,
    full_name VARCHAR2(150) NOT NULL,
    student_id_number VARCHAR2(50),
    university VARCHAR2(200) DEFAULT 'University of Moratuwa / SLIIT',
    faculty VARCHAR2(150),
    degree VARCHAR2(200) DEFAULT 'BSc (Hons) in Software Engineering',
    academic_year NUMBER(2) DEFAULT 3,
    current_semester NUMBER(2) DEFAULT 1,
    target_gpa NUMBER(3,2) DEFAULT 3.80,
    avatar_url VARCHAR2(500),
    bio VARCHAR2(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_students_users FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE,
    CONSTRAINT chk_student_gpa CHECK (target_gpa BETWEEN 0.00 AND 4.00)
);

COMMENT ON TABLE STUDENTS IS 'Extended academic profile information linked to user credentials';

-- ----------------------------------------------------------------------------
-- 3. SUBJECTS Table (Course Modules)
-- ----------------------------------------------------------------------------
CREATE TABLE SUBJECTS (
    id VARCHAR2(64) PRIMARY KEY,
    student_id VARCHAR2(64) NOT NULL,
    code VARCHAR2(30) NOT NULL,
    name VARCHAR2(150) NOT NULL,
    lecturer VARCHAR2(120),
    credits NUMBER(2) DEFAULT 3 NOT NULL,
    semester NUMBER(2) DEFAULT 1 NOT NULL,
    color_hex VARCHAR2(10) DEFAULT '#4f46e5' NOT NULL,
    is_weak_subject NUMBER(1) DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_subjects_students FOREIGN KEY (student_id) REFERENCES STUDENTS(id) ON DELETE CASCADE,
    CONSTRAINT chk_subject_credits CHECK (credits > 0)
);

CREATE INDEX idx_subjects_student ON SUBJECTS(student_id);

-- ----------------------------------------------------------------------------
-- 4. TIMETABLE Table (Weekly & Daily Class Schedules)
-- ----------------------------------------------------------------------------
CREATE TABLE TIMETABLE (
    id VARCHAR2(64) PRIMARY KEY,
    subject_id VARCHAR2(64) NOT NULL,
    day_of_week VARCHAR2(15) NOT NULL,
    start_time VARCHAR2(10) NOT NULL,
    end_time VARCHAR2(10) NOT NULL,
    location VARCHAR2(100),
    class_type VARCHAR2(30) DEFAULT 'Lecture',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_timetable_subject FOREIGN KEY (subject_id) REFERENCES SUBJECTS(id) ON DELETE CASCADE,
    CONSTRAINT chk_timetable_day CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'))
);

CREATE INDEX idx_timetable_subject ON TIMETABLE(subject_id);

-- ----------------------------------------------------------------------------
-- 5. ASSIGNMENTS Table (Coursework Tracking & Deadlines)
-- ----------------------------------------------------------------------------
CREATE TABLE ASSIGNMENTS (
    id VARCHAR2(64) PRIMARY KEY,
    student_id VARCHAR2(64) NOT NULL,
    subject_id VARCHAR2(64) NOT NULL,
    title VARCHAR2(200) NOT NULL,
    description CLOB,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    priority VARCHAR2(15) DEFAULT 'Medium' NOT NULL,
    status VARCHAR2(20) DEFAULT 'Pending' NOT NULL,
    weightage NUMBER(4,1) DEFAULT 10.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_assignments_student FOREIGN KEY (student_id) REFERENCES STUDENTS(id) ON DELETE CASCADE,
    CONSTRAINT fk_assignments_subject FOREIGN KEY (subject_id) REFERENCES SUBJECTS(id) ON DELETE CASCADE,
    CONSTRAINT chk_assignment_priority CHECK (priority IN ('Low', 'Medium', 'High')),
    CONSTRAINT chk_assignment_status CHECK (status IN ('Pending', 'In Progress', 'Completed'))
);

CREATE INDEX idx_assignments_student ON ASSIGNMENTS(student_id);
CREATE INDEX idx_assignments_duedate ON ASSIGNMENTS(due_date);

-- ----------------------------------------------------------------------------
-- 6. EXAMS Table (Midterms, Finals & Live Countdowns)
-- ----------------------------------------------------------------------------
CREATE TABLE EXAMS (
    id VARCHAR2(64) PRIMARY KEY,
    student_id VARCHAR2(64) NOT NULL,
    subject_id VARCHAR2(64) NOT NULL,
    exam_type VARCHAR2(50) DEFAULT 'Midterm Exam' NOT NULL,
    exam_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR2(100),
    weightage NUMBER(4,1) DEFAULT 40.0,
    status VARCHAR2(20) DEFAULT 'Upcoming' NOT NULL,
    notes VARCHAR2(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_exams_student FOREIGN KEY (student_id) REFERENCES STUDENTS(id) ON DELETE CASCADE,
    CONSTRAINT fk_exams_subject FOREIGN KEY (subject_id) REFERENCES SUBJECTS(id) ON DELETE CASCADE,
    CONSTRAINT chk_exam_status CHECK (status IN ('Upcoming', 'Completed', 'Cancelled'))
);

CREATE INDEX idx_exams_student ON EXAMS(student_id);
CREATE INDEX idx_exams_date ON EXAMS(exam_date);

-- ----------------------------------------------------------------------------
-- 7. ATTENDANCE Table (Subject Attendance Tracker with Configurable Rules)
-- ----------------------------------------------------------------------------
CREATE TABLE ATTENDANCE (
    id VARCHAR2(64) PRIMARY KEY,
    student_id VARCHAR2(64) NOT NULL,
    subject_id VARCHAR2(64) NOT NULL,
    total_classes NUMBER(4) DEFAULT 0 NOT NULL,
    attended_classes NUMBER(4) DEFAULT 0 NOT NULL,
    minimum_required_pct NUMBER(4,1) DEFAULT 80.0 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES STUDENTS(id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_subject FOREIGN KEY (subject_id) REFERENCES SUBJECTS(id) ON DELETE CASCADE,
    CONSTRAINT chk_attendance_counts CHECK (attended_classes <= total_classes)
);

CREATE UNIQUE INDEX idx_attendance_sub_std ON ATTENDANCE(student_id, subject_id);

-- ----------------------------------------------------------------------------
-- 8. GRADES Table (GPA Calculator & Academic History)
-- ----------------------------------------------------------------------------
CREATE TABLE GRADES (
    id VARCHAR2(64) PRIMARY KEY,
    student_id VARCHAR2(64) NOT NULL,
    subject_id VARCHAR2(64) NOT NULL,
    semester NUMBER(2) NOT NULL,
    letter_grade VARCHAR2(5) NOT NULL,
    grade_point NUMBER(3,2) NOT NULL,
    credits NUMBER(2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_grades_student FOREIGN KEY (student_id) REFERENCES STUDENTS(id) ON DELETE CASCADE,
    CONSTRAINT fk_grades_subject FOREIGN KEY (subject_id) REFERENCES SUBJECTS(id) ON DELETE CASCADE,
    CONSTRAINT chk_grade_points CHECK (grade_point BETWEEN 0.00 AND 4.00)
);

CREATE INDEX idx_grades_student ON GRADES(student_id);

-- ----------------------------------------------------------------------------
-- 9. STUDY_PLANS Table (AI Generated Study Plans)
-- ----------------------------------------------------------------------------
CREATE TABLE STUDY_PLANS (
    id VARCHAR2(64) PRIMARY KEY,
    student_id VARCHAR2(64) NOT NULL,
    title VARCHAR2(200) NOT NULL,
    target_exam_date TIMESTAMP WITH TIME ZONE,
    available_hours_per_day NUMBER(3,1) DEFAULT 3.0,
    plan_data CLOB NOT NULL,
    status VARCHAR2(20) DEFAULT 'ACTIVE' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_studyplans_student FOREIGN KEY (student_id) REFERENCES STUDENTS(id) ON DELETE CASCADE
);

CREATE INDEX idx_studyplans_student ON STUDY_PLANS(student_id);

-- ----------------------------------------------------------------------------
-- 10. QUIZZES Table (AI Generated Quizzes)
-- ----------------------------------------------------------------------------
CREATE TABLE QUIZZES (
    id VARCHAR2(64) PRIMARY KEY,
    student_id VARCHAR2(64) NOT NULL,
    subject_id VARCHAR2(64),
    subject_name VARCHAR2(100) NOT NULL,
    topic VARCHAR2(200) NOT NULL,
    difficulty VARCHAR2(20) DEFAULT 'Medium',
    total_questions NUMBER(3) DEFAULT 5 NOT NULL,
    score NUMBER(3) DEFAULT 0,
    completed NUMBER(1) DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_quizzes_student FOREIGN KEY (student_id) REFERENCES STUDENTS(id) ON DELETE CASCADE
);

CREATE INDEX idx_quizzes_student ON QUIZZES(student_id);

-- ----------------------------------------------------------------------------
-- 11. QUIZ_RESULTS Table (Individual Question Answers & Feedback)
-- ----------------------------------------------------------------------------
CREATE TABLE QUIZ_RESULTS (
    id VARCHAR2(64) PRIMARY KEY,
    quiz_id VARCHAR2(64) NOT NULL,
    question_text CLOB NOT NULL,
    option_a VARCHAR2(500) NOT NULL,
    option_b VARCHAR2(500) NOT NULL,
    option_c VARCHAR2(500) NOT NULL,
    option_d VARCHAR2(500) NOT NULL,
    correct_option VARCHAR2(5) NOT NULL,
    selected_option VARCHAR2(5),
    explanation CLOB,
    is_correct NUMBER(1) DEFAULT 0 NOT NULL,
    CONSTRAINT fk_quizresults_quiz FOREIGN KEY (quiz_id) REFERENCES QUIZZES(id) ON DELETE CASCADE
);

CREATE INDEX idx_quizresults_quiz ON QUIZ_RESULTS(quiz_id);

-- ----------------------------------------------------------------------------
-- 12. NOTES Table (Lecture Notes & AI Summaries)
-- ----------------------------------------------------------------------------
CREATE TABLE NOTES (
    id VARCHAR2(64) PRIMARY KEY,
    student_id VARCHAR2(64) NOT NULL,
    subject_id VARCHAR2(64),
    title VARCHAR2(200) NOT NULL,
    original_content CLOB NOT NULL,
    summary_content CLOB,
    key_points CLOB,
    important_terms CLOB,
    exam_tips CLOB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_notes_student FOREIGN KEY (student_id) REFERENCES STUDENTS(id) ON DELETE CASCADE
);

CREATE INDEX idx_notes_student ON NOTES(student_id);

-- ----------------------------------------------------------------------------
-- 13. AI_GENERATIONS Table (Telemetry, Auditing & Token Tracking)
-- ----------------------------------------------------------------------------
CREATE TABLE AI_GENERATIONS (
    id VARCHAR2(64) PRIMARY KEY,
    user_id VARCHAR2(64) NOT NULL,
    feature_type VARCHAR2(50) NOT NULL,
    prompt_tokens NUMBER(8) DEFAULT 0,
    completion_tokens NUMBER(8) DEFAULT 0,
    model_name VARCHAR2(50) DEFAULT 'gemini-1.5-flash',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_aigen_user FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE,
    CONSTRAINT chk_aigen_feature CHECK (feature_type IN ('STUDY_PLANNER', 'NOTES_SUMMARIZER', 'QUIZ_GENERATOR', 'GPA_ADVISOR'))
);

CREATE INDEX idx_aigen_user ON AI_GENERATIONS(user_id);

-- ----------------------------------------------------------------------------
-- 14. NOTIFICATIONS Table (User Alerts & Reminders)
-- ----------------------------------------------------------------------------
CREATE TABLE NOTIFICATIONS (
    id VARCHAR2(64) PRIMARY KEY,
    user_id VARCHAR2(64) NOT NULL,
    title VARCHAR2(150) NOT NULL,
    message VARCHAR2(500) NOT NULL,
    type VARCHAR2(30) DEFAULT 'INFO',
    is_read NUMBER(1) DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE
);

CREATE INDEX idx_notif_user ON NOTIFICATIONS(user_id);

COMMIT;
