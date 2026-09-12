import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../models/dbAdapter.js';
import { Exam } from '../types/index.js';

export class ExamController {
  static async getExams(req: Request, res: Response) {
    try {
      const studentId = req.user?.studentId;
      if (!studentId) {
        res.status(404).json({ success: false, message: 'Student profile not found.' });
        return;
      }

      const exams = db.getExams(studentId);
      const subjects = db.getSubjects(studentId);

      const now = new Date().getTime();
      const enrichedExams = exams.map(e => {
        const diffMs = new Date(e.exam_date).getTime() - now;
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        return {
          ...e,
          daysRemaining: days,
          hoursRemaining: hours,
          isPassed: diffMs < 0,
          countdownLabel: diffMs < 0 ? 'Concluded' : `${days}d ${hours}h remaining`
        };
      });

      res.json({ success: true, data: { exams: enrichedExams, subjects } });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch exams.', error: err.message });
    }
  }

  static async createExam(req: Request, res: Response) {
    try {
      const studentId = req.user?.studentId;
      if (!studentId) {
        res.status(404).json({ success: false, message: 'Student profile not found.' });
        return;
      }

      const { subject_id, exam_type, exam_date, location, weightage, notes } = req.body;

      if (!subject_id || !exam_type || !exam_date) {
        res.status(400).json({ success: false, message: 'Subject, exam type, and date are required.' });
        return;
      }

      const newExam: Exam = {
        id: 'exm-' + uuidv4().substring(0, 8),
        student_id: studentId,
        subject_id,
        exam_type,
        exam_date: new Date(exam_date).toISOString(),
        location: location || 'TBA Examination Hall',
        weightage: weightage ? Number(weightage) : 30,
        status: 'Upcoming',
        notes: notes || '',
        created_at: new Date().toISOString()
      };

      db.createExam(newExam);
      const enriched = db.getExams(studentId).find(e => e.id === newExam.id);

      res.status(201).json({ success: true, message: 'Exam scheduled successfully.', data: enriched });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to schedule exam.', error: err.message });
    }
  }

  static async updateExam(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { subject_id, exam_type, exam_date, location, weightage, status, notes } = req.body;

      const updated = db.updateExam(id, {
        ...(subject_id && { subject_id }),
        ...(exam_type && { exam_type }),
        ...(exam_date && { exam_date: new Date(exam_date).toISOString() }),
        ...(location !== undefined && { location }),
        ...(weightage !== undefined && { weightage: Number(weightage) }),
        ...(status && { status }),
        ...(notes !== undefined && { notes })
      });

      if (!updated) {
        res.status(404).json({ success: false, message: 'Exam not found.' });
        return;
      }

      const studentId = req.user?.studentId!;
      const enriched = db.getExams(studentId).find(e => e.id === id);

      res.json({ success: true, message: 'Exam details updated.', data: enriched });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to update exam.', error: err.message });
    }
  }

  static async deleteExam(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const deleted = db.deleteExam(id);

      if (!deleted) {
        res.status(404).json({ success: false, message: 'Exam not found.' });
        return;
      }

      res.json({ success: true, message: 'Exam removed.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to delete exam.', error: err.message });
    }
  }
}
