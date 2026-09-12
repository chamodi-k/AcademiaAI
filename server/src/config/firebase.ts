import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert, applicationDefault, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { config } from './env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let firestoreDb: Firestore | null = null;
let firebaseApp: App | null = null;
let isFirebaseConnected = false;

export function initializeFirebase(): { db: Firestore | null; isConnected: boolean } {
  if (firestoreDb) {
    return { db: firestoreDb, isConnected: isFirebaseConnected };
  }

  try {
    let credential: any = null;

    // 1. Check for Service Account JSON file path
    if (config.firebase.serviceAccountPath) {
      const resolvedPath = path.isAbsolute(config.firebase.serviceAccountPath)
        ? config.firebase.serviceAccountPath
        : path.join(__dirname, '..', '..', config.firebase.serviceAccountPath);

      if (fs.existsSync(resolvedPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf-8'));
        credential = cert(serviceAccount);
        console.log(`✅ [Firebase] Loaded Service Account Key from: ${resolvedPath}`);
      } else {
        console.warn(`⚠️ [Firebase] Service account file not found at: ${resolvedPath}`);
      }
    }

    // 2. Check for environment variables (Private Key, Client Email, Project ID)
    if (!credential && config.firebase.projectId && config.firebase.clientEmail && config.firebase.privateKey) {
      credential = cert({
        projectId: config.firebase.projectId,
        clientEmail: config.firebase.clientEmail,
        privateKey: config.firebase.privateKey,
      });
      console.log(`✅ [Firebase] Loaded credentials from environment variables for project: ${config.firebase.projectId}`);
    }

    // 3. Fallback to Google Application Default Credentials
    if (!credential && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      if (fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
        credential = applicationDefault();
        console.log('✅ [Firebase] Loaded Google Application Default Credentials.');
      }
    }

    if (credential) {
      if (!getApps().length) {
        firebaseApp = initializeApp({
          credential,
          projectId: config.firebase.projectId || undefined,
        });
      } else {
        firebaseApp = getApps()[0];
      }

      firestoreDb = getFirestore(firebaseApp);
      firestoreDb.settings({ ignoreUndefinedProperties: true });
      isFirebaseConnected = true;
      console.log('🔥 [Firebase] Successfully connected to live Google Cloud Firestore!');
    } else {
      console.log('ℹ️ [Firebase] Firebase credentials not configured in .env. Running on local Firestore-structured repository engine.');
      isFirebaseConnected = false;
    }
  } catch (error: any) {
    console.warn('⚠️ [Firebase] Initialization failed:', error.message);
    console.log('ℹ️ [Firebase] Seamlessly fallen back to local persistent Firestore-structured engine.');
    isFirebaseConnected = false;
  }

  return { db: firestoreDb, isConnected: isFirebaseConnected };
}

export { firestoreDb, isFirebaseConnected };
