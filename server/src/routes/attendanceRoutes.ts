import { Router } from 'express';
import { AttendanceController } from '../controllers/attendanceController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.get('/', AttendanceController.getAttendanceList);
router.post('/:id/mark', AttendanceController.markAttendance);
router.put('/:id/rule', AttendanceController.updateRule);

export default router;
