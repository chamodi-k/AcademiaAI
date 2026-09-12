export type Role = 'STUDENT' | 'ADMIN' | 'INSTRUCTOR';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface User {
  id: string;
  email: string;
  role: Role;
  status?: UserStatus;
  created_at?: string;
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
  is_weak_subject: number;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface TimetableItem {
  id: string;
  subject_id: string;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  location: string;
  class_type: string;
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
  subject_code?: string;
  subject_name?: string;
  color_hex?: string;
  daysRemaining?: number;
  isOverdue?: boolean;
  isDueToday?: boolean;
}

export interface Exam {
  id: string;
  student_id: string;
  subject_id: string;
  exam_type: string;
  exam_date: string;
  location: string;
  weightage: number;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  notes?: string;
  subject_code?: string;
  subject_name?: string;
  color_hex?: string;
  daysRemaining?: number;
  hoursRemaining?: number;
  countdownLabel?: string;
  isPassed?: boolean;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  subject_id: string;
  total_classes: number;
  attended_classes: number;
  minimum_required_pct: number;
  subject_code?: string;
  subject_name?: string;
  color_hex?: string;
  percentage?: number;
  status?: 'Safe' | 'Warning' | 'Critical';
  absent_classes?: number;
  canMissMoreClasses?: number;
}

export interface GradeRecord {
  id: string;
  student_id: string;
  subject_id: string;
  semester: number;
  letter_grade: string;
  grade_point: number;
  credits: number;
  subject_code?: string;
  subject_name?: string;
}

export interface StudyPlanDayTask {
  id: string;
  subject: string;
  duration_minutes: number;
  topic: string;
  completed: boolean;
  planId?: string;
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

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ANNOUNCEMENT';
  is_read: number;
  created_at: string;
  related_id?: string;
  link?: string;
}

export interface DashboardSummaryData {
  student: StudentProfile;
  todayDayName: string;
  todaysClasses: TimetableItem[];
  upcomingAssignments: Assignment[];
  upcomingExams: Exam[];
  attendance: {
    overallPercentage: number;
    status: 'Safe' | 'Warning' | 'Critical';
    subjectBreakdown: AttendanceRecord[];
  };
  gpa: {
    overallGPA: number;
    semesterGPA: number;
    targetGPA: number;
    totalCredits: number;
  };
  aiStudyPlan: {
    planId?: string;
    planTitle?: string;
    todayTasks: StudyPlanDayTask[];
  };
  weeklyStudyHours: Array<{ day: string; hours: number; target: number }>;
  quickCounts: {
    subjectsCount: number;
    pendingAssignmentsCount: number;
    upcomingExamsCount: number;
    quizzesCompletedCount: number;
  };
}
