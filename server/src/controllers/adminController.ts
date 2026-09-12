import { Request, Response } from 'express';
import { db } from '../models/dbAdapter.js';

export class AdminController {
  static async getSystemStats(req: Request, res: Response) {
    try {
      const stats = db.getAdminStats();
      res.json({ success: true, data: stats });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve system statistics.', error: err.message });
    }
  }

  static async listAllUsers(req: Request, res: Response) {
    try {
      const users = db.getUsers().map(u => {
        const std = db.getStudentByUserId(u.id);
        return {
          id: u.id,
          email: u.email,
          role: u.role,
          status: u.status,
          created_at: u.created_at,
          student: std
        };
      });

      res.json({ success: true, data: users });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to list users.', error: err.message });
    }
  }

  static async updateUserStatus(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { status, role } = req.body;

      const updated = db.updateUser(id, {
        ...(status && { status }),
        ...(role && { role })
      });

      if (!updated) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      res.json({
        success: true,
        message: 'User status/role updated successfully.',
        data: {
          id: updated.id,
          email: updated.email,
          role: updated.role,
          status: updated.status
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to update user.', error: err.message });
    }
  }
}
