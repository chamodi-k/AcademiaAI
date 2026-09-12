import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../models/dbAdapter.js';
import { Note } from '../types/index.js';

export class NotesController {
  static async getNotes(req: Request, res: Response) {
    try {
      const studentId = req.user?.studentId;
      if (!studentId) {
        res.status(404).json({ success: false, message: 'Student profile not found.' });
        return;
      }

      const notes = db.getNotes(studentId);
      const subjects = db.getSubjects(studentId);
      res.json({ success: true, data: { notes, subjects } });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch notes.', error: err.message });
    }
  }

  static async createNote(req: Request, res: Response) {
    try {
      const studentId = req.user?.studentId;
      if (!studentId) {
        res.status(404).json({ success: false, message: 'Student profile not found.' });
        return;
      }

      const { title, original_content, subject_id, summary_content, key_points, important_terms, exam_tips } = req.body;

      if (!title || !original_content) {
        res.status(400).json({ success: false, message: 'Title and content are required.' });
        return;
      }

      const newNote: Note = {
        id: 'note-' + uuidv4().substring(0, 8),
        student_id: studentId,
        subject_id,
        title: title.trim(),
        original_content,
        summary_content,
        key_points,
        important_terms,
        exam_tips,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      db.saveNote(newNote);
      res.status(201).json({ success: true, message: 'Note saved.', data: newNote });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to save note.', error: err.message });
    }
  }

  static async deleteNote(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const ok = db.deleteNote(id);
      if (!ok) {
        res.status(404).json({ success: false, message: 'Note not found.' });
        return;
      }
      res.json({ success: true, message: 'Note deleted.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to delete note.', error: err.message });
    }
  }
}
