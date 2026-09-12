import { Router } from 'express';
import { SubjectController } from '../controllers/subjectController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.get('/', SubjectController.getSubjects);
router.post('/', SubjectController.createSubject);
router.put('/:id', SubjectController.updateSubject);
router.delete('/:id', SubjectController.deleteSubject);

export default router;
