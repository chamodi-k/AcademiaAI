import { Request, Response } from 'express';
import { db } from '../models/dbAdapter.js';

export class AttendanceController {
  static async getAttendanceList(req: Request, res: Response) {
    try {
      const studentId = req.user?.studentId;
      if (!studentId) {
        res.status(404).json({ success: false, message: 'Student profile not found.' });
        return;
      }

      const records = db.getAttendance(studentId);

      // Add analytics: Allowed future absences before falling below threshold
      const enriched = records.map(r => {
        const threshold = r.minimum_required_pct / 100;
        // Formula: attended / (total + x) >= threshold => attended - threshold * total >= threshold * x => x <= (attended - threshold * total) / threshold
        const maxMissable = Math.max(0, Math.floor((r.attended_classes - threshold * r.total_classes) / threshold));

        return {
          ...r,
          absent_classes: Math.max(0, r.total_classes - r.attended_classes),
          canMissMoreClasses: maxMissable
        };
      });

      res.json({ success: true, data: enriched });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve attendance.', error: err.message });
    }
  }

  static async markAttendance(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { type } = req.body; // 'present' or 'absent'

      if (type !== 'present' && type !== 'absent') {
        res.status(400).json({ success: false, message: "Type must be 'present' or 'absent'." });
        return;
      }

      const updated = db.markAttendance(id, type);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Attendance record not found.' });
        return;
      }

      const studentId = req.user?.studentId!;
      const enriched = db.getAttendance(studentId).find(a => a.id === id);

      res.json({
        success: true,
        message: `Marked as ${type === 'present' ? 'Present' : 'Absent'}.`,
        data: enriched
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to mark attendance.', error: err.message });
    }
  }

  static async updateRule(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { minimum_required_pct, total_classes, attended_classes } = req.body;

      const updates: any = {};
      if (minimum_required_pct !== undefined) {
        updates.minimum_required_pct = Math.min(100, Math.max(10, Number(minimum_required_pct)));
      }
      if (total_classes !== undefined) {
        updates.total_classes = Number(total_classes);
      }
      if (attended_classes !== undefined) {
        updates.attended_classes = Number(attended_classes);
      }

      const updated = db.updateAttendance(id, updates);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Attendance record not found.' });
        return;
      }

      const studentId = req.user?.studentId!;
      const enriched = db.getAttendance(studentId).find(a => a.id === id);

      res.json({ success: true, message: 'Attendance rule updated.', data: enriched });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to update attendance rule.', error: err.message });
    }
  }
}
