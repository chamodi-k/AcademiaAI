import { Router } from 'express';
import { NotesController } from '../controllers/notesController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.get('/', NotesController.getNotes);
router.post('/', NotesController.createNote);
router.delete('/:id', NotesController.deleteNote);

export default router;
