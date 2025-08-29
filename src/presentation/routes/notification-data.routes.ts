import { Router } from 'express';
import { NotificationDataController } from '../controllers';
import { AuthMiddleware } from '../middlewares';

export class NotificationDataRoutes {
  private router: Router;

  constructor(private notificationDataController: NotificationDataController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // POST /notifications - Create a new notification
    this.router.post('/', this.notificationDataController.createNotification);

    // GET /notifications/:recipientId - Get notifications for a user
    this.router.get('/:recipientId', AuthMiddleware.verifyToken, this.notificationDataController.getNotifications);

    // GET /notifications/:recipientId/unread - Get unread notifications for a user
    this.router.get('/:recipientId/unread', AuthMiddleware.verifyToken, this.notificationDataController.getUnreadNotifications);

    // GET /notifications/:recipientId/unread/count - Get unread notification count for a user
    this.router.get('/:recipientId/unread/count', AuthMiddleware.verifyToken, this.notificationDataController.getUnreadCount);

    // PATCH /notifications/:id/read - Mark a notification as read
    this.router.patch('/:id/read', AuthMiddleware.verifyToken, this.notificationDataController.markAsRead);

    // PATCH /notifications/:recipientId/read-all - Mark all notifications as read for a user
    this.router.patch('/:recipientId/read-all', AuthMiddleware.verifyToken, this.notificationDataController.markAllAsRead);

    // DELETE /notifications/:id - Delete a notification
    this.router.delete('/:id', AuthMiddleware.verifyToken, this.notificationDataController.deleteNotification);

    // GET /notifications/:recipientId/type/:type - Get notifications by type for a user
    this.router.get('/:recipientId/type/:type', AuthMiddleware.verifyToken, this.notificationDataController.getNotificationsByType);
  }

  public getRouter(): Router {
    return this.router;
  }
}