import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../models/dbAdapter.js';
import { Subject } from '../types/index.js';

export class SubjectController {
  static async getSubjects(req: Request, res: Response) {
    try {
      const studentId = req.user?.studentId;
      if (!studentId) {
        res.status(404).json({ success: false, message: 'Student profile not found.' });
        return;
      }
      const subjects = db.getSubjects(studentId);
      res.json({ success: true, data: subjects });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch subjects.', error: err.message });
    }
  }

  static async createSubject(req: Request, res: Response) {
    try {
      const studentId = req.user?.studentId;
      if (!studentId) {
        res.status(404).json({ success: false, message: 'Student profile not found.' });
        return;
      }

      const { code, name, lecturer, credits, semester, color_hex, is_weak_subject } = req.body;

      if (!code || !name) {
        res.status(400).json({ success: false, message: 'Subject code and name are required.' });
        return;
      }

      const newSubject: Subject = {
        id: 'sub-' + uuidv4().substring(0, 8),
        student_id: studentId,
        code: code.trim().toUpperCase(),
        name: name.trim(),
        lecturer: lecturer ? lecturer.trim() : 'Staff Lecturer',
        credits: credits ? Number(credits) : 3,
        semester: semester ? Number(semester) : 1,
        color_hex: color_hex || '#4f46e5',
        is_weak_subject: is_weak_subject ? 1 : 0,
        created_at: new Date().toISOString()
      };

      db.createSubject(newSubject);
      res.status(201).json({ success: true, message: 'Subject added successfully.', data: newSubject });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to create subject.', error: err.message });
    }
  }

  static async updateSubject(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { code, name, lecturer, credits, semester, color_hex, is_weak_subject } = req.body;

      const updated = db.updateSubject(id, {
        ...(code && { code: code.trim().toUpperCase() }),
        ...(name && { name: name.trim() }),
        ...(lecturer !== undefined && { lecturer }),
        ...(credits !== undefined && { credits: Number(credits) }),
        ...(semester !== undefined && { semester: Number(semester) }),
        ...(color_hex && { color_hex }),
        ...(is_weak_subject !== undefined && { is_weak_subject: is_weak_subject ? 1 : 0 })
      });

      if (!updated) {
        res.status(404).json({ success: false, message: 'Subject not found.' });
        return;
      }

      res.json({ success: true, message: 'Subject updated successfully.', data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to update subject.', error: err.message });
    }
  }

  static async deleteSubject(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const deleted = db.deleteSubject(id);

      if (!deleted) {
        res.status(404).json({ success: false, message: 'Subject not found.' });
        return;
      }

      res.json({ success: true, message: 'Subject and all associated data deleted.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to delete subject.', error: err.message });
    }
  }
}
