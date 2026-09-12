import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../models/dbAdapter.js';
import { NotificationType } from '../types/index.js';

export class NotificationController {
  static async listMyNotifications(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const items = db.getNotifications(userId);
      res.json({
        success: true,
        data: items,
        unreadCount: items.filter(item => item.is_read === 0).length
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch notifications.', error: err.message });
    }
  }

  static async markAsRead(req: Request, res: Response) {
    try {
      const notificationId = req.params.id;
      const userId = req.user?.id;
      const item = db.getNotificationById(notificationId);

      if (!item) {
        res.status(404).json({ success: false, message: 'Notification not found.' });
        return;
      }

      if (item.user_id !== userId) {
        res.status(403).json({ success: false, message: 'You do not have permission to update this notification.' });
        return;
      }

      const updated = db.markNotificationRead(notificationId);
      res.json({
        success: true,
        message: updated ? 'Notification marked as read.' : 'Notification update failed.',
        data: updated ? { ...item, is_read: 1 } : null
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to mark notification as read.', error: err.message });
    }
  }

  static async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const count = db.markAllNotificationsRead(userId);
      res.json({
        success: true,
        message: count > 0 ? `${count} notification(s) marked as read.` : 'No unread notifications to mark.',
        data: { count }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to mark notifications as read.', error: err.message });
    }
  }

  static async createSystemNotificationForUser(userId: string, payload: {
    title: string;
    message: string;
    type?: NotificationType;
    related_id?: string;
    link?: string;
  }) {
    const notification = {
      id: 'notif-' + uuidv4().substring(0, 8),
      user_id: userId,
      title: payload.title.trim(),
      message: payload.message.trim(),
      type: payload.type || 'INFO',
      is_read: 0,
      created_at: new Date().toISOString(),
      related_id: payload.related_id,
      link: payload.link
    };

    return db.createNotification(notification);
  }
}
