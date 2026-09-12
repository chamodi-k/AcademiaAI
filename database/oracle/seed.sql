-- ============================================================================
-- AcademiaAI - Seed Data for Oracle Database
-- Realistic Academic Records for Demo & Portfolio Showcase
-- ============================================================================

-- Insert Admin & Student Users
-- Passwords are encrypted hash for 'password123' ($2a$10$wNqHskYmUf7zJqgA/vS5i.VfJ407B8m5W7a6u.vQO5tqKj8tP3G6u)
INSERT INTO USERS (id, email, password_hash, role, status) VALUES 
('usr-admin-01', 'admin@academia.edu', '$2a$10$e84W/3O2fV7h.vO4m6W9..q1xG9p3eF4vC8d9g8b1a7w6q3z1y0l2', 'ADMIN', 'ACTIVE');

INSERT INTO USERS (id, email, password_hash, role, status) VALUES 
('usr-student-01', 'student@academia.edu', '$2a$10$e84W/3O2fV7h.vO4m6W9..q1xG9p3eF4vC8d9g8b1a7w6q3z1y0l2', 'STUDENT', 'ACTIVE');

-- Insert Student Profile
INSERT INTO STUDENTS (id, user_id, full_name, student_id_number, university, faculty, degree, academic_year, current_semester, target_gpa, avatar_url, bio) VALUES 
('std-01', 'usr-student-01', 'Kasun Perera', 'IT21045982', 'University of Moratuwa', 'Faculty of Information Technology', 'BSc (Hons) in Information Technology & Software Engineering', 3, 1, 3.85, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'Dedicated 3rd-year CS student passionate about distributed systems, Oracle SQL, and cloud AI architecture.');

-- Insert Subjects
INSERT INTO SUBJECTS (id, student_id, code, name, lecturer, credits, semester, color_hex, is_weak_subject) VALUES 
('sub-01', 'std-01', 'CS3010', 'Database Management Systems', 'Dr. Athula Wickramasinghe', 3, 1, '#4f46e5', 1);

INSERT INTO SUBJECTS (id, student_id, code, name, lecturer, credits, semester, color_hex, is_weak_subject) VALUES 
('sub-02', 'std-01', 'CS3020', 'Object-Oriented Programming (OOP)', 'Prof. Priyantha Silva', 3, 1, '#06b6d4', 0);

INSERT INTO SUBJECTS (id, student_id, code, name, lecturer, credits, semester, color_hex, is_weak_subject) VALUES 
('sub-03', 'std-01', 'CS3030', 'Software Engineering (SE)', 'Dr. Nimalka Bandara', 3, 1, '#10b981', 0);

INSERT INTO SUBJECTS (id, student_id, code, name, lecturer, credits, semester, color_hex, is_weak_subject) VALUES 
('sub-04', 'std-01', 'CS3040', 'Artificial Intelligence & Machine Learning', 'Dr. Ruwan Jayaweera', 3, 1, '#f59e0b', 0);

-- Insert Timetable
INSERT INTO TIMETABLE (id, subject_id, day_of_week, start_time, end_time, location, class_type) VALUES 
('tt-01', 'sub-01', 'Monday', '09:00', '11:00', 'Lab 04 (Level 2)', 'Practical');

INSERT INTO TIMETABLE (id, subject_id, day_of_week, start_time, end_time, location, class_type) VALUES 
('tt-02', 'sub-03', 'Monday', '11:00', '13:00', 'Auditorium A', 'Lecture');

INSERT INTO TIMETABLE (id, subject_id, day_of_week, start_time, end_time, location, class_type) VALUES 
('tt-03', 'sub-02', 'Monday', '14:00', '16:00', 'Lecture Hall 02', 'Lecture');

INSERT INTO TIMETABLE (id, subject_id, day_of_week, start_time, end_time, location, class_type) VALUES 
('tt-04', 'sub-04', 'Tuesday', '10:00', '12:00', 'AI Innovation Lab', 'Lab Session');

INSERT INTO TIMETABLE (id, subject_id, day_of_week, start_time, end_time, location, class_type) VALUES 
('tt-05', 'sub-01', 'Wednesday', '09:00', '11:00', 'Auditorium B', 'Lecture');

INSERT INTO TIMETABLE (id, subject_id, day_of_week, start_time, end_time, location, class_type) VALUES 
('tt-06', 'sub-02', 'Thursday', '13:00', '15:00', 'Software Lab 01', 'Practical');

INSERT INTO TIMETABLE (id, subject_id, day_of_week, start_time, end_time, location, class_type) VALUES 
('tt-07', 'sub-03', 'Friday', '09:00', '11:00', 'Seminar Room 3', 'Discussion');

-- Insert Assignments
INSERT INTO ASSIGNMENTS (id, student_id, subject_id, title, description, due_date, priority, status, weightage) VALUES 
('asg-01', 'std-01', 'sub-01', 'Database Normalization & B+ Tree Indexing Project', 'Design a 3NF relational schema in Oracle SQL and benchmark query performance using EXPLAIN PLAN.', SYSTIMESTAMP + INTERVAL '2' DAY, 'High', 'In Progress', 20.0);

INSERT INTO ASSIGNMENTS (id, student_id, subject_id, title, description, due_date, priority, status, weightage) VALUES 
('asg-02', 'std-01', 'sub-03', 'Software Architecture Document (SAD)', 'Construct UML class, sequence, and deployment architecture diagrams with IEEE documentation.', SYSTIMESTAMP + INTERVAL '5' DAY, 'Medium', 'Pending', 15.0);

INSERT INTO ASSIGNMENTS (id, student_id, subject_id, title, description, due_date, priority, status, weightage) VALUES 
('asg-03', 'std-01', 'sub-02', 'Java Multi-threaded Socket Server', 'Implement a concurrent TCP client-server chat application with thread pools and synchronization.', SYSTIMESTAMP + INTERVAL '9' DAY, 'High', 'Pending', 25.0);

INSERT INTO ASSIGNMENTS (id, student_id, subject_id, title, description, due_date, priority, status, weightage) VALUES 
('asg-04', 'std-01', 'sub-04', 'Genetic Algorithm Implementation', 'Solve the Travelling Salesperson Problem (TSP) using crossover and mutation operators in Python.', SYSTIMESTAMP - INTERVAL '1' DAY, 'Medium', 'Completed', 15.0);

-- Insert Exams with Live Countdown
INSERT INTO ASSIGNMENTS (id, student_id, subject_id, title, description, due_date, priority, status, weightage) VALUES 
('asg-05', 'std-01', 'sub-01', 'Oracle PL/SQL Procedures & Triggers', 'Create transactional audit logs with row-level triggers.', SYSTIMESTAMP + INTERVAL '14' DAY, 'Low', 'Pending', 10.0);

INSERT INTO EXAMS (id, student_id, subject_id, exam_type, exam_date, location, weightage, status, notes) VALUES 
('exm-01', 'std-01', 'sub-01', 'Midterm Examination', SYSTIMESTAMP + INTERVAL '3' DAY + INTERVAL '4' HOUR, 'Main Examination Hall A', 30.0, 'Upcoming', 'Focus on ER Modelling, Relational Algebra, 1NF to BCNF');

INSERT INTO EXAMS (id, student_id, subject_id, exam_type, exam_date, location, weightage, status, notes) VALUES 
('exm-02', 'std-01', 'sub-02', 'Practical Lab Exam', SYSTIMESTAMP + INTERVAL '7' DAY + INTERVAL '2' HOUR, 'Computing Center Lab 2', 25.0, 'Upcoming', 'Design patterns (Singleton, Factory, Observer) and Collections framework');

INSERT INTO EXAMS (id, student_id, subject_id, exam_type, exam_date, location, weightage, status, notes) VALUES 
('exm-03', 'std-01', 'sub-04', 'Final Theory Examination', SYSTIMESTAMP + INTERVAL '24' DAY, 'Grand Arena Hall', 50.0, 'Upcoming', 'Search algorithms (A*, Minimax), Neural Networks and Bayesian Networks');

-- Insert Attendance Records
INSERT INTO ATTENDANCE (id, student_id, subject_id, total_classes, attended_classes, minimum_required_pct) VALUES 
('att-01', 'std-01', 'sub-01', 20, 18, 80.0); -- 90%

INSERT INTO ATTENDANCE (id, student_id, subject_id, total_classes, attended_classes, minimum_required_pct) VALUES 
('att-02', 'std-01', 'sub-02', 18, 16, 80.0); -- 88.8%

INSERT INTO ATTENDANCE (id, student_id, subject_id, total_classes, attended_classes, minimum_required_pct) VALUES 
('att-03', 'std-01', 'sub-03', 22, 19, 80.0); -- 86.4%

INSERT INTO ATTENDANCE (id, student_id, subject_id, total_classes, attended_classes, minimum_required_pct) VALUES 
('att-04', 'std-01', 'sub-04', 16, 13, 80.0); -- 81.25%

-- Insert Grades & GPA Academic History
INSERT INTO GRADES (id, student_id, subject_id, semester, letter_grade, grade_point, credits) VALUES 
('grd-01', 'std-01', 'sub-01', 1, 'A', 4.00, 3);

INSERT INTO GRADES (id, student_id, subject_id, semester, letter_grade, grade_point, credits) VALUES 
('grd-02', 'std-01', 'sub-02', 1, 'B+', 3.30, 3);

INSERT INTO GRADES (id, student_id, subject_id, semester, letter_grade, grade_point, credits) VALUES 
('grd-03', 'std-01', 'sub-03', 1, 'A-', 3.70, 3);

INSERT INTO GRADES (id, student_id, subject_id, semester, letter_grade, grade_point, credits) VALUES 
('grd-04', 'std-01', 'sub-04', 1, 'B', 3.00, 3);

-- Notifications
INSERT INTO NOTIFICATIONS (id, user_id, title, message, type) VALUES 
('notif-01', 'usr-student-01', 'Midterm Countdown Alert', 'Database Midterm Exam is in 3 days. Review Normalization notes!', 'WARNING');

INSERT INTO NOTIFICATIONS (id, user_id, title, message, type) VALUES 
('notif-02', 'usr-student-01', 'AI Study Plan Ready', 'Your custom 7-day revision schedule has been generated by Gemini.', 'INFO');

COMMIT;
