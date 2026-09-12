import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../models/dbAdapter.js';
import { GeminiService } from '../services/geminiService.js';
import { StudyPlan, Quiz, QuizQuestion } from '../types/index.js';

export class AiController {
  /**
   * 1. AI Study Planner (Gemini API)
   */
  static async generateStudyPlan(req: Request, res: Response) {
    try {
      const studentId = req.user?.studentId;
      if (!studentId) {
        res.status(404).json({ success: false, message: 'Student profile not found.' });
        return;
      }

      const { title, examDate, availableHoursPerDay, weakSubjects, subjectIds } = req.body;

      const allSubjects = db.getSubjects(studentId);
      const chosenSubjects = (subjectIds && subjectIds.length > 0)
        ? allSubjects.filter(s => subjectIds.includes(s.id))
        : allSubjects;

      const weakList = Array.isArray(weakSubjects) 
        ? weakSubjects 
        : (weakSubjects ? [weakSubjects] : chosenSubjects.filter(s => s.is_weak_subject).map(s => s.name));

      const dailyHours = availableHoursPerDay ? Number(availableHoursPerDay) : 3.0;

      const planData = await GeminiService.generateStudyPlan({
        subjects: chosenSubjects.map(s => ({ name: s.name, is_weak: weakList.includes(s.name), credits: s.credits })),
        examDate,
        availableHoursPerDay: dailyHours,
        weakSubjects: weakList
      });

      const newPlan: StudyPlan = {
        id: 'plan-' + uuidv4().substring(0, 8),
        student_id: studentId,
        title: title || `AI Revision Sprint (${chosenSubjects.map(s => s.code || s.name).join(', ')})`,
        target_exam_date: examDate ? new Date(examDate).toISOString() : undefined,
        available_hours_per_day: dailyHours,
        plan_data: planData,
        status: 'ACTIVE',
        created_at: new Date().toISOString()
      };

      db.saveStudyPlan(newPlan);
      db.logAiUsage(req.user!.id, 'STUDY_PLANNER');

      res.status(201).json({ success: true, message: 'AI Study plan generated successfully.', data: newPlan });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to generate AI study plan.', error: err.message });
    }
  }

  static async getStudyPlans(req: Request, res: Response) {
    try {
      const studentId = req.user?.studentId;
      if (!studentId) {
        res.status(404).json({ success: false, message: 'Student profile not found.' });
        return;
      }

      const plans = db.getStudyPlans(studentId);
      res.json({ success: true, data: plans });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch study plans.', error: err.message });
    }
  }

  static async toggleTask(req: Request, res: Response) {
    try {
      const planId = req.params.planId as string;
      const taskId = req.params.taskId as string;
      const ok = db.toggleStudyPlanTask(planId, taskId);

      if (!ok) {
        res.status(404).json({ success: false, message: 'Task or plan not found.' });
        return;
      }

      res.json({ success: true, message: 'Study task status toggled.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to toggle task.', error: err.message });
    }
  }

  /**
   * 2. AI Lecture Notes Summarizer
   */
  static async summarizeNotes(req: Request, res: Response) {
    try {
      const { content, title, subjectId } = req.body;

      if (!content || content.trim().length < 10) {
        res.status(400).json({ success: false, message: 'Notes content is too short to summarize.' });
        return;
      }

      const result = await GeminiService.summarizeNotes(content, title);
      db.logAiUsage(req.user!.id, 'NOTES_SUMMARIZER');

      // Optionally save to notes repository if studentId exists
      let savedNote = null;
      if (req.user?.studentId && title) {
        savedNote = db.saveNote({
          id: 'note-' + uuidv4().substring(0, 8),
          student_id: req.user.studentId,
          subject_id: subjectId,
          title: title.trim(),
          original_content: content,
          summary_content: result.summary_content,
          key_points: result.key_points,
          important_terms: result.important_terms,
          exam_tips: result.exam_tips,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      res.json({
        success: true,
        message: 'Summary generated successfully.',
        data: {
          ...result,
          savedNote
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to summarize notes.', error: err.message });
    }
  }

  /**
   * 3. AI Interactive Quiz Generator
   */
  static async generateQuiz(req: Request, res: Response) {
    try {
      const studentId = req.user?.studentId;
      if (!studentId) {
        res.status(404).json({ success: false, message: 'Student profile not found.' });
        return;
      }

      const { subjectName, topic, difficulty, questionCount, sourceText, subjectId } = req.body;

      if (!topic) {
        res.status(400).json({ success: false, message: 'Topic is required to generate a quiz.' });
        return;
      }

      const count = Math.min(10, Math.max(3, Number(questionCount) || 5));
      const diff = (difficulty === 'Easy' || difficulty === 'Hard') ? difficulty : 'Medium';
      const sName = subjectName || 'Computer Science & Software Engineering';

      const rawQuestions = await GeminiService.generateQuiz({
        subjectName: sName,
        topic,
        difficulty: diff,
        questionCount: count,
        sourceText
      });

      const questions: QuizQuestion[] = rawQuestions.map((q: any, idx: number) => ({
        id: `q-${idx + 1}-${uuidv4().substring(0, 4)}`,
        question: q.question,
        options: q.options,
        correct_option: q.correct_option,
        explanation: q.explanation
      }));

      const newQuiz: Quiz = {
        id: 'quiz-' + uuidv4().substring(0, 8),
        student_id: studentId,
        subject_id: subjectId,
        subject_name: sName,
        topic,
        difficulty: diff,
        total_questions: questions.length,
        score: 0,
        completed: false,
        questions,
        created_at: new Date().toISOString()
      };

      db.saveQuiz(newQuiz);
      db.logAiUsage(req.user!.id, 'QUIZ_GENERATOR');

      res.status(201).json({ success: true, message: 'Interactive quiz generated.', data: newQuiz });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to generate quiz.', error: err.message });
    }
  }

  static async submitQuiz(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { answers } = req.body; // Record<string, 'A' | 'B' | 'C' | 'D'>

      if (!answers) {
        res.status(400).json({ success: false, message: 'Answers object is required.' });
        return;
      }

      const updated = db.submitQuizAnswers(id, answers);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Quiz not found.' });
        return;
      }

      res.json({
        success: true,
        message: 'Quiz submitted and graded.',
        data: {
          quiz: updated,
          score: updated.score,
          total: updated.total_questions,
          percentage: Math.round((updated.score / updated.total_questions) * 100)
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to submit quiz.', error: err.message });
    }
  }

  static async getQuizzes(req: Request, res: Response) {
    try {
      const studentId = req.user?.studentId;
      if (!studentId) {
        res.status(404).json({ success: false, message: 'Student profile not found.' });
        return;
      }

      const quizzes = db.getQuizzes(studentId);
      res.json({ success: true, data: quizzes });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch quizzes.', error: err.message });
    }
  }
}
