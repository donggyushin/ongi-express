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
    // POST /notifications - Create a new notification (admin/system use)
    this.router.post('/', this.notificationDataController.createNotification);

    // GET /notifications - Get notifications for authenticated user
    this.router.get('/', AuthMiddleware.verifyToken, this.notificationDataController.getNotifications);

    // GET /notifications/unread - Get unread notifications for authenticated user
    this.router.get('/unread', AuthMiddleware.verifyToken, this.notificationDataController.getUnreadNotifications);

    // GET /notifications/unread/count - Get unread notification count for authenticated user
    this.router.get('/unread/count', AuthMiddleware.verifyToken, this.notificationDataController.getUnreadCount);

    // PATCH /notifications/:id/read - Mark a notification as read
    this.router.patch('/:id/read', AuthMiddleware.verifyToken, this.notificationDataController.markAsRead);

    // PATCH /notifications/read-all - Mark all notifications as read for authenticated user
    this.router.patch('/read-all', AuthMiddleware.verifyToken, this.notificationDataController.markAllAsRead);

    // DELETE /notifications/:id - Delete a notification
    this.router.delete('/:id', AuthMiddleware.verifyToken, this.notificationDataController.deleteNotification);

    // GET /notifications/type/:type - Get notifications by type for authenticated user
    this.router.get('/type/:type', AuthMiddleware.verifyToken, this.notificationDataController.getNotificationsByType);
  }

  public getRouter(): Router {
    return this.router;
  }
}