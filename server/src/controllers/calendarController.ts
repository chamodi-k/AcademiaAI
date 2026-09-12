import { Request, Response } from 'express';
import { db } from '../models/dbAdapter.js';
import { CalendarService } from '../services/calendarService.js';

export class CalendarController {
  static async exportCalendar(req: Request, res: Response) {
    try {
      const studentId = req.user?.studentId;
      if (!studentId) {
        res.status(404).json({ success: false, message: 'Student profile not found.' });
        return;
      }

      const student = db.getStudentById(studentId);
      const timetable = db.getTimetable(studentId);
      const assignments = db.getAssignments(studentId);
      const exams = db.getExams(studentId);

      const icsData = await CalendarService.generateIcsCalendar({
        timetable,
        assignments,
        exams,
        studentName: student?.full_name || 'Student'
      });

      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="AcademiaAI_Schedule_${studentId}.ics"`);
      res.send(icsData);
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to generate .ics calendar export.', error: err.message });
    }
  }
}
