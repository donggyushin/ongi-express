import { Request, Response } from 'express';
import { INotificationDataUseCase, ICreateNotificationRequest, IGetNotificationsRequest } from '@/domain/use-cases/notification-data.use-case';
import { NotificationType } from '@/domain/entities';
import { ApiResponse } from '@/shared/types';

export class NotificationDataController {
  constructor(private readonly notificationDataUseCase: INotificationDataUseCase) {}

  /**
   * Create a new notification
   * POST /notifications
   */
  createNotification = async (req: Request, res: Response): Promise<void> => {
    try {
      const { recipientId, type, title, message, data }: ICreateNotificationRequest = req.body;

      if (!recipientId || !type || !title || !message) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Missing required fields',
          message: 'recipientId, type, title, and message are required'
        };
        res.status(400).json(response);
        return;
      }

      if (!Object.values(NotificationType).includes(type)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Invalid notification type',
          message: `Valid types: ${Object.values(NotificationType).join(', ')}`
        };
        res.status(400).json(response);
        return;
      }

      const notification = await this.notificationDataUseCase.createNotification({
        recipientId,
        type,
        title,
        message,
        data
      });

      const response: ApiResponse<any> = {
        success: true,
        data: notification.toJSON(),
        message: 'Notification created successfully'
      };

      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to create notification'
      };
      res.status(500).json(response);
    }
  };

  /**
   * Get notifications for a user
   * GET /notifications/:recipientId
   */
  getNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
      const { recipientId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const notifications = await this.notificationDataUseCase.getNotifications({
        recipientId,
        limit,
        offset
      });

      const response: ApiResponse<any[]> = {
        success: true,
        data: notifications.map(notification => notification.toJSON())
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to get notifications'
      };
      res.status(500).json(response);
    }
  };

  /**
   * Get unread notifications for a user
   * GET /notifications/:recipientId/unread
   */
  getUnreadNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
      const { recipientId } = req.params;

      const notifications = await this.notificationDataUseCase.getUnreadNotifications(recipientId);

      const response: ApiResponse<any[]> = {
        success: true,
        data: notifications.map(notification => notification.toJSON())
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to get unread notifications'
      };
      res.status(500).json(response);
    }
  };

  /**
   * Get unread notification count for a user
   * GET /notifications/:recipientId/unread/count
   */
  getUnreadCount = async (req: Request, res: Response): Promise<void> => {
    try {
      const { recipientId } = req.params;

      const count = await this.notificationDataUseCase.getUnreadCount(recipientId);

      const response: ApiResponse<{ count: number }> = {
        success: true,
        data: { count }
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to get unread count'
      };
      res.status(500).json(response);
    }
  };

  /**
   * Mark a notification as read
   * PATCH /notifications/:id/read
   */
  markAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const notification = await this.notificationDataUseCase.markAsRead(id);

      const response: ApiResponse<any> = {
        success: true,
        data: notification.toJSON(),
        message: 'Notification marked as read'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to mark notification as read'
      };
      res.status(500).json(response);
    }
  };

  /**
   * Mark all notifications as read for a user
   * PATCH /notifications/:recipientId/read-all
   */
  markAllAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const { recipientId } = req.params;

      await this.notificationDataUseCase.markAllAsRead(recipientId);

      const response: ApiResponse<null> = {
        success: true,
        message: 'All notifications marked as read'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to mark all notifications as read'
      };
      res.status(500).json(response);
    }
  };

  /**
   * Delete a notification
   * DELETE /notifications/:id
   */
  deleteNotification = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      await this.notificationDataUseCase.deleteNotification(id);

      const response: ApiResponse<null> = {
        success: true,
        message: 'Notification deleted successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to delete notification'
      };
      res.status(500).json(response);
    }
  };

  /**
   * Get notifications by type for a user
   * GET /notifications/:recipientId/type/:type
   */
  getNotificationsByType = async (req: Request, res: Response): Promise<void> => {
    try {
      const { recipientId, type } = req.params;

      if (!Object.values(NotificationType).includes(type as NotificationType)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Invalid notification type',
          message: `Valid types: ${Object.values(NotificationType).join(', ')}`
        };
        res.status(400).json(response);
        return;
      }

      const notifications = await this.notificationDataUseCase.getNotificationsByType(
        recipientId,
        type as NotificationType
      );

      const response: ApiResponse<any[]> = {
        success: true,
        data: notifications.map(notification => notification.toJSON())
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to get notifications by type'
      };
      res.status(500).json(response);
    }
  };
}