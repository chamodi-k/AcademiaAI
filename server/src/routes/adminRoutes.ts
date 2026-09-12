import { Router } from 'express';
import { AdminController } from '../controllers/adminController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, requireAdmin);
router.get('/stats', AdminController.getSystemStats);
router.get('/users', AdminController.listAllUsers);
router.put('/users/:id', AdminController.updateUserStatus);
router.get('/data/:entity', AdminController.listAcademicData);
router.post('/data/:entity', AdminController.createAcademicItem);
router.put('/data/:entity/:id', AdminController.updateAcademicItem);
router.delete('/data/:entity/:id', AdminController.deleteAcademicItem);
router.get('/notifications', AdminController.getAnnouncementQueue);
router.post('/notifications', AdminController.createAnnouncement);

export default router;
