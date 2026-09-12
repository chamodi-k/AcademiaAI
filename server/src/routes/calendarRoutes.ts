import { Router } from 'express';
import { CalendarController } from '../controllers/calendarController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/export.ics', authenticate, CalendarController.exportCalendar);

export default router;
