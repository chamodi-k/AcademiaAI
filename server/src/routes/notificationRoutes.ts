import { Router } from 'express';
import { randomUUID } from 'crypto';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { NotificationController } from '../controllers/notificationController.js';
import { db } from '../models/dbAdapter.js';

const router = Router();

router.use(authenticate);
router.get('/', NotificationController.listMyNotifications);
router.patch('/:id/read', NotificationController.markAsRead);
router.patch('/mark-all-read', NotificationController.markAllAsRead);
router.post('/announce', requireAdmin, async (req, res) => {
  try {
    const { title, message, type, targetUserIds } = req.body;

    if (!title || !message) {
      res.status(400).json({ success: false, message: 'Title and message are required.' });
      return;
    }

    const users = Array.isArray(targetUserIds) && targetUserIds.length > 0
      ? targetUserIds
      : db.getUsers().filter(u => u.role === 'STUDENT' && u.status === 'ACTIVE').map(u => u.id);

    const notifications = users.map(userId => ({
      id: 'notif-' + randomUUID().substring(0, 8),
      user_id: userId,
      title: String(title).trim(),
      message: String(message).trim(),
      type: (type && ['INFO', 'WARNING', 'SUCCESS', 'ANNOUNCEMENT'].includes(type)) ? type : 'ANNOUNCEMENT',
      is_read: 0,
      created_at: new Date().toISOString(),
      related_id: undefined,
      link: '/'
    }));

    const created = db.createNotifications(notifications);
    res.status(201).json({ success: true, message: 'Announcement sent.', data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to send announcement.', error: err.message });
  }
});

export default router;
