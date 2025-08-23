/**
 * Firebase Admin SDK Configuration
 * 
 * This configuration file sets up Firebase Admin SDK for server-side operations.
 * Make sure to set the following environment variables:
 * 
 * Option 1: Using Service Account Key File
 * - FIREBASE_SERVICE_ACCOUNT_KEY: Path to your service account key JSON file
 * 
 * Option 2: Using Environment Variables (Recommended for production)
 * - GOOGLE_APPLICATION_CREDENTIALS: Path to service account key file
 * - Or set these individual variables:
 *   - FIREBASE_PROJECT_ID
 *   - FIREBASE_CLIENT_EMAIL
 *   - FIREBASE_PRIVATE_KEY
 * 
 * For Cloud Functions or Google Cloud Platform, use Application Default Credentials.
 */

export interface FirebaseConfig {
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
  serviceAccountKeyPath?: string;
}

export const getFirebaseConfig = (): FirebaseConfig => {
  return {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    serviceAccountKeyPath: process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS,
  };
};

/**
 * Default Firebase project configuration from your Firebase console
 */
export const FIREBASE_PROJECT_CONFIG = {
  apiKey: "AIzaSyD0WrgYo7CZEAiZ3J87TRsZHczSQnhorBE",
  authDomain: "ongi-3f22b.firebaseapp.com",
  projectId: "ongi-3f22b",
  storageBucket: "ongi-3f22b.firebasestorage.app",
  messagingSenderId: "692580281358",
  appId: "1:692580281358:web:6f86e606a9d743e833e05f",
  measurementId: "G-DQ89QZFYSD"
};