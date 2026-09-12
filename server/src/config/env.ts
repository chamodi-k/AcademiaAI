import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigins: (process.env.CLIENT_URL || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean),
  jwtSecret: process.env.JWT_SECRET || 'academia_ai_super_secret_jwt_key_2026_portfolio',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // Database Type: 'firebase' (default) | 'oracle' | 'local'
  dbType: process.env.DB_TYPE || 'firebase',

  // Firebase Cloud Firestore configuration
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : '',
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || '',
    databaseUrl: process.env.FIREBASE_DATABASE_URL || '',
  },

  // Gemini API
  geminiApiKey: process.env.GEMINI_API_KEY || '',
};
