import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/env.js';
import { initializeFirebase } from '../config/firebase.js';
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
import { 
  initialUsers, 
  initialStudents, 
  initialSubjects, 
  initialTimetable, 
  initialAssignments, 
  initialExams, 
  initialAttendance, 
  initialGrades, 
  initialStudyPlans, 
  initialQuizzes, 
  initialNotes, 
  initialNotifications 
} from '../data/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '..', 'data', 'db_store.json');

export interface DatabaseState {
  users: User[];
  students: StudentProfile[];
  subjects: Subject[];
  timetable: TimetableItem[];
  assignments: Assignment[];
  exams: Exam[];
  attendance: AttendanceRecord[];
  grades: GradeRecord[];
  studyPlans: StudyPlan[];
  quizzes: Quiz[];
  notes: Note[];
  notifications: Notification[];
  aiLogs: Array<{ id: string; userId: string; feature: string; timestamp: string }>;
}

class DatabaseService {
  private state: DatabaseState;
  public isFirebaseConnected: boolean = false;
  public isOracleConnected: boolean = false; // legacy alias
  private firestore: any = null;

  constructor() {
    this.state = this.loadData();
    this.initFirebaseBackend();
  }

  private loadData(): DatabaseState {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('⚠️ Error reading local db_store.json, resetting to seed data.', err);
    }

    const defaultState: DatabaseState = {
      users: [...initialUsers],
      students: [...initialStudents],
      subjects: [...initialSubjects],
      timetable: [...initialTimetable],
      assignments: [...initialAssignments],
      exams: [...initialExams],
      attendance: [...initialAttendance],
      grades: [...initialGrades],
      studyPlans: [...initialStudyPlans],
      quizzes: [...initialQuizzes],
      notes: [...initialNotes],
      notifications: [...initialNotifications],
      aiLogs: []
    };
    this.persist(defaultState);
    return defaultState;
  }

  private persist(stateToSave?: DatabaseState) {
    try {
      const s = stateToSave || this.state;
      fs.writeFileSync(DATA_FILE, JSON.stringify(s, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving db_store.json:', err);
    }
  }

  public save() {
    this.persist();
  }

  private async initFirebaseBackend() {
    try {
      const { db, isConnected } = initializeFirebase();
      this.firestore = db;
      this.isFirebaseConnected = isConnected;
      this.isOracleConnected = isConnected;

      if (this.isFirebaseConnected && this.firestore) {
        console.log('🔥 [Database] Synchronizing with live Google Cloud Firestore...');
        this.seedFirestoreIfEmpty();
      }
    } catch (err: any) {
      console.warn('⚠️ [Database] Firebase initialization note:', err.message);
      this.isFirebaseConnected = false;
      this.isOracleConnected = false;
    }
  }

  /**
   * Helper: sync a document to Cloud Firestore
   */
  private async syncDoc(collection: string, docId: string, data: any) {
    if (!this.isFirebaseConnected || !this.firestore) return;
    try {
      await this.firestore.collection(collection).doc(docId).set(data, { merge: true });
    } catch (err: any) {
      console.warn(`[Firebase Sync Warning] Failed to sync ${collection}/${docId}:`, err.message);
    }
  }

  /**
   * Helper: delete a document from Cloud Firestore
   */
  private async deleteDoc(collection: string, docId: string) {
    if (!this.isFirebaseConnected || !this.firestore) return;
    try {
      await this.firestore.collection(collection).doc(docId).delete();
    } catch (err: any) {
      console.warn(`[Firebase Delete Warning] Failed to delete ${collection}/${docId}:`, err.message);
    }
  }

  /**
   * Seed Firestore collections if the database is brand new
   */
  private async seedFirestoreIfEmpty() {
    if (!this.isFirebaseConnected || !this.firestore) return;
    try {
      const snapshot = await this.firestore.collection('users').limit(1).get();
      if (snapshot.empty) {
        console.log('📦 [Firebase] Initializing Cloud Firestore collections with academic starter data...');
        const batch = this.firestore.batch();

        this.state.users.forEach(u => {
          batch.set(this.firestore.collection('users').doc(u.id), u);
        });
        this.state.students.forEach(s => {
          batch.set(this.firestore.collection('students').doc(s.id), s);
        });
        this.state.subjects.forEach(sub => {
          batch.set(this.firestore.collection('subjects').doc(sub.id), sub);
        });
        this.state.timetable.forEach(tt => {
          batch.set(this.firestore.collection('timetable').doc(tt.id), tt);
        });
        this.state.assignments.forEach(asg => {
          batch.set(this.firestore.collection('assignments').doc(asg.id), asg);
        });
        this.state.exams.forEach(exm => {
          batch.set(this.firestore.collection('exams').doc(exm.id), exm);
        });
        this.state.attendance.forEach(att => {
          batch.set(this.firestore.collection('attendance').doc(att.id), att);
        });
        this.state.grades.forEach(grd => {
          batch.set(this.firestore.collection('grades').doc(grd.id), grd);
        });

        await batch.commit();
        console.log('✅ [Firebase] Cloud Firestore seed synchronization complete!');
      }
    } catch (err: any) {
      console.warn('⚠️ [Firebase] Could not verify remote collection state:', err.message);
    }
  }

  // --- Users & Profiles ---
  getUsers(): User[] { return this.state.users; }
  getUserById(id: string): User | undefined { return this.state.users.find(u => u.id === id); }
  getUserByEmail(email: string): User | undefined { return this.state.users.find(u => u.email.toLowerCase() === email.toLowerCase()); }
  createUser(user: User): User {
    this.state.users.push(user);
    this.save();
    this.syncDoc('users', user.id, user);
    return user;
  }
  updateUser(id: string, updates: Partial<User>): User | undefined {
    const u = this.getUserById(id);
    if (!u) return undefined;
    Object.assign(u, updates, { updated_at: new Date().toISOString() });
    this.save();
    this.syncDoc('users', id, u);
    return u;
  }

  getStudentByUserId(userId: string): StudentProfile | undefined {
    return this.state.students.find(s => s.user_id === userId);
  }
  getStudentById(id: string): StudentProfile | undefined {
    return this.state.students.find(s => s.id === id);
  }
  createStudentProfile(profile: StudentProfile): StudentProfile {
    this.state.students.push(profile);
    this.save();
    this.syncDoc('students', profile.id, profile);
    return profile;
  }
  updateStudentProfile(id: string, updates: Partial<StudentProfile>): StudentProfile | undefined {
    const s = this.getStudentById(id);
    if (!s) return undefined;
    Object.assign(s, updates, { updated_at: new Date().toISOString() });
    this.save();
    this.syncDoc('students', id, s);
    return s;
  }

  // --- Subjects ---
  getSubjects(studentId: string): Subject[] {
    return this.state.subjects.filter(s => s.student_id === studentId);
  }
  getSubjectById(id: string): Subject | undefined {
    return this.state.subjects.find(s => s.id === id);
  }
  createSubject(subject: Subject): Subject {
    this.state.subjects.push(subject);
    this.syncDoc('subjects', subject.id, subject);

    // Automatically create empty attendance record
    const attId = 'att-' + Math.random().toString(36).substring(2, 9);
    const newAtt: AttendanceRecord = {
      id: attId,
      student_id: subject.student_id,
      subject_id: subject.id,
      total_classes: 0,
      attended_classes: 0,
      minimum_required_pct: 80,
      updated_at: new Date().toISOString()
    };
    this.state.attendance.push(newAtt);
    this.syncDoc('attendance', attId, newAtt);

    this.save();
    return subject;
  }
  updateSubject(id: string, updates: Partial<Subject>): Subject | undefined {
    const s = this.getSubjectById(id);
    if (!s) return undefined;
    Object.assign(s, updates);
    this.save();
    this.syncDoc('subjects', id, s);
    return s;
  }
  deleteSubject(id: string): boolean {
    const initialLen = this.state.subjects.length;
    this.state.subjects = this.state.subjects.filter(s => s.id !== id);
    this.state.timetable = this.state.timetable.filter(t => t.subject_id !== id);
    this.state.assignments = this.state.assignments.filter(a => a.subject_id !== id);
    this.state.exams = this.state.exams.filter(e => e.subject_id !== id);
    this.state.attendance = this.state.attendance.filter(a => a.subject_id !== id);
    this.state.grades = this.state.grades.filter(g => g.subject_id !== id);
    this.save();
    this.deleteDoc('subjects', id);
    return this.state.subjects.length < initialLen;
  }

  // --- Timetable ---
  getTimetable(studentId: string): TimetableItem[] {
    const subjects = this.getSubjects(studentId);
    const subMap = new Map(subjects.map(s => [s.id, s]));
    return this.state.timetable
      .filter(t => subMap.has(t.subject_id))
      .map(t => {
        const sub = subMap.get(t.subject_id);
        return {
          ...t,
          subject_code: sub?.code,
          subject_name: sub?.name,
          lecturer: sub?.lecturer,
          color_hex: sub?.color_hex
        };
      });
  }
  createTimetableItem(item: TimetableItem): TimetableItem {
    this.state.timetable.push(item);
    this.save();
    this.syncDoc('timetable', item.id, item);
    return item;
  }
  updateTimetableItem(id: string, updates: Partial<TimetableItem>): TimetableItem | undefined {
    const item = this.state.timetable.find(t => t.id === id);
    if (!item) return undefined;
    Object.assign(item, updates);
    this.save();
    this.syncDoc('timetable', id, item);
    return item;
  }
  deleteTimetableItem(id: string): boolean {
    const len = this.state.timetable.length;
    this.state.timetable = this.state.timetable.filter(t => t.id !== id);
    this.save();
    this.deleteDoc('timetable', id);
    return this.state.timetable.length < len;
  }

  // --- Assignments ---
  getAssignments(studentId: string): Assignment[] {
    const subMap = new Map(this.getSubjects(studentId).map(s => [s.id, s]));
    return this.state.assignments
      .filter(a => a.student_id === studentId)
      .map(a => {
        const sub = subMap.get(a.subject_id);
        return {
          ...a,
          subject_code: sub?.code,
          subject_name: sub?.name,
          color_hex: sub?.color_hex || '#6366f1'
        };
      })
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  }
  getAssignmentById(id: string): Assignment | undefined {
    return this.state.assignments.find(a => a.id === id);
  }
  createAssignment(assignment: Assignment): Assignment {
    this.state.assignments.push(assignment);
    this.save();
    this.syncDoc('assignments', assignment.id, assignment);
    return assignment;
  }
  updateAssignment(id: string, updates: Partial<Assignment>): Assignment | undefined {
    const a = this.getAssignmentById(id);
    if (!a) return undefined;
    Object.assign(a, updates, { updated_at: new Date().toISOString() });
    this.save();
    this.syncDoc('assignments', id, a);
    return a;
  }
  deleteAssignment(id: string): boolean {
    const len = this.state.assignments.length;
    this.state.assignments = this.state.assignments.filter(a => a.id !== id);
    this.save();
    this.deleteDoc('assignments', id);
    return this.state.assignments.length < len;
  }

  // --- Exams ---
  getExams(studentId: string): Exam[] {
    const subMap = new Map(this.getSubjects(studentId).map(s => [s.id, s]));
    return this.state.exams
      .filter(e => e.student_id === studentId)
      .map(e => {
        const sub = subMap.get(e.subject_id);
        return {
          ...e,
          subject_code: sub?.code,
          subject_name: sub?.name,
          color_hex: sub?.color_hex || '#f59e0b'
        };
      })
      .sort((a, b) => new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime());
  }
  createExam(exam: Exam): Exam {
    this.state.exams.push(exam);
    this.save();
    this.syncDoc('exams', exam.id, exam);
    return exam;
  }
  updateExam(id: string, updates: Partial<Exam>): Exam | undefined {
    const e = this.state.exams.find(x => x.id === id);
    if (!e) return undefined;
    Object.assign(e, updates);
    this.save();
    this.syncDoc('exams', id, e);
    return e;
  }
  deleteExam(id: string): boolean {
    const len = this.state.exams.length;
    this.state.exams = this.state.exams.filter(e => e.id !== id);
    this.save();
    this.deleteDoc('exams', id);
    return this.state.exams.length < len;
  }

  // --- Attendance ---
  getAttendance(studentId: string): AttendanceRecord[] {
    const subMap = new Map(this.getSubjects(studentId).map(s => [s.id, s]));
    return this.state.attendance
      .filter(a => a.student_id === studentId)
      .map(a => {
        const sub = subMap.get(a.subject_id);
        const pct = a.total_classes > 0 
          ? Math.round((a.attended_classes / a.total_classes) * 100 * 10) / 10 
          : 100;
        
        let status: 'Safe' | 'Warning' | 'Critical' = 'Safe';
        if (pct < a.minimum_required_pct - 5) {
          status = 'Critical';
        } else if (pct < a.minimum_required_pct) {
          status = 'Warning';
        }

        return {
          ...a,
          subject_code: sub?.code,
          subject_name: sub?.name,
          color_hex: sub?.color_hex || '#10b981',
          percentage: pct,
          status
        };
      });
  }
  updateAttendance(id: string, updates: Partial<AttendanceRecord>): AttendanceRecord | undefined {
    const att = this.state.attendance.find(a => a.id === id);
    if (!att) return undefined;
    Object.assign(att, updates, { updated_at: new Date().toISOString() });
    this.save();
    this.syncDoc('attendance', id, att);
    return att;
  }
  markAttendance(id: string, type: 'present' | 'absent'): AttendanceRecord | undefined {
    const att = this.state.attendance.find(a => a.id === id);
    if (!att) return undefined;
    att.total_classes += 1;
    if (type === 'present') {
      att.attended_classes += 1;
    }
    att.updated_at = new Date().toISOString();
    this.save();
    this.syncDoc('attendance', id, att);
    return att;
  }

  // --- Grades & GPA ---
  getGrades(studentId: string): GradeRecord[] {
    const subMap = new Map(this.getSubjects(studentId).map(s => [s.id, s]));
    return this.state.grades
      .filter(g => g.student_id === studentId)
      .map(g => {
        const sub = subMap.get(g.subject_id);
        return {
          ...g,
          subject_code: sub?.code,
          subject_name: sub?.name
        };
      });
  }
  saveGrade(grade: GradeRecord): GradeRecord {
    const existingIdx = this.state.grades.findIndex(
      g => g.student_id === grade.student_id && g.subject_id === grade.subject_id && g.semester === grade.semester
    );
    if (existingIdx >= 0) {
      this.state.grades[existingIdx] = grade;
    } else {
      this.state.grades.push(grade);
    }
    this.save();
    this.syncDoc('grades', grade.id, grade);
    return grade;
  }
  deleteGrade(id: string): boolean {
    const len = this.state.grades.length;
    this.state.grades = this.state.grades.filter(g => g.id !== id);
    this.save();
    this.deleteDoc('grades', id);
    return this.state.grades.length < len;
  }

  // --- Study Plans ---
  getStudyPlans(studentId: string): StudyPlan[] {
    return this.state.studyPlans.filter(p => p.student_id === studentId);
  }
  saveStudyPlan(plan: StudyPlan): StudyPlan {
    this.state.studyPlans.unshift(plan);
    this.save();
    this.syncDoc('study_plans', plan.id, plan);
    return plan;
  }
  toggleStudyPlanTask(planId: string, taskId: string): boolean {
    const plan = this.state.studyPlans.find(p => p.id === planId);
    if (!plan || !plan.plan_data || !plan.plan_data.weekly_schedule) return false;
    for (const day of plan.plan_data.weekly_schedule) {
      const task = day.tasks.find(t => t.id === taskId);
      if (task) {
        task.completed = !task.completed;
        this.save();
        this.syncDoc('study_plans', planId, plan);
        return true;
      }
    }
    return false;
  }

  // --- Quizzes ---
  getQuizzes(studentId: string): Quiz[] {
    return this.state.quizzes
      .filter(q => q.student_id === studentId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
  getQuizById(id: string): Quiz | undefined {
    return this.state.quizzes.find(q => q.id === id);
  }
  saveQuiz(quiz: Quiz): Quiz {
    this.state.quizzes.unshift(quiz);
    this.save();
    this.syncDoc('quizzes', quiz.id, quiz);
    return quiz;
  }
  submitQuizAnswers(quizId: string, answers: Record<string, 'A' | 'B' | 'C' | 'D'>): Quiz | undefined {
    const quiz = this.getQuizById(quizId);
    if (!quiz) return undefined;
    let correctCount = 0;
    quiz.questions.forEach(q => {
      const chosen = answers[q.id];
      q.selected_option = chosen;
      q.is_correct = chosen === q.correct_option;
      if (q.is_correct) correctCount++;
    });
    quiz.score = correctCount;
    quiz.completed = true;
    this.save();
    this.syncDoc('quizzes', quizId, quiz);
    return quiz;
  }

  // --- Notes ---
  getNotes(studentId: string): Note[] {
    return this.state.notes
      .filter(n => n.student_id === studentId)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }
  getNoteById(id: string): Note | undefined {
    return this.state.notes.find(n => n.id === id);
  }
  saveNote(note: Note): Note {
    const idx = this.state.notes.findIndex(n => n.id === note.id);
    if (idx >= 0) {
      this.state.notes[idx] = note;
    } else {
      this.state.notes.unshift(note);
    }
    this.save();
    this.syncDoc('notes', note.id, note);
    return note;
  }
  deleteNote(id: string): boolean {
    const len = this.state.notes.length;
    this.state.notes = this.state.notes.filter(n => n.id !== id);
    this.save();
    this.deleteDoc('notes', id);
    return this.state.notes.length < len;
  }

  // --- Notifications ---
  getNotifications(userId: string): Notification[] {
    return this.state.notifications.filter(n => n.user_id === userId);
  }
  markNotificationRead(id: string): boolean {
    const n = this.state.notifications.find(x => x.id === id);
    if (!n) return false;
    n.is_read = 1;
    this.save();
    this.syncDoc('notifications', id, n);
    return true;
  }

  // --- Telemetry & Admin ---
  logAiUsage(userId: string, feature: string) {
    const newLog = {
      id: 'ai-log-' + Date.now(),
      userId,
      feature,
      timestamp: new Date().toISOString()
    };
    this.state.aiLogs.push(newLog);
    this.save();
    this.syncDoc('ai_logs', newLog.id, newLog);
  }

  getAdminStats() {
    return {
      totalUsers: this.state.users.length,
      totalStudents: this.state.students.length,
      totalSubjects: this.state.subjects.length,
      totalAssignments: this.state.assignments.length,
      totalExams: this.state.exams.length,
      totalQuizzesTaken: this.state.quizzes.filter(q => q.completed).length,
      totalAiGenerations: this.state.aiLogs.length + this.state.quizzes.length + this.state.studyPlans.length,
      firebaseConnected: this.isFirebaseConnected,
      oracleConnected: this.isFirebaseConnected
    };
  }
}

export const db = new DatabaseService();
