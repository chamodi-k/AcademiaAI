import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { db } from './models/dbAdapter.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import timetableRoutes from './routes/timetableRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import examRoutes from './routes/examRoutes.js';
import gpaRoutes from './routes/gpaRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import calendarRoutes from './routes/calendarRoutes.js';
import notesRoutes from './routes/notesRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

// Middleware
app.use(cors({
  origin: config.clientOrigins.length > 0
    ? config.clientOrigins
    : config.nodeEnv === 'development'
      ? true
      : false,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AcademiaAI API',
    firebaseConnected: db.isFirebaseConnected,
    dbEngine: db.isFirebaseConnected ? 'Google Cloud Firestore (Live)' : 'Firebase Local Engine (Firestore Collections Structure)',
    geminiEnabled: Boolean(config.geminiApiKey)
  });
});

// Route registration
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/gpa', gpaRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);

  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ success: false, message: 'Request body must be valid JSON.' });
    return;
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error occurred.',
    error: config.nodeEnv === 'development' ? err.message : undefined
  });
});

// Start listening
app.listen(config.port, () => {
  console.log(`
  🚀 ============================================================
  🎓 AcademiaAI Backend Server running on port ${config.port}
  📡 Environment: ${config.nodeEnv}
  🗄️ Database: ${db.isFirebaseConnected ? 'Live Google Cloud Firestore' : 'Firebase Local Store (Firestore Collections Structure)'}
  🤖 Gemini AI: ${config.geminiApiKey ? 'Configured & Ready' : 'Intelligent Offline Fallback Active'}
  🌐 API Base: http://localhost:${config.port}/api
  ============================================================
  `);
});
