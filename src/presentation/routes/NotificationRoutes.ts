import { Router } from 'express';
import { NotificationController } from '@/presentation/controllers/NotificationController';
import { FirebaseAuthMiddleware } from '@/presentation/middlewares/FirebaseAuthMiddleware';
import { IFirebaseService } from '@/domain/services/IFirebaseService';

export class NotificationRoutes {
  private router: Router;
  private authMiddleware: FirebaseAuthMiddleware;

  constructor(
    private readonly notificationController: NotificationController,
    private readonly firebaseService: IFirebaseService
  ) {
    this.router = Router();
    this.authMiddleware = new FirebaseAuthMiddleware(this.firebaseService);
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    /**
     * @route POST /notifications/send
     * @desc Send push notification
     * @access Private (requires Firebase authentication)
     * @body {
     *   token?: string,        // Single FCM token
     *   tokens?: string[],     // Multiple FCM tokens
     *   topic?: string,        // Topic name
     *   title: string,         // Notification title
     *   body: string,          // Notification body
     *   data?: Record<string, string> // Additional data
     * }
     */
    this.router.post('/send', this.authMiddleware.authenticate, this.notificationController.sendNotification);
  }

  getRouter(): Router {
    return this.router;
  }
}