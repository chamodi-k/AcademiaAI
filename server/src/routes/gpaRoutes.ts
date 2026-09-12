import { Router } from 'express';
import { GpaController } from '../controllers/gpaController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.get('/', GpaController.getGpaData);
router.post('/grades', GpaController.saveModuleGrade);
router.delete('/grades/:id', GpaController.deleteModuleGrade);

export default router;
