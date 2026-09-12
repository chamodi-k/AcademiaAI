import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../models/dbAdapter.js';
import { config } from '../config/env.js';
import { User, StudentProfile } from '../types/index.js';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, fullName, degree, university, role } = req.body;

      if (!email || !password || !fullName) {
        res.status(400).json({ success: false, message: 'Email, password, and full name are required.' });
        return;
      }

      const existing = db.getUserByEmail(email);
      if (existing) {
        res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
        return;
      }

      const userId = 'usr-' + uuidv4().substring(0, 8);
      const studentId = 'std-' + uuidv4().substring(0, 8);
      const passwordHash = await bcrypt.hash(password, 10);

      const newUser: User = {
        id: userId,
        email: email.trim().toLowerCase(),
        password_hash: passwordHash,
        role: role === 'ADMIN' ? 'ADMIN' : 'STUDENT',
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      db.createUser(newUser);

      const newStudent: StudentProfile = {
        id: studentId,
        user_id: userId,
        full_name: fullName.trim(),
        student_id_number: 'STD-' + Math.floor(100000 + Math.random() * 900000),
        university: university || 'State University / Tech Institute',
        faculty: 'Faculty of Computing',
        degree: degree || 'BSc (Hons) in Software Engineering',
        academic_year: 1,
        current_semester: 1,
        target_gpa: 3.80,
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fullName)}`,
        bio: 'Student at ' + (university || 'State University'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      db.createStudentProfile(newStudent);

      // Issue JWT
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn as any }
      );

      res.status(201).json({
        success: true,
        message: 'Account successfully registered.',
        data: {
          token,
          user: {
            id: newUser.id,
            email: newUser.email,
            role: newUser.role
          },
          student: newStudent
        }
      });
    } catch (err: any) {
      console.error('Registration failed:', err);
      res.status(500).json({ success: false, message: 'Registration failed.' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ success: false, message: 'Email and password are required.' });
        return;
      }

      const user = db.getUserByEmail(email);
      if (!user) {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      if (user.status !== 'ACTIVE') {
        res.status(403).json({ success: false, message: 'Your account is suspended or inactive.' });
        return;
      }

      const student = db.getStudentByUserId(user.id);

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn as any }
      );

      res.json({
        success: true,
        message: 'Login successful.',
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            role: user.role
          },
          student
        }
      });
    } catch (err: any) {
      console.error('Login failed:', err);
      res.status(500).json({ success: false, message: 'Login failed.' });
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      const user = db.getUserById(req.user!.id);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      const student = db.getStudentByUserId(user.id);
      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            status: user.status
          },
          student
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve profile.', error: err.message });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const student = db.getStudentByUserId(req.user!.id);
      if (!student) {
        res.status(404).json({ success: false, message: 'Student profile not found.' });
        return;
      }

      const { full_name, university, faculty, degree, academic_year, current_semester, target_gpa, bio, avatar_url } = req.body;

      const updated = db.updateStudentProfile(student.id, {
        ...(full_name && { full_name }),
        ...(university && { university }),
        ...(faculty && { faculty }),
        ...(degree && { degree }),
        ...(academic_year !== undefined && { academic_year: Number(academic_year) }),
        ...(current_semester !== undefined && { current_semester: Number(current_semester) }),
        ...(target_gpa !== undefined && { target_gpa: Number(target_gpa) }),
        ...(bio !== undefined && { bio }),
        ...(avatar_url !== undefined && { avatar_url })
      });

      res.json({ success: true, message: 'Profile updated successfully.', data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to update profile.', error: err.message });
    }
  }

  static async changePassword(req: Request, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        res.status(400).json({ success: false, message: 'Current password and new password are required.' });
        return;
      }

      const user = db.getUserById(req.user!.id);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
        res.status(400).json({ success: false, message: 'Current password is incorrect.' });
        return;
      }

      const newHash = await bcrypt.hash(newPassword, 10);
      db.updateUser(user.id, { password_hash: newHash });

      res.json({ success: true, message: 'Password updated successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Password update failed.', error: err.message });
    }
  }
}
