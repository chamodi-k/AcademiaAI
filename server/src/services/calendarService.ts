import ics from 'ics';
import { TimetableItem, Assignment, Exam } from '../types/index.js';

export class CalendarService {
  /**
   * Builds an RFC 5545 compliant iCalendar (.ics) string containing
   * all timetable recurring classes, assignments, and exams.
   */
  static generateIcsCalendar(params: {
    timetable: TimetableItem[];
    assignments: Assignment[];
    exams: Exam[];
    studentName: string;
  }): Promise<string> {
    return new Promise((resolve, reject) => {
      const events: any[] = [];

      // 1. Process Exams
      params.exams.forEach(exam => {
        const d = new Date(exam.exam_date);
        events.push({
          title: `📝 EXAM: ${exam.subject_name || exam.subject_code} - ${exam.exam_type}`,
          description: `Exam location: ${exam.location}\nWeightage: ${exam.weightage}%\nNotes: ${exam.notes || 'None'}`,
          location: exam.location || 'University Campus',
          start: [d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes()],
          duration: { hours: 2, minutes: 0 },
          categories: ['Exam', 'AcademiaAI'],
          status: 'CONFIRMED',
          busyStatus: 'BUSY'
        });
      });

      // 2. Process Assignments
      params.assignments.forEach(asg => {
        const d = new Date(asg.due_date);
        events.push({
          title: `📌 DUE: ${asg.subject_name || asg.subject_code} - ${asg.title}`,
          description: `Assignment Deadline\nPriority: ${asg.priority}\nStatus: ${asg.status}\n${asg.description || ''}`,
          start: [d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes()],
          duration: { hours: 0, minutes: 30 },
          categories: ['Assignment', 'AcademiaAI'],
          status: 'CONFIRMED'
        });
      });

      // 3. Process Timetable classes (map to next upcoming occurrence)
      const dayMap: Record<string, number> = {
        Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6
      };

      const now = new Date();
      params.timetable.forEach(tt => {
        const targetDay = dayMap[tt.day_of_week];
        if (targetDay === undefined) return;

        const currentDay = now.getDay();
        let daysUntil = (targetDay - currentDay + 7) % 7;
        if (daysUntil === 0) daysUntil = 7; // Next occurrence

        const classDate = new Date(now.getTime() + daysUntil * 86400000);
        const [startH, startM] = tt.start_time.split(':').map(Number);
        const [endH, endM] = tt.end_time.split(':').map(Number);

        const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
        const durH = Math.floor(Math.max(30, durationMinutes) / 60);
        const durM = Math.max(0, durationMinutes % 60);

        events.push({
          title: `🎓 CLASS: ${tt.subject_name || tt.subject_code} (${tt.class_type})`,
          description: `Lecturer: ${tt.lecturer || 'Department Faculty'}\nRoom: ${tt.location}`,
          location: tt.location,
          start: [classDate.getFullYear(), classDate.getMonth() + 1, classDate.getDate(), startH || 9, startM || 0],
          duration: { hours: durH, minutes: durM },
          recurrenceRule: 'FREQ=WEEKLY;INTERVAL=1',
          categories: ['Class', 'Timetable', 'AcademiaAI']
        });
      });

      if (events.length === 0) {
        events.push({
          title: 'AcademiaAI Academic Calendar',
          start: [now.getFullYear(), now.getMonth() + 1, now.getDate(), 9, 0],
          duration: { hours: 1, minutes: 0 },
          description: 'Calendar synchronized via AcademiaAI'
        });
      }

      ics.createEvents(events, (error: any, value: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(value);
        }
      });
    });
  }
}
