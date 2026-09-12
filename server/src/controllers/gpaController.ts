import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../models/dbAdapter.js';
import { GradeRecord } from '../types/index.js';

export const GRADE_POINT_MAP: Record<string, number> = {
  'A+': 4.00,
  'A':  4.00,
  'A-': 3.70,
  'B+': 3.30,
  'B':  3.00,
  'B-': 2.70,
  'C+': 2.30,
  'C':  2.00,
  'C-': 1.70,
  'D+': 1.30,
  'D':  1.00,
  'E':  0.00,
  'F':  0.00
};

export class GpaController {
  static async getGpaData(req: Request, res: Response) {
    try {
      const studentId = req.user?.studentId;
      if (!studentId) {
        res.status(404).json({ success: false, message: 'Student profile not found.' });
        return;
      }

      const grades = db.getGrades(studentId);
      const subjects = db.getSubjects(studentId);
      const student = db.getStudentById(studentId);

      // Group by semester
      const semesterGroups: Record<number, {
        semester: number;
        grades: GradeRecord[];
        totalCredits: number;
        totalPoints: number;
        gpa: number;
      }> = {};

      let cumulativePoints = 0;
      let cumulativeCredits = 0;

      grades.forEach(g => {
        if (!semesterGroups[g.semester]) {
          semesterGroups[g.semester] = {
            semester: g.semester,
            grades: [],
            totalCredits: 0,
            totalPoints: 0,
            gpa: 0
          };
        }

        const pts = g.grade_point * g.credits;
        semesterGroups[g.semester].grades.push(g);
        semesterGroups[g.semester].totalCredits += g.credits;
        semesterGroups[g.semester].totalPoints += pts;

        cumulativePoints += pts;
        cumulativeCredits += g.credits;
      });

      // Calculate semester GPAs
      Object.values(semesterGroups).forEach(group => {
        group.gpa = group.totalCredits > 0 
          ? Math.round((group.totalPoints / group.totalCredits) * 100) / 100 
          : 0;
      });

      const overallGpa = cumulativeCredits > 0 
        ? Math.round((cumulativePoints / cumulativeCredits) * 100) / 100 
        : 0;

      const currentSemNum = student?.current_semester || 1;
      const currentSemesterGpa = semesterGroups[currentSemNum]?.gpa || overallGpa;

      res.json({
        success: true,
        data: {
          overallGpa,
          currentSemesterGpa,
          cumulativeCredits,
          targetGpa: student?.target_gpa || 3.80,
          semesterHistory: Object.values(semesterGroups).sort((a, b) => a.semester - b.semester),
          allGrades: grades,
          subjects,
          scale: GRADE_POINT_MAP
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to calculate GPA.', error: err.message });
    }
  }

  static async saveModuleGrade(req: Request, res: Response) {
    try {
      const studentId = req.user?.studentId;
      if (!studentId) {
        res.status(404).json({ success: false, message: 'Student profile not found.' });
        return;
      }

      const { subject_id, semester, letter_grade, credits } = req.body;

      if (!subject_id || semester === undefined || !letter_grade) {
        res.status(400).json({ success: false, message: 'Subject, semester, and letter grade are required.' });
        return;
      }

      const gradePoint = GRADE_POINT_MAP[letter_grade.toUpperCase()];
      if (gradePoint === undefined) {
        res.status(400).json({ success: false, message: 'Invalid letter grade provided.' });
        return;
      }

      const subject = db.getSubjectById(subject_id);
      const creds = credits ? Number(credits) : (subject?.credits || 3);

      const grade: GradeRecord = {
        id: 'grd-' + uuidv4().substring(0, 8),
        student_id: studentId,
        subject_id,
        semester: Number(semester),
        letter_grade: letter_grade.toUpperCase(),
        grade_point: gradePoint,
        credits: creds,
        created_at: new Date().toISOString()
      };

      db.saveGrade(grade);

      res.status(201).json({ success: true, message: 'Grade saved successfully.', data: grade });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to save grade.', error: err.message });
    }
  }

  static async deleteModuleGrade(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const deleted = db.deleteGrade(id);

      if (!deleted) {
        res.status(404).json({ success: false, message: 'Grade entry not found.' });
        return;
      }

      res.json({ success: true, message: 'Grade record deleted.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to delete grade record.', error: err.message });
    }
  }
}
