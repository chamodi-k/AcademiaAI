import bcrypt from 'bcryptjs';
import { 
  User, 
  StudentProfile, 
  Subject, 
  TimetableItem, 
  Assignment, 
  Exam, 
  AttendanceRecord, 
  GradeRecord, 
  StudyPlan, 
  Quiz, 
  Note, 
  Notification 
} from '../types/index.js';

const defaultStudentPasswordHash = bcrypt.hashSync('password123', 10);
const configuredAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const configuredAdminPassword = process.env.ADMIN_PASSWORD;

const initialAdmin: User[] = configuredAdminEmail && configuredAdminPassword
  ? [{
      id: 'usr-admin-01',
      email: configuredAdminEmail,
      password_hash: bcrypt.hashSync(configuredAdminPassword, 12),
      role: 'ADMIN',
      status: 'ACTIVE',
      created_at: new Date('2026-01-01').toISOString(),
      updated_at: new Date('2026-01-01').toISOString()
    }]
  : [];

const now = new Date();
const addDays = (d: number, h: number = 0) => {
  const date = new Date(now.getTime() + d * 86400000 + h * 3600000);
  return date.toISOString();
};

export const initialUsers: User[] = [
  ...initialAdmin,
  {
    id: 'usr-student-01',
    email: 'student@academia.edu',
    password_hash: defaultStudentPasswordHash,
    role: 'STUDENT',
    status: 'ACTIVE',
    created_at: new Date('2026-01-10').toISOString(),
    updated_at: new Date('2026-01-10').toISOString()
  }
];

export const initialStudents: StudentProfile[] = [
  {
    id: 'std-01',
    user_id: 'usr-student-01',
    full_name: 'Kasun Perera',
    student_id_number: 'IT21045982',
    university: 'University of Moratuwa',
    faculty: 'Faculty of Information Technology',
    degree: 'BSc (Hons) in Information Technology & Software Engineering',
    academic_year: 3,
    current_semester: 1,
    target_gpa: 3.85,
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    bio: 'Dedicated 3rd-year CS student passionate about distributed systems, Oracle SQL, and cloud AI architecture.',
    created_at: new Date('2026-01-10').toISOString(),
    updated_at: new Date('2026-01-10').toISOString()
  }
];

export const initialSubjects: Subject[] = [
  {
    id: 'sub-01',
    student_id: 'std-01',
    code: 'CS3010',
    name: 'Database Management Systems',
    lecturer: 'Dr. Athula Wickramasinghe',
    credits: 3,
    semester: 1,
    color_hex: '#4f46e5', // indigo
    is_weak_subject: 1,
    created_at: new Date('2026-01-15').toISOString()
  },
  {
    id: 'sub-02',
    student_id: 'std-01',
    code: 'CS3020',
    name: 'Object-Oriented Programming (OOP)',
    lecturer: 'Prof. Priyantha Silva',
    credits: 3,
    semester: 1,
    color_hex: '#06b6d4', // cyan
    is_weak_subject: 0,
    created_at: new Date('2026-01-15').toISOString()
  },
  {
    id: 'sub-03',
    student_id: 'std-01',
    code: 'CS3030',
    name: 'Software Engineering (SE)',
    lecturer: 'Dr. Nimalka Bandara',
    credits: 3,
    semester: 1,
    color_hex: '#10b981', // emerald
    is_weak_subject: 0,
    created_at: new Date('2026-01-15').toISOString()
  },
  {
    id: 'sub-04',
    student_id: 'std-01',
    code: 'CS3040',
    name: 'Artificial Intelligence & Machine Learning',
    lecturer: 'Dr. Ruwan Jayaweera',
    credits: 3,
    semester: 1,
    color_hex: '#f59e0b', // amber
    is_weak_subject: 0,
    created_at: new Date('2026-01-15').toISOString()
  }
];

export const initialTimetable: TimetableItem[] = [
  {
    id: 'tt-01',
    subject_id: 'sub-01',
    day_of_week: 'Monday',
    start_time: '09:00',
    end_time: '11:00',
    location: 'Lab 04 (Level 2)',
    class_type: 'Practical',
    created_at: new Date().toISOString()
  },
  {
    id: 'tt-02',
    subject_id: 'sub-03',
    day_of_week: 'Monday',
    start_time: '11:00',
    end_time: '13:00',
    location: 'Auditorium A',
    class_type: 'Lecture',
    created_at: new Date().toISOString()
  },
  {
    id: 'tt-03',
    subject_id: 'sub-02',
    day_of_week: 'Monday',
    start_time: '14:00',
    end_time: '16:00',
    location: 'Lecture Hall 02',
    class_type: 'Lecture',
    created_at: new Date().toISOString()
  },
  {
    id: 'tt-04',
    subject_id: 'sub-04',
    day_of_week: 'Tuesday',
    start_time: '10:00',
    end_time: '12:00',
    location: 'AI Innovation Lab',
    class_type: 'Lab Session',
    created_at: new Date().toISOString()
  },
  {
    id: 'tt-05',
    subject_id: 'sub-01',
    day_of_week: 'Wednesday',
    start_time: '09:00',
    end_time: '11:00',
    location: 'Auditorium B',
    class_type: 'Lecture',
    created_at: new Date().toISOString()
  },
  {
    id: 'tt-06',
    subject_id: 'sub-02',
    day_of_week: 'Thursday',
    start_time: '13:00',
    end_time: '15:00',
    location: 'Software Lab 01',
    class_type: 'Practical',
    created_at: new Date().toISOString()
  },
  {
    id: 'tt-07',
    subject_id: 'sub-03',
    day_of_week: 'Friday',
    start_time: '09:00',
    end_time: '11:00',
    location: 'Seminar Room 3',
    class_type: 'Discussion',
    created_at: new Date().toISOString()
  }
];

export const initialAssignments: Assignment[] = [
  {
    id: 'asg-01',
    student_id: 'std-01',
    subject_id: 'sub-01',
    title: 'Database Normalization & B+ Tree Indexing Project',
    description: 'Design a 3NF relational schema in Oracle SQL and benchmark query execution plans with EXPLAIN PLAN.',
    due_date: addDays(2, 6),
    priority: 'High',
    status: 'In Progress',
    weightage: 20,
    created_at: addDays(-4),
    updated_at: addDays(-1)
  },
  {
    id: 'asg-02',
    student_id: 'std-01',
    subject_id: 'sub-03',
    title: 'Software Architecture Document (SAD)',
    description: 'Construct complete UML class, component, and deployment architecture diagrams with architectural style rationale.',
    due_date: addDays(5, 3),
    priority: 'Medium',
    status: 'Pending',
    weightage: 15,
    created_at: addDays(-2),
    updated_at: addDays(-2)
  },
  {
    id: 'asg-03',
    student_id: 'std-01',
    subject_id: 'sub-02',
    title: 'Java Multi-threaded Socket Chat Server',
    description: 'Implement a concurrent TCP client-server chat application with thread pools, mutex synchronization, and heartbeat.',
    due_date: addDays(9, 1),
    priority: 'High',
    status: 'Pending',
    weightage: 25,
    created_at: addDays(-1),
    updated_at: addDays(-1)
  },
  {
    id: 'asg-04',
    student_id: 'std-01',
    subject_id: 'sub-04',
    title: 'Genetic Algorithm Implementation',
    description: 'Solve Travelling Salesperson Problem (TSP) with crossover, mutation, and elitism operators.',
    due_date: addDays(-1, 0),
    priority: 'Medium',
    status: 'Completed',
    weightage: 15,
    created_at: addDays(-10),
    updated_at: addDays(-1)
  }
];

export const initialExams: Exam[] = [
  {
    id: 'exm-01',
    student_id: 'std-01',
    subject_id: 'sub-01',
    exam_type: 'Midterm Examination',
    exam_date: addDays(3, 4),
    location: 'Main Examination Hall A',
    weightage: 30,
    status: 'Upcoming',
    notes: 'Focus on ER Modelling, Relational Algebra, 1NF to BCNF',
    created_at: addDays(-15)
  },
  {
    id: 'exm-02',
    student_id: 'std-01',
    subject_id: 'sub-02',
    exam_type: 'Practical Lab Exam',
    exam_date: addDays(7, 2),
    location: 'Computing Center Lab 2',
    weightage: 25,
    status: 'Upcoming',
    notes: 'Design patterns (Singleton, Factory, Observer) and Java Streams',
    created_at: addDays(-12)
  },
  {
    id: 'exm-03',
    student_id: 'std-01',
    subject_id: 'sub-04',
    exam_type: 'Final Theory Exam',
    exam_date: addDays(24, 0),
    location: 'Grand Arena Hall',
    weightage: 50,
    status: 'Upcoming',
    notes: 'A* Search, Minimax with Alpha-Beta Pruning, Neural Networks',
    created_at: addDays(-10)
  }
];

export const initialAttendance: AttendanceRecord[] = [
  {
    id: 'att-01',
    student_id: 'std-01',
    subject_id: 'sub-01',
    total_classes: 20,
    attended_classes: 18,
    minimum_required_pct: 80,
    updated_at: new Date().toISOString()
  },
  {
    id: 'att-02',
    student_id: 'std-01',
    subject_id: 'sub-02',
    total_classes: 18,
    attended_classes: 16,
    minimum_required_pct: 80,
    updated_at: new Date().toISOString()
  },
  {
    id: 'att-03',
    student_id: 'std-01',
    subject_id: 'sub-03',
    total_classes: 22,
    attended_classes: 19,
    minimum_required_pct: 80,
    updated_at: new Date().toISOString()
  },
  {
    id: 'att-04',
    student_id: 'std-01',
    subject_id: 'sub-04',
    total_classes: 16,
    attended_classes: 13,
    minimum_required_pct: 80,
    updated_at: new Date().toISOString()
  }
];

export const initialGrades: GradeRecord[] = [
  {
    id: 'grd-01',
    student_id: 'std-01',
    subject_id: 'sub-01',
    semester: 1,
    letter_grade: 'A',
    grade_point: 4.00,
    credits: 3,
    created_at: new Date('2025-12-20').toISOString()
  },
  {
    id: 'grd-02',
    student_id: 'std-01',
    subject_id: 'sub-02',
    semester: 1,
    letter_grade: 'B+',
    grade_point: 3.30,
    credits: 3,
    created_at: new Date('2025-12-20').toISOString()
  },
  {
    id: 'grd-03',
    student_id: 'std-01',
    subject_id: 'sub-03',
    semester: 1,
    letter_grade: 'A-',
    grade_point: 3.70,
    credits: 3,
    created_at: new Date('2025-12-20').toISOString()
  },
  {
    id: 'grd-04',
    student_id: 'std-01',
    subject_id: 'sub-04',
    semester: 1,
    letter_grade: 'B',
    grade_point: 3.00,
    credits: 3,
    created_at: new Date('2025-12-20').toISOString()
  }
];

export const initialStudyPlans: StudyPlan[] = [
  {
    id: 'plan-01',
    student_id: 'std-01',
    title: 'Midterm Exam Sprint 2026',
    target_exam_date: addDays(3, 4),
    available_hours_per_day: 3.0,
    status: 'ACTIVE',
    created_at: addDays(-2),
    plan_data: {
      overview: 'Intensive preparation plan with heavy focus on Database Normalization and OOP Polymorphism patterns.',
      weekly_schedule: [
        {
          day_name: 'Monday',
          focus: 'Database Normalization & Query Tuning',
          tasks: [
            { id: 't1', subject: 'Database Management Systems', duration_minutes: 60, topic: 'Review 1NF, 2NF, 3NF, BCNF decomposition rules', completed: true },
            { id: 't2', subject: 'Object-Oriented Programming (OOP)', duration_minutes: 60, topic: 'Practice Java Generics and Collections sorting', completed: false },
            { id: 't3', subject: 'Software Engineering (SE)', duration_minutes: 60, topic: 'Review Clean Code principles & SOLID patterns', completed: false }
          ]
        },
        {
          day_name: 'Tuesday',
          focus: 'AI Search Algorithms & PL/SQL',
          tasks: [
            { id: 't4', subject: 'Database Management Systems', duration_minutes: 60, topic: 'Write complex Oracle PL/SQL stored procedures', completed: false },
            { id: 't5', subject: 'Artificial Intelligence & ML', duration_minutes: 60, topic: 'Dry run A* heuristic algorithm on graphs', completed: false },
            { id: 't6', subject: 'Object-Oriented Programming (OOP)', duration_minutes: 60, topic: 'Implement Thread pool worker pattern', completed: false }
          ]
        },
        {
          day_name: 'Wednesday',
          focus: 'Past Paper Drill & Mock Questions',
          tasks: [
            { id: 't7', subject: 'Database Management Systems', duration_minutes: 90, topic: 'Complete 2024 & 2025 Midterm past papers under exam timing', completed: false },
            { id: 't8', subject: 'Software Engineering (SE)', duration_minutes: 90, topic: 'Sequence and Component diagram practice', completed: false }
          ]
        }
      ],
      tips: [
        'Prioritize Database Management Systems as it has the highest weightage and closest deadline.',
        'Use the Feynman Technique: explain BCNF decomposition to yourself out loud.',
        'Take a 10-minute break after each 50-minute focused Pomodoro study block.'
      ]
    }
  }
];

export const initialQuizzes: Quiz[] = [
  {
    id: 'quiz-01',
    student_id: 'std-01',
    subject_name: 'Database Management Systems',
    topic: 'Database Normalization & Keys',
    difficulty: 'Medium',
    total_questions: 5,
    score: 4,
    completed: true,
    created_at: addDays(-3),
    questions: [
      {
        id: 'q1',
        question: 'Which normal form eliminates partial functional dependencies on a composite primary key?',
        options: {
          A: 'First Normal Form (1NF)',
          B: 'Second Normal Form (2NF)',
          C: 'Third Normal Form (3NF)',
          D: 'Boyce-Codd Normal Form (BCNF)'
        },
        correct_option: 'B',
        selected_option: 'B',
        explanation: '2NF requires that the table is in 1NF and every non-prime attribute is fully functionally dependent on the entire primary key.',
        is_correct: true
      },
      {
        id: 'q2',
        question: 'What is a transitive dependency in relational database design?',
        options: {
          A: 'When attribute X determines Y, and Y determines Z (where X is not a candidate key)',
          B: 'When two primary keys reference each other in a circle',
          C: 'When a column contains multiple atomic values',
          D: 'When foreign keys cascade on delete'
        },
        correct_option: 'A',
        selected_option: 'A',
        explanation: 'Transitive dependency occurs when X -> Y and Y -> Z, which implies X -> Z indirectly. 3NF eliminates this.',
        is_correct: true
      },
      {
        id: 'q3',
        question: 'In Oracle SQL, which clause is used to examine the execution strategy of a query?',
        options: {
          A: 'SHOW EXECUTION',
          B: 'ANALYZE TABLE ONLY',
          C: 'EXPLAIN PLAN FOR',
          D: 'DESCRIBE PLAN'
        },
        correct_option: 'C',
        selected_option: 'C',
        explanation: 'EXPLAIN PLAN FOR displays execution plans chosen by the Oracle optimizer for SELECT, INSERT, UPDATE, and DELETE statements.',
        is_correct: true
      },
      {
        id: 'q4',
        question: 'Which of the following is true regarding BCNF (Boyce-Codd Normal Form)?',
        options: {
          A: 'It allows multivalued dependencies',
          B: 'Every determinant must be a candidate key',
          C: 'It is strictly weaker than 3NF',
          D: 'It requires denormalization'
        },
        correct_option: 'B',
        selected_option: 'B',
        explanation: 'A relation is in BCNF if for every functional dependency X -> Y, X must be a superkey/candidate key.',
        is_correct: true
      },
      {
        id: 'q5',
        question: 'Which ACID property ensures that transactions are committed permanently even in case of power failure?',
        options: {
          A: 'Atomicity',
          B: 'Consistency',
          C: 'Isolation',
          D: 'Durability'
        },
        correct_option: 'D',
        selected_option: 'B',
        explanation: 'Durability guarantees that once a transaction has committed, it will remain committed even in the event of a crash or power loss.',
        is_correct: false
      }
    ]
  }
];

export const initialNotes: Note[] = [
  {
    id: 'note-01',
    student_id: 'std-01',
    subject_id: 'sub-01',
    title: 'Database Normalization Master Guide (1NF to BCNF)',
    original_content: `Database Normalization is the systematic process of organizing data in a relational database to reduce redundancy and improve data integrity.

1NF (First Normal Form):
- Each column must contain atomic (indivisible) values.
- No repeating groups or arrays of data.
- Each row must be uniquely identifiable with a primary key.

2NF (Second Normal Form):
- Must already be in 1NF.
- No partial functional dependency: all non-key attributes must depend on the WHOLE primary key (relevant when candidate key is composite).

3NF (Third Normal Form):
- Must already be in 2NF.
- No transitive dependency: non-key attributes must not depend on other non-key attributes (X -> Y and Y -> Z).

BCNF (Boyce-Codd Normal Form):
- A stricter version of 3NF.
- For every functional dependency A -> B, A must be a super key.`,
    summary_content: `Database Normalization eliminates anomalies (insertion, deletion, update) and ensures relational integrity through 1NF, 2NF, 3NF, and BCNF.`,
    key_points: [
      '1NF requires atomic values and unique records.',
      '2NF eliminates partial dependencies on composite keys.',
      '3NF eliminates transitive dependencies between non-key fields.',
      'BCNF mandates that every determinant must be a candidate key.'
    ],
    important_terms: [
      { term: 'Atomicity', definition: 'Values that cannot be divided into smaller sub-components in the domain.' },
      { term: 'Partial Dependency', definition: 'When a non-prime attribute depends only on a portion of a composite primary key.' },
      { term: 'Transitive Dependency', definition: 'Indirect relationship between values where A -> B and B -> C.' },
      { term: 'BCNF', definition: 'Stronger 3NF where every functional dependency determinant is a super key.' }
    ],
    exam_tips: [
      'When an exam gives a table with comma-separated values, immediately state that 1NF is violated.',
      'If the primary key is single-attribute (non-composite), the table is automatically in 2NF if in 1NF.',
      'Watch out for student_id -> zip_code -> city; this is the classic 3NF transitive dependency question.'
    ],
    created_at: addDays(-5),
    updated_at: addDays(-2)
  }
];

export const initialNotifications: Notification[] = [
  {
    id: 'notif-01',
    user_id: 'usr-student-01',
    title: 'Midterm Countdown Alert',
    message: 'Database Midterm Exam is in 3 days. Check your AI study plan for today!',
    type: 'WARNING',
    is_read: 0,
    created_at: addDays(-1)
  },
  {
    id: 'notif-02',
    user_id: 'usr-student-01',
    title: 'AI Study Plan Ready',
    message: 'Your custom 7-day revision schedule has been generated by Gemini AI.',
    type: 'INFO',
    is_read: 0,
    created_at: addDays(-2)
  }
];
