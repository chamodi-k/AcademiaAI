import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../models/dbAdapter.js';
import { TimetableItem } from '../types/index.js';

export class TimetableController {
  static async getTimetable(req: Request, res: Response) {
    try {
      const studentId = req.user?.studentId;
      if (!studentId) {
        res.status(404).json({ success: false, message: 'Student profile not found.' });
        return;
      }

      const items = db.getTimetable(studentId);
      const subjects = db.getSubjects(studentId);
      res.json({ success: true, data: { timetable: items, subjects } });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve timetable.', error: err.message });
    }
  }

  static async createClass(req: Request, res: Response) {
    try {
      const studentId = req.user?.studentId;
      if (!studentId) {
        res.status(404).json({ success: false, message: 'Student profile not found.' });
        return;
      }

      const { subject_id, day_of_week, start_time, end_time, location, class_type } = req.body;

      if (!subject_id || !day_of_week || !start_time || !end_time) {
        res.status(400).json({ success: false, message: 'Subject, day, start time, and end time are required.' });
        return;
      }

      // Conflict detection
      const existing = db.getTimetable(studentId);
      const hasConflict = existing.some(t => 
        t.day_of_week === day_of_week && 
        ((start_time >= t.start_time && start_time < t.end_time) || 
         (end_time > t.start_time && end_time <= t.end_time) ||
         (start_time <= t.start_time && end_time >= t.end_time))
      );

      if (hasConflict) {
        res.status(409).json({ 
          success: false, 
          message: `Schedule conflict detected on ${day_of_week} between ${start_time} and ${end_time}.` 
        });
        return;
      }

      const newItem: TimetableItem = {
        id: 'tt-' + uuidv4().substring(0, 8),
        subject_id,
        day_of_week,
        start_time,
        end_time,
        location: location || 'TBA Room',
        class_type: class_type || 'Lecture',
        created_at: new Date().toISOString()
      };

      db.createTimetableItem(newItem);
      const enriched = db.getTimetable(studentId).find(t => t.id === newItem.id);

      res.status(201).json({ success: true, message: 'Class added to timetable.', data: enriched });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to add class.', error: err.message });
    }
  }

  static async updateClass(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { subject_id, day_of_week, start_time, end_time, location, class_type } = req.body;

      const updated = db.updateTimetableItem(id, {
        ...(subject_id && { subject_id }),
        ...(day_of_week && { day_of_week }),
        ...(start_time && { start_time }),
        ...(end_time && { end_time }),
        ...(location !== undefined && { location }),
        ...(class_type && { class_type })
      });

      if (!updated) {
        res.status(404).json({ success: false, message: 'Class schedule item not found.' });
        return;
      }

      const studentId = req.user?.studentId!;
      const enriched = db.getTimetable(studentId).find(t => t.id === id);

      res.json({ success: true, message: 'Class schedule updated.', data: enriched });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to update class.', error: err.message });
    }
  }

  static async deleteClass(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const deleted = db.deleteTimetableItem(id);

      if (!deleted) {
        res.status(404).json({ success: false, message: 'Class schedule item not found.' });
        return;
      }

      res.json({ success: true, message: 'Class removed from timetable.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to delete class.', error: err.message });
    }
  }
}
