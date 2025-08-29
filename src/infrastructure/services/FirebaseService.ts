import * as admin from 'firebase-admin';
import { IFirebaseService } from '@/domain/services/IFirebaseService';
import { ILoggerService } from './logger.service';

export class FirebaseService implements IFirebaseService {
  private initialized = false;
  private firebaseAvailable = false;

  constructor(private readonly loggerService: ILoggerService) {}

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Firebase Admin SDK initialization
      if (!admin.apps.length) {
        // Check if Firebase environment variables are available
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

        if (projectId && privateKey && clientEmail) {
          // Use environment variables
          let processedPrivateKey = privateKey;
          
          // Handle different private key formats
          if (privateKey.includes('\\n')) {
            // If key has escaped newlines, convert them to actual newlines
            processedPrivateKey = privateKey.replace(/\\n/g, '\n');
          }
          
          // Ensure proper formatting
          if (!processedPrivateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
            throw new Error('Invalid private key format: must start with -----BEGIN PRIVATE KEY-----');
          }
          
          this.loggerService.info('Initializing Firebase with environment variables', {
            projectId,
            clientEmail,
            privateKeyLength: processedPrivateKey.length,
            privateKeyFormat: processedPrivateKey.substring(0, 50) + '...'
          });
          
          try {
            // Test if the private key is properly formatted JSON-compatible
            const serviceAccount = {
              projectId,
              privateKey: processedPrivateKey,
              clientEmail,
            };
            
            admin.initializeApp({
              credential: admin.credential.cert(serviceAccount),
              projectId,
            });
            
            this.loggerService.info('Firebase credential created successfully');
          } catch (credentialError) {
            this.loggerService.error('Failed to create Firebase credentials', credentialError as Error);
            throw credentialError;
          }
        } else {
          // Fallback to application default credentials
          this.loggerService.warn('Firebase environment variables not found, trying application default credentials');
          admin.initializeApp({
            credential: admin.credential.applicationDefault(),
          });
        }
      }

      this.initialized = true;
      this.firebaseAvailable = true;
      this.loggerService.info('Firebase Admin SDK initialized successfully');
    } catch (error) {
      this.loggerService.error('Failed to initialize Firebase Admin SDK', error as Error);
      // Don't throw error - let the service continue without Firebase
      this.initialized = true;
      this.firebaseAvailable = false;
      this.loggerService.warn('Firebase will be disabled for this session');
    }
  }

  async verifyIdToken(token: string): Promise<any> {
    try {
      await this.ensureInitialized();
      const decodedToken = await admin.auth().verifyIdToken(token);
      return decodedToken;
    } catch (error) {
      this.loggerService.error('Failed to verify Firebase ID token', error as Error);
      throw new Error('Invalid Firebase ID token');
    }
  }

  async sendToDevice(token: string, title: string, body: string, data?: Record<string, string>): Promise<void> {
    try {
      await this.ensureInitialized();
      
      if (!this.firebaseAvailable) {
        this.loggerService.warn('Firebase not available, skipping push notification', {
          title,
          body,
          token: token.substring(0, 10) + '...'
        });
        return; // Silently skip if Firebase is not available
      }
      
      const message = {
        notification: {
          title,
          body,
        },
        data: data || {},
        token,
      };

      const response = await admin.messaging().send(message);
      this.loggerService.info('Successfully sent message to device', { 
        messageId: response, 
        token: token.substring(0, 10) + '...',
        title,
        body
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.loggerService.error('Failed to send message to device', error as Error);
      this.loggerService.info('Error details', { 
        errorMessage,
        token: token.substring(0, 10) + '...',
        title,
        body
      });
      
      // Check for specific Firebase errors
      if (errorMessage.includes('invalid_grant')) {
        this.loggerService.error('Firebase authentication failed - service account key may be invalid or expired');
      }
      
      throw new Error('Failed to send push notification');
    }
  }

  async sendToMultipleDevices(tokens: string[], title: string, body: string, data?: Record<string, string>): Promise<void> {
    try {
      await this.ensureInitialized();

      if (!this.firebaseAvailable) {
        this.loggerService.warn('Firebase not available, skipping multicast push notification', {
          title,
          body,
          tokenCount: tokens.length
        });
        return; // Silently skip if Firebase is not available
      }

      const message = {
        notification: {
          title,
          body,
        },
        data: data || {},
        tokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      this.loggerService.info('Successfully sent multicast message', { 
        successCount: response.successCount,
        failureCount: response.failureCount,
        totalTokens: tokens.length 
      });

      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            this.loggerService.warn('Failed to send to device', { 
              token: tokens[idx].substring(0, 10) + '...',
              error: resp.error?.message 
            });
          }
        });
      }
    } catch (error) {
      this.loggerService.error('Failed to send multicast message', error as Error);
      throw new Error('Failed to send push notifications');
    }
  }

  async sendToTopic(topic: string, title: string, body: string, data?: Record<string, string>): Promise<void> {
    try {
      await this.ensureInitialized();

      if (!this.firebaseAvailable) {
        this.loggerService.warn('Firebase not available, skipping topic push notification', {
          title,
          body,
          topic
        });
        return; // Silently skip if Firebase is not available
      }

      const message = {
        notification: {
          title,
          body,
        },
        data: data || {},
        topic,
      };

      const response = await admin.messaging().send(message);
      this.loggerService.info('Successfully sent message to topic', { 
        messageId: response, 
        topic,
        title,
        body 
      });
    } catch (error) {
      this.loggerService.error('Failed to send message to topic', error as Error);
      throw new Error('Failed to send topic notification');
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }
}