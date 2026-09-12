# AcademiaAI - Entity Relationship (ER) Diagram & Data Dictionary

This document details the relational database architecture designed for **Oracle Database 19c / 21c / 23ai** and enterprise student management standards.

---

## Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--|| STUDENTS : "authenticates"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ AI_GENERATIONS : "initiates"
    STUDENTS ||--o{ SUBJECTS : "enrolled_in"
    STUDENTS ||--o{ ASSIGNMENTS : "owns"
    STUDENTS ||--o{ EXAMS : "attends"
    STUDENTS ||--o{ ATTENDANCE : "tracked_for"
    STUDENTS ||--o{ GRADES : "earns"
    STUDENTS ||--o{ STUDY_PLANS : "generates"
    STUDENTS ||--o{ QUIZZES : "attempts"
    STUDENTS ||--o{ NOTES : "creates"
    
    SUBJECTS ||--o{ TIMETABLE : "scheduled_in"
    SUBJECTS ||--o{ ASSIGNMENTS : "categorizes"
    SUBJECTS ||--o{ EXAMS : "assesses"
    SUBJECTS ||--o{ ATTENDANCE : "measures"
    SUBJECTS ||--o{ GRADES : "evaluates"

    QUIZZES ||--o{ QUIZ_RESULTS : "contains"

    USERS {
        VARCHAR2(64) id PK
        VARCHAR2(255) email UK
        VARCHAR2(255) password_hash
        VARCHAR2(20) role "STUDENT / ADMIN"
        VARCHAR2(20) status "ACTIVE / INACTIVE"
        TIMESTAMP created_at
    }

    STUDENTS {
        VARCHAR2(64) id PK
        VARCHAR2(64) user_id FK
        VARCHAR2(150) full_name
        VARCHAR2(50) student_id_number
        VARCHAR2(200) university
        VARCHAR2(200) degree
        NUMBER academic_year
        NUMBER current_semester
        NUMBER target_gpa
        VARCHAR2(500) avatar_url
    }

    SUBJECTS {
        VARCHAR2(64) id PK
        VARCHAR2(64) student_id FK
        VARCHAR2(30) code
        VARCHAR2(150) name
        VARCHAR2(120) lecturer
        NUMBER credits
        NUMBER semester
        VARCHAR2(10) color_hex
        NUMBER is_weak_subject
    }

    TIMETABLE {
        VARCHAR2(64) id PK
        VARCHAR2(64) subject_id FK
        VARCHAR2(15) day_of_week
        VARCHAR2(10) start_time
        VARCHAR2(10) end_time
        VARCHAR2(100) location
        VARCHAR2(30) class_type
    }

    ASSIGNMENTS {
        VARCHAR2(64) id PK
        VARCHAR2(64) student_id FK
        VARCHAR2(64) subject_id FK
        VARCHAR2(200) title
        CLOB description
        TIMESTAMP due_date
        VARCHAR2(15) priority "Low/Medium/High"
        VARCHAR2(20) status "Pending/In Progress/Completed"
        NUMBER weightage
    }

    EXAMS {
        VARCHAR2(64) id PK
        VARCHAR2(64) student_id FK
        VARCHAR2(64) subject_id FK
        VARCHAR2(50) exam_type
        TIMESTAMP exam_date
        VARCHAR2(100) location
        NUMBER weightage
        VARCHAR2(20) status
    }

    ATTENDANCE {
        VARCHAR2(64) id PK
        VARCHAR2(64) student_id FK
        VARCHAR2(64) subject_id FK
        NUMBER total_classes
        NUMBER attended_classes
        NUMBER minimum_required_pct "Configurable rule (e.g. 80%)"
    }

    GRADES {
        VARCHAR2(64) id PK
        VARCHAR2(64) student_id FK
        VARCHAR2(64) subject_id FK
        NUMBER semester
        VARCHAR2(5) letter_grade
        NUMBER grade_point
        NUMBER credits
    }

    STUDY_PLANS {
        VARCHAR2(64) id PK
        VARCHAR2(64) student_id FK
        VARCHAR2(200) title
        TIMESTAMP target_exam_date
        NUMBER available_hours_per_day
        CLOB plan_data "JSON formatted schedule & tasks"
        VARCHAR2(20) status
    }

    QUIZZES {
        VARCHAR2(64) id PK
        VARCHAR2(64) student_id FK
        VARCHAR2(100) subject_name
        VARCHAR2(200) topic
        VARCHAR2(20) difficulty
        NUMBER total_questions
        NUMBER score
        NUMBER completed
    }

    QUIZ_RESULTS {
        VARCHAR2(64) id PK
        VARCHAR2(64) quiz_id FK
        CLOB question_text
        VARCHAR2(500) option_a
        VARCHAR2(500) option_b
        VARCHAR2(500) option_c
        VARCHAR2(500) option_d
        VARCHAR2(5) correct_option
        VARCHAR2(5) selected_option
        CLOB explanation
        NUMBER is_correct
    }

    NOTES {
        VARCHAR2(64) id PK
        VARCHAR2(64) student_id FK
        VARCHAR2(200) title
        CLOB original_content
        CLOB summary_content
        CLOB key_points
        CLOB important_terms
        CLOB exam_tips
    }
```

---

## Key Relational Design Principles Implemented

1. **Third Normal Form (3NF)**: Redundancy is minimized. User authentication is isolated from Student personal/academic attributes.
2. **Cascading Integrity**: Foreign keys define `ON DELETE CASCADE` so deleting a user or subject cleans up dependent schedules, attendance records, and assignments cleanly.
3. **Indexing Strategy**: B-Tree indexes on `student_id`, `subject_id`, `due_date`, and `exam_date` guarantee rapid query execution even with tens of thousands of student records.
4. **Data Verification Constraints**: `CHECK` constraints on GPA bounds (0.00 - 4.00), attendance counts (`attended <= total`), and enum sets (`status`, `priority`).
