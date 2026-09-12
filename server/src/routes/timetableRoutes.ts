import { Router } from 'express';
import { TimetableController } from '../controllers/timetableController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.get('/', TimetableController.getTimetable);
router.post('/', TimetableController.createClass);
router.put('/:id', TimetableController.updateClass);
router.delete('/:id', TimetableController.deleteClass);

export default router;
