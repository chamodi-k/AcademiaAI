import { Router } from 'express';
import { AiController } from '../controllers/aiController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// Study Planner
router.post('/study-plan', AiController.generateStudyPlan);
router.get('/study-plans', AiController.getStudyPlans);
router.patch('/study-plan/:planId/task/:taskId', AiController.toggleTask);

// Notes Summarizer
router.post('/summarize-notes', AiController.summarizeNotes);

// Interactive Quiz
router.post('/quiz/generate', AiController.generateQuiz);
router.post('/quiz/:id/submit', AiController.submitQuiz);
router.get('/quizzes', AiController.getQuizzes);

export default router;
