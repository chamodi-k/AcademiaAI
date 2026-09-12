import { Router } from 'express';
import { AssignmentController } from '../controllers/assignmentController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.get('/', AssignmentController.getAssignments);
router.post('/', AssignmentController.createAssignment);
router.put('/:id', AssignmentController.updateAssignment);
router.delete('/:id', AssignmentController.deleteAssignment);

export default router;
