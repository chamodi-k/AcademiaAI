import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../models/dbAdapter.js';
import { Assignment, Exam, Subject, TimetableItem } from '../types/index.js';

export class AdminController {
  static async getSystemStats(req: Request, res: Response) {
    try {
      const stats = db.getAdminStats();
      res.json({ success: true, data: stats });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve system statistics.', error: err.message });
    }
  }

  static async listAllUsers(req: Request, res: Response) {
    try {
      const users = db.getUsers().map(u => {
        const std = db.getStudentByUserId(u.id);
        return {
          id: u.id,
          email: u.email,
          role: u.role,
          status: u.status,
          created_at: u.created_at,
          student: std
        };
      });

      res.json({ success: true, data: users });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to list users.', error: err.message });
    }
  }

  static async updateUserStatus(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { status, role } = req.body;

      const updated = db.updateUser(id, {
        ...(status && { status }),
        ...(role && { role })
      });

      if (!updated) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      res.json({
        success: true,
        message: 'User status/role updated successfully.',
        data: {
          id: updated.id,
          email: updated.email,
          role: updated.role,
          status: updated.status
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to update user.', error: err.message });
    }
  }

  static async listAcademicData(req: Request, res: Response) {
    try {
      const { entity } = req.params as { entity: string };
      switch (entity) {
        case 'subjects': {
          const data = db.getUsers().flatMap(user => {
            if (user.role !== 'STUDENT') return [];
            const student = db.getStudentByUserId(user.id);
            return db.getSubjects(student?.id ?? '').map(subject => ({ ...subject, studentName: student?.full_name || user.email }));
          });
          res.json({ success: true, data });
          return;
        }
        case 'timetable': {
          const data = db.getUsers().flatMap(user => {
            if (user.role !== 'STUDENT') return [];
            const student = db.getStudentByUserId(user.id);
            return db.getTimetable(student?.id ?? '').map(item => ({ ...item, studentName: student?.full_name || user.email }));
          });
          res.json({ success: true, data });
          return;
        }
        case 'assignments': {
          const data = db.getUsers().flatMap(user => {
            if (user.role !== 'STUDENT') return [];
            const student = db.getStudentByUserId(user.id);
            return db.getAssignments(student?.id ?? '').map(item => ({ ...item, studentName: student?.full_name || user.email }));
          });
          res.json({ success: true, data });
          return;
        }
        case 'exams': {
          const data = db.getUsers().flatMap(user => {
            if (user.role !== 'STUDENT') return [];
            const student = db.getStudentByUserId(user.id);
            return db.getExams(student?.id ?? '').map(item => ({ ...item, studentName: student?.full_name || user.email }));
          });
          res.json({ success: true, data });
          return;
        }
        case 'attendance': {
          const data = db.getUsers().flatMap(user => {
            if (user.role !== 'STUDENT') return [];
            const student = db.getStudentByUserId(user.id);
            return db.getAttendance(student?.id ?? '').map(item => ({ ...item, studentName: student?.full_name || user.email }));
          });
          res.json({ success: true, data });
          return;
        }
        case 'grades': {
          const data = db.getUsers().flatMap(user => {
            if (user.role !== 'STUDENT') return [];
            const student = db.getStudentByUserId(user.id);
            return db.getGrades(student?.id ?? '').map(item => ({ ...item, studentName: student?.full_name || user.email }));
          });
          res.json({ success: true, data });
          return;
        }
        default:
          res.status(400).json({ success: false, message: 'Unsupported academic entity.' });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch academic data.', error: err.message });
    }
  }

  static async createAcademicItem(req: Request, res: Response) {
    try {
      const { entity } = req.params as { entity: string };
      const payload = req.body;

      if (entity === 'subjects') {
        const { student_id, code, name, lecturer, credits, semester, color_hex, is_weak_subject } = payload;
        if (!student_id || !code || !name) {
          res.status(400).json({ success: false, message: 'Student, subject code, and name are required.' });
          return;
        }

        const newSubject: Subject = {
          id: 'sub-' + uuidv4().substring(0, 8),
          student_id,
          code: String(code).trim().toUpperCase(),
          name: String(name).trim(),
          lecturer: lecturer ? String(lecturer).trim() : 'Staff Lecturer',
          credits: Number(credits || 3),
          semester: Number(semester || 1),
          color_hex: color_hex || '#4f46e5',
          is_weak_subject: is_weak_subject ? 1 : 0,
          created_at: new Date().toISOString(),
        };

        const created = db.createSubject(newSubject);
        res.status(201).json({ success: true, message: 'Subject created.', data: created });
        return;
      }

      if (entity === 'timetable') {
        const { subject_id, day_of_week, start_time, end_time, location, class_type } = payload;
        if (!subject_id || !day_of_week || !start_time || !end_time) {
          res.status(400).json({ success: false, message: 'Subject, day, and times are required.' });
          return;
        }

        const newItem: TimetableItem = {
          id: 'tt-' + uuidv4().substring(0, 8),
          subject_id,
          day_of_week,
          start_time,
          end_time,
          location: location || 'TBA',
          class_type: class_type || 'Lecture',
          created_at: new Date().toISOString(),
        };

        const created = db.createTimetableItem(newItem);
        res.status(201).json({ success: true, message: 'Timetable item created.', data: created });
        return;
      }

      if (entity === 'assignments') {
        const { student_id, subject_id, title, description, due_date, priority, status, weightage } = payload;
        if (!student_id || !subject_id || !title || !due_date) {
          res.status(400).json({ success: false, message: 'Student, subject, title, and due date are required.' });
          return;
        }

        const newAssignment: Assignment = {
          id: 'asg-' + uuidv4().substring(0, 8),
          student_id,
          subject_id,
          title: String(title).trim(),
          description: description || '',
          due_date: new Date(due_date).toISOString(),
          priority: priority || 'Medium',
          status: status || 'Pending',
          weightage: weightage ? Number(weightage) : 10,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const created = db.createAssignment(newAssignment);
        res.status(201).json({ success: true, message: 'Assignment created.', data: created });
        return;
      }

      if (entity === 'exams') {
        const { student_id, subject_id, exam_type, exam_date, location, weightage, notes } = payload;
        if (!student_id || !subject_id || !exam_type || !exam_date) {
          res.status(400).json({ success: false, message: 'Student, subject, exam type, and exam date are required.' });
          return;
        }

        const newExam: Exam = {
          id: 'exm-' + uuidv4().substring(0, 8),
          student_id,
          subject_id,
          exam_type: String(exam_type).trim(),
          exam_date: new Date(exam_date).toISOString(),
          location: location || 'TBA Examination Hall',
          weightage: Number(weightage || 30),
          status: 'Upcoming',
          notes: notes || '',
          created_at: new Date().toISOString(),
        };

        const created = db.createExam(newExam);
        res.status(201).json({ success: true, message: 'Exam created.', data: created });
        return;
      }

      res.status(400).json({ success: false, message: 'Unsupported entity for creation.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to create item.', error: err.message });
    }
  }

  static async updateAcademicItem(req: Request, res: Response) {
    try {
      const { entity, id } = req.params as { entity: string; id: string };
      const payload = req.body;

      if (entity === 'subjects') {
        const updated = db.updateSubject(id, payload);
        res.json({ success: true, message: 'Subject updated.', data: updated });
        return;
      }

      if (entity === 'timetable') {
        const updated = db.updateTimetableItem(id, payload);
        res.json({ success: true, message: 'Timetable item updated.', data: updated });
        return;
      }

      if (entity === 'assignments') {
        const updated = db.updateAssignment(id, payload);
        res.json({ success: true, message: 'Assignment updated.', data: updated });
        return;
      }

      if (entity === 'exams') {
        const updated = db.updateExam(id, payload);
        res.json({ success: true, message: 'Exam updated.', data: updated });
        return;
      }

      res.status(400).json({ success: false, message: 'Unsupported entity for update.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to update item.', error: err.message });
    }
  }

  static async deleteAcademicItem(req: Request, res: Response) {
    try {
      const { entity, id } = req.params as { entity: string; id: string };

      if (entity === 'subjects') {
        const deleted = db.deleteSubject(id);
        res.json({ success: true, message: deleted ? 'Subject deleted.' : 'Subject not found.' });
        return;
      }

      if (entity === 'timetable') {
        const deleted = db.deleteTimetableItem(id);
        res.json({ success: true, message: deleted ? 'Timetable item deleted.' : 'Timetable item not found.' });
        return;
      }

      if (entity === 'assignments') {
        const deleted = db.deleteAssignment(id);
        res.json({ success: true, message: deleted ? 'Assignment deleted.' : 'Assignment not found.' });
        return;
      }

      if (entity === 'exams') {
        const deleted = db.deleteExam(id);
        res.json({ success: true, message: deleted ? 'Exam deleted.' : 'Exam not found.' });
        return;
      }

      res.status(400).json({ success: false, message: 'Unsupported entity for deletion.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to delete item.', error: err.message });
    }
  }

  static async getAnnouncementQueue(req: Request, res: Response) {
    try {
      const items = db.getNotificationsForAdmins?.() ?? db.getNotifications('usr-student-01').slice(0, 20);
      res.json({ success: true, data: items });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch sent notifications.', error: err.message });
    }
  }

  static async createAnnouncement(req: Request, res: Response) {
    try {
      const { title, message, type, targetUserIds } = req.body;

      if (!title || !message) {
        res.status(400).json({ success: false, message: 'Title and message are required.' });
        return;
      }

      const candidateUserIds = Array.isArray(targetUserIds) && targetUserIds.length > 0
        ? targetUserIds.filter((id: string) => !!id)
        : db.getUsers().filter(u => u.role === 'STUDENT' && u.status === 'ACTIVE').map(u => u.id);

      const notifications = candidateUserIds.map((userId: string) => ({
        id: 'notif-' + uuidv4().substring(0, 8),
        user_id: userId,
        title: String(title).trim(),
        message: String(message).trim(),
        type: ['INFO', 'WARNING', 'SUCCESS', 'ANNOUNCEMENT'].includes(type) ? type : 'ANNOUNCEMENT',
        is_read: 0,
        created_at: new Date().toISOString(),
        link: '/'
      }));

      const created = db.createNotifications(notifications);
      res.status(201).json({ success: true, message: 'Announcement sent to students.', data: created });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to create announcement.', error: err.message });
    }
  }
}
