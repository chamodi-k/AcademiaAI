# 🗄️ AcademiaAI - Google Cloud Firestore Database Schema

AcademiaAI uses **Google Cloud Firestore**, a flexible, scalable NoSQL document database. This document details the collection architecture, document models, data types, relations, security rules, and query indexes.

---

## 🏛️ Firestore Collection Architecture Overview

```
Firestore Root
├── users/                (Collection: Auth identity & role)
│   └── {userId}          (Doc: email, password_hash, role, status)
├── students/             (Collection: Student profile linked to user)
│   └── {studentId}       (Doc: user_id, full_name, university, target_gpa)
├── subjects/             (Collection: Academic modules)
│   └── {subjectId}       (Doc: student_id, code, name, credits, color_hex)
├── timetable/            (Collection: Weekly schedules)
│   └── {itemId}          (Doc: subject_id, day_of_week, start_time, location)
├── assignments/          (Collection: Coursework tasks)
│   └── {assignmentId}   (Doc: student_id, subject_id, title, due_date, status)
├── exams/                (Collection: Scheduled exams & live countdowns)
│   └── {examId}          (Doc: student_id, subject_id, exam_type, exam_date)
├── attendance/           (Collection: Subject attendance & rules)
│   └── {attendanceId}    (Doc: student_id, subject_id, total, attended, minimum_pct)
├── grades/               (Collection: Academic transcripts & GPA)
│   └── {gradeId}         (Doc: student_id, subject_id, semester, grade_point)
├── study_plans/          (Collection: AI generated study schedules)
│   └── {planId}          (Doc: student_id, title, weekly_schedule, tips)
├── quizzes/              (Collection: AI interactive quizzes & questions)
│   └── {quizId}          (Doc: student_id, subject_name, questions, score)
├── notes/                (Collection: Lecture notes & AI summaries)
│   └── {noteId}          (Doc: student_id, title, summary_content, key_points)
├── notifications/        (Collection: User alerts)
│   └── {notifId}         (Doc: user_id, title, message, is_read)
└── ai_logs/              (Collection: Admin telemetry & usage tracking)
    └── {logId}           (Doc: userId, feature, timestamp)
```

---

## 📋 Detailed Collection Schemas

### 1. `users` Collection
Primary document key: `userId` (e.g., `usr-admin-01`, `usr-student-01` or Firebase Auth UID)

```typescript
interface UserDoc {
  id: string;                      // Document ID
  email: string;                   // Unique lowercase email
  password_hash: string;           // Bcrypt hash
  role: 'STUDENT' | 'ADMIN';       // Role-Based Access Control
  status: 'ACTIVE' | 'SUSPENDED';  // Account state
  created_at: string;              // ISO-8601 timestamp
  updated_at: string;              // ISO-8601 timestamp
}
```

### 2. `students` Collection
Primary document key: `studentId` (e.g., `std-01`)

```typescript
interface StudentDoc {
  id: string;                      // Document ID
  user_id: string;                 // Reference to users/{userId}
  full_name: string;               // Student full name
  student_id_number: string;       // University roll number (e.g. IT21045982)
  university: string;              // University / Institute name
  faculty: string;                 // Faculty / School
  degree: string;                  // Degree title
  academic_year: number;           // Year (1 to 5)
  current_semester: number;        // Semester (1 to 10)
  target_gpa: number;              // Target GPA (0.00 to 4.00)
  avatar_url?: string;             // Profile image or DiceBear seed
  bio?: string;                    // Personal summary
}
```

### 3. `subjects` Collection
Primary document key: `subjectId` (e.g., `sub-01`)

```typescript
interface SubjectDoc {
  id: string;                      // Document ID
  student_id: string;              // Reference to students/{studentId}
  code: string;                    // Subject code (e.g. CS3010)
  name: string;                    // Subject name (e.g. Database Management)
  lecturer: string;                // Lecturer in charge
  credits: number;                 // Credit value (e.g. 3)
  semester: number;                // Semester index
  color_hex: string;               // Tag color hex (e.g. #4f46e5)
  is_weak_subject: number;         // 1 if marked for extra AI study focus
}
```

### 4. `timetable` Collection
Primary document key: `itemId` (e.g., `tt-01`)

```typescript
interface TimetableDoc {
  id: string;
  subject_id: string;              // Reference to subjects/{subjectId}
  day_of_week: string;             // 'Monday' | 'Tuesday' | ...
  start_time: string;              // 24h format "09:00"
  end_time: string;                // 24h format "11:00"
  location: string;                // Classroom, Lab, or Auditorium
  class_type: string;              // "Lecture" | "Practical" | "Tutorial"
}
```

### 5. `assignments` Collection
Primary document key: `assignmentId` (e.g., `asg-01`)

```typescript
interface AssignmentDoc {
  id: string;
  student_id: string;              // Reference to students/{studentId}
  subject_id: string;              // Reference to subjects/{subjectId}
  title: string;                   // Task title
  description?: string;            // Deliverables / specs
  due_date: string;                // ISO-8601 deadline
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Completed';
  weightage?: number;              // Grade percentage %
}
```

### 6. `exams` Collection
Primary document key: `examId` (e.g., `exm-01`)

```typescript
interface ExamDoc {
  id: string;
  student_id: string;              // Reference to students/{studentId}
  subject_id: string;              // Reference to subjects/{subjectId}
  exam_type: string;               // "Midterm", "Final Theory Exam", "Lab Exam"
  exam_date: string;               // ISO-8601 date & time
  location: string;                // Examination hall
  weightage: number;               // Grade percentage %
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  notes?: string;                  // Syllabus topics to focus on
}
```

### 7. `attendance` Collection
Primary document key: `attendanceId` (e.g., `att-01`)

```typescript
interface AttendanceDoc {
  id: string;
  student_id: string;              // Reference to students/{studentId}
  subject_id: string;              // Reference to subjects/{subjectId}
  total_classes: number;           // Total conducted sessions
  attended_classes: number;        // Attended sessions
  minimum_required_pct: number;    // University rule threshold (e.g. 80%)
}
```

### 8. `grades` Collection
Primary document key: `gradeId` (e.g., `grd-01`)

```typescript
interface GradeDoc {
  id: string;
  student_id: string;              // Reference to students/{studentId}
  subject_id: string;              // Reference to subjects/{subjectId}
  semester: number;                // Semester index
  letter_grade: string;            // A+, A, A-, B+, B, C, etc.
  grade_point: number;             // 4.00, 3.70, 3.30, 3.00, etc.
  credits: number;                 // Module credits
}
```

### 9. `study_plans` Collection
Primary document key: `planId` (e.g., `plan-01`)

```typescript
interface StudyPlanDoc {
  id: string;
  student_id: string;
  title: string;
  target_exam_date?: string;
  available_hours_per_day: number;
  plan_data: {
    overview: string;
    weekly_schedule: Array<{
      day_name: string;
      focus: string;
      tasks: Array<{
        id: string;
        subject: string;
        duration_minutes: number;
        topic: string;
        completed: boolean;
      }>;
    }>;
    tips: string[];
  };
  status: 'ACTIVE' | 'ARCHIVED';
}
```

### 10. `quizzes` Collection
Primary document key: `quizId` (e.g., `quiz-01`)

```typescript
interface QuizDoc {
  id: string;
  student_id: string;
  subject_name: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  total_questions: number;
  score: number;
  completed: boolean;
  questions: Array<{
    id: string;
    question: string;
    options: { A: string; B: string; C: string; D: string };
    correct_option: 'A' | 'B' | 'C' | 'D';
    selected_option?: 'A' | 'B' | 'C' | 'D';
    explanation: string;
    is_correct?: boolean;
  }>;
}
```

---

## ⚡ Deployment to Live Google Cloud Firebase

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com).
2. Enable **Cloud Firestore** in test or production mode.
3. Generate a Service Account Private Key:
   - Go to **Project Settings** → **Service Accounts**
   - Click **Generate new private key** (`serviceAccountKey.json`)
   - Place this file in `server/` or paste its credentials in `server/.env`.
4. Deploy rules and indexes using Firebase CLI:
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes
   ```
