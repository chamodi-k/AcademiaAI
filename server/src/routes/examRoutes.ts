import { Router } from 'express';
import { ExamController } from '../controllers/examController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.get('/', ExamController.getExams);
router.post('/', ExamController.createExam);
router.put('/:id', ExamController.updateExam);
router.delete('/:id', ExamController.deleteExam);

export default router;
