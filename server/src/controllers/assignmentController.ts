import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../models/dbAdapter.js';
import { Assignment } from '../types/index.js';

export class AssignmentController {
  static async getAssignments(req: Request, res: Response) {
    try {
      const studentId = req.user?.studentId;
      if (!studentId) {
        res.status(404).json({ success: false, message: 'Student profile not found.' });
        return;
      }

      const assignments = db.getAssignments(studentId);
      const subjects = db.getSubjects(studentId);

      res.json({ success: true, data: { assignments, subjects } });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch assignments.', error: err.message });
    }
  }

  static async createAssignment(req: Request, res: Response) {
    try {
      const studentId = req.user?.studentId;
      if (!studentId) {
        res.status(404).json({ success: false, message: 'Student profile not found.' });
        return;
      }

      const { subject_id, title, description, due_date, priority, status, weightage } = req.body;

      if (!subject_id || !title || !due_date) {
        res.status(400).json({ success: false, message: 'Subject, title, and due date are required.' });
        return;
      }

      const newAssignment: Assignment = {
        id: 'asg-' + uuidv4().substring(0, 8),
        student_id: studentId,
        subject_id,
        title: title.trim(),
        description: description || '',
        due_date: new Date(due_date).toISOString(),
        priority: priority || 'Medium',
        status: status || 'Pending',
        weightage: weightage ? Number(weightage) : 10,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      db.createAssignment(newAssignment);
      const enriched = db.getAssignments(studentId).find(a => a.id === newAssignment.id);

      res.status(201).json({ success: true, message: 'Assignment created.', data: enriched });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to create assignment.', error: err.message });
    }
  }

  static async updateAssignment(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { subject_id, title, description, due_date, priority, status, weightage } = req.body;

      const updated = db.updateAssignment(id, {
        ...(subject_id && { subject_id }),
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description }),
        ...(due_date && { due_date: new Date(due_date).toISOString() }),
        ...(priority && { priority }),
        ...(status && { status }),
        ...(weightage !== undefined && { weightage: Number(weightage) })
      });

      if (!updated) {
        res.status(404).json({ success: false, message: 'Assignment not found.' });
        return;
      }

      const studentId = req.user?.studentId!;
      const enriched = db.getAssignments(studentId).find(a => a.id === id);

      res.json({ success: true, message: 'Assignment updated.', data: enriched });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to update assignment.', error: err.message });
    }
  }

  static async deleteAssignment(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const deleted = db.deleteAssignment(id);

      if (!deleted) {
        res.status(404).json({ success: false, message: 'Assignment not found.' });
        return;
      }

      res.json({ success: true, message: 'Assignment deleted.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to delete assignment.', error: err.message });
    }
  }
}
