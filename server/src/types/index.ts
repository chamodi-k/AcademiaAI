export type Role = 'STUDENT' | 'ADMIN' | 'INSTRUCTOR';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: Role;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  full_name: string;
  student_id_number: string;
  university: string;
  faculty: string;
  degree: string;
  academic_year: number;
  current_semester: number;
  target_gpa: number;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  student_id: string;
  code: string;
  name: string;
  lecturer: string;
  credits: number;
  semester: number;
  color_hex: string;
  is_weak_subject: number; // 0 or 1
  created_at: string;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface TimetableItem {
  id: string;
  subject_id: string;
  day_of_week: DayOfWeek;
  start_time: string; // e.g. "09:00"
  end_time: string;   // e.g. "11:00"
  location: string;
  class_type: string; // "Lecture", "Practical", "Tutorial"
  created_at: string;
  // Joined fields:
  subject_code?: string;
  subject_name?: string;
  lecturer?: string;
  color_hex?: string;
}

export type AssignmentPriority = 'Low' | 'Medium' | 'High';
export type AssignmentStatus = 'Pending' | 'In Progress' | 'Completed';

export interface Assignment {
  id: string;
  student_id: string;
  subject_id: string;
  title: string;
  description?: string;
  due_date: string;
  priority: AssignmentPriority;
  status: AssignmentStatus;
  weightage?: number;
  created_at: string;
  updated_at: string;
  // Joined fields:
  subject_code?: string;
  subject_name?: string;
  color_hex?: string;
}

export type ExamStatus = 'Upcoming' | 'Completed' | 'Cancelled';

export interface Exam {
  id: string;
  student_id: string;
  subject_id: string;
  exam_type: string; // "Midterm Exam", "Final Theory Exam", "Quiz"
  exam_date: string;
  location: string;
  weightage: number;
  status: ExamStatus;
  notes?: string;
  created_at: string;
  // Joined fields:
  subject_code?: string;
  subject_name?: string;
  color_hex?: string;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  subject_id: string;
  total_classes: number;
  attended_classes: number;
  minimum_required_pct: number;
  updated_at: string;
  // Joined / Calculated fields:
  subject_code?: string;
  subject_name?: string;
  color_hex?: string;
  percentage?: number;
  status?: 'Safe' | 'Warning' | 'Critical';
}

export interface GradeRecord {
  id: string;
  student_id: string;
  subject_id: string;
  semester: number;
  letter_grade: string;
  grade_point: number;
  credits: number;
  created_at: string;
  // Joined fields:
  subject_code?: string;
  subject_name?: string;
}

export interface StudyPlanDayTask {
  id: string;
  subject: string;
  duration_minutes: number;
  topic: string;
  completed: boolean;
}

export interface StudyPlanDay {
  day_name: string;
  focus: string;
  tasks: StudyPlanDayTask[];
}

export interface StudyPlan {
  id: string;
  student_id: string;
  title: string;
  target_exam_date?: string;
  available_hours_per_day: number;
  plan_data: {
    overview: string;
    weekly_schedule: StudyPlanDay[];
    tips: string[];
  };
  status: 'ACTIVE' | 'ARCHIVED';
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_option: 'A' | 'B' | 'C' | 'D';
  selected_option?: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  is_correct?: boolean;
}

export interface Quiz {
  id: string;
  student_id: string;
  subject_id?: string;
  subject_name: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  total_questions: number;
  score: number;
  completed: boolean;
  questions: QuizQuestion[];
  created_at: string;
}

export interface Note {
  id: string;
  student_id: string;
  subject_id?: string;
  title: string;
  original_content: string;
  summary_content?: string;
  key_points?: string[];
  important_terms?: { term: string; definition: string }[];
  exam_tips?: string[];
  created_at: string;
  updated_at: string;
}

export type NotificationType = 'INFO' | 'WARNING' | 'SUCCESS' | 'ANNOUNCEMENT';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: number;
  created_at: string;
  related_id?: string;
  link?: string;
}
