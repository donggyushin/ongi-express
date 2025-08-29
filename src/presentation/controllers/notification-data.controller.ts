import { Request, Response } from 'express';
import { INotificationDataUseCase, ICreateNotificationRequest, IGetNotificationsRequest, IGetNotificationsWithCursorRequest } from '@/domain/use-cases/notification-data.use-case';
import { NotificationType } from '@/domain/entities';
import { ApiResponse } from '@/shared/types';
import { AuthenticatedRequest } from '@/presentation/middlewares';
import { IProfileRepository } from '@/domain/repositories';

export class NotificationDataController {
  constructor(
    private readonly notificationDataUseCase: INotificationDataUseCase,
    private readonly profileRepository: IProfileRepository
  ) {}

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
   * Get notifications for authenticated user
   * GET /notifications
   */
  getNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const accountId = req.userId;
      const limit = parseInt(req.query.limit as string) || 50;
      const cursorId = req.query.cursorId as string;

      if (!accountId) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'User authentication required'
        };
        res.status(401).json(response);
        return;
      }

      // Get profile by accountId to get profileId (recipientId)
      const profile = await this.profileRepository.findByAccountId(accountId);
      if (!profile) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Profile not found'
        };
        res.status(404).json(response);
        return;
      }

      const notifications = await this.notificationDataUseCase.getNotificationsWithCursor({
        recipientId: profile.id,
        limit,
        cursorId
      });

      // Enrich notifications with profile data when likerProfileId exists
      const enrichedNotifications = await Promise.all(
        notifications.map(async (notification) => {
          const notificationData = notification.toJSON();
          
          // If notification has likerProfileId in data, fetch the profile
          if (notificationData.data?.likerProfileId) {
            try {
              const likerProfile = await this.profileRepository.findById(notificationData.data.likerProfileId);
              if (likerProfile) {
                notificationData.data.likerProfile = likerProfile.toJSON();
              }
            } catch (error) {
              console.error('Failed to fetch liker profile:', error);
              // Continue without the profile data if fetch fails
            }
          }
          
          return notificationData;
        })
      );

      // Get the next cursor (ID of the last notification)
      const nextCursor = enrichedNotifications.length > 0 
        ? enrichedNotifications[enrichedNotifications.length - 1].id 
        : null;

      const response: ApiResponse<any> = {
        success: true,
        data: {
          notifications: enrichedNotifications,
          nextCursor,
          hasMore: enrichedNotifications.length === limit
        }
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
   * Get unread notifications for authenticated user
   * GET /notifications/unread
   */
  getUnreadNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const accountId = req.userId;

      if (!accountId) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'User authentication required'
        };
        res.status(401).json(response);
        return;
      }

      // Get profile by accountId to get profileId (recipientId)
      const profile = await this.profileRepository.findByAccountId(accountId);
      if (!profile) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Profile not found'
        };
        res.status(404).json(response);
        return;
      }

      const notifications = await this.notificationDataUseCase.getUnreadNotifications(profile.id);

      // Enrich notifications with profile data when likerProfileId exists
      const enrichedNotifications = await Promise.all(
        notifications.map(async (notification) => {
          const notificationData = notification.toJSON();
          
          // If notification has likerProfileId in data, fetch the profile
          if (notificationData.data?.likerProfileId) {
            try {
              const likerProfile = await this.profileRepository.findById(notificationData.data.likerProfileId);
              if (likerProfile) {
                notificationData.data.likerProfile = likerProfile.toJSON();
              }
            } catch (error) {
              console.error('Failed to fetch liker profile:', error);
              // Continue without the profile data if fetch fails
            }
          }
          
          return notificationData;
        })
      );

      const response: ApiResponse<any[]> = {
        success: true,
        data: enrichedNotifications
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
   * Get unread notification count for authenticated user
   * GET /notifications/unread/count
   */
  getUnreadCount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const accountId = req.userId;

      if (!accountId) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'User authentication required'
        };
        res.status(401).json(response);
        return;
      }

      // Get profile by accountId to get profileId (recipientId)
      const profile = await this.profileRepository.findByAccountId(accountId);
      if (!profile) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Profile not found'
        };
        res.status(404).json(response);
        return;
      }

      const count = await this.notificationDataUseCase.getUnreadCount(profile.id);

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
   * Mark all notifications as read for authenticated user
   * PATCH /notifications/read-all
   */
  markAllAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const accountId = req.userId;

      if (!accountId) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'User authentication required'
        };
        res.status(401).json(response);
        return;
      }

      // Get profile by accountId to get profileId (recipientId)
      const profile = await this.profileRepository.findByAccountId(accountId);
      if (!profile) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Profile not found'
        };
        res.status(404).json(response);
        return;
      }

      await this.notificationDataUseCase.markAllAsRead(profile.id);

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
   * Get notifications by type for authenticated user
   * GET /notifications/type/:type
   */
  getNotificationsByType = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const accountId = req.userId;
      const { type } = req.params;

      if (!accountId) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'User authentication required'
        };
        res.status(401).json(response);
        return;
      }

      if (!Object.values(NotificationType).includes(type as NotificationType)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Invalid notification type',
          message: `Valid types: ${Object.values(NotificationType).join(', ')}`
        };
        res.status(400).json(response);
        return;
      }

      // Get profile by accountId to get profileId (recipientId)
      const profile = await this.profileRepository.findByAccountId(accountId);
      if (!profile) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Profile not found'
        };
        res.status(404).json(response);
        return;
      }

      const notifications = await this.notificationDataUseCase.getNotificationsByType(
        profile.id,
        type as NotificationType
      );

      // Enrich notifications with profile data when likerProfileId exists
      const enrichedNotifications = await Promise.all(
        notifications.map(async (notification) => {
          const notificationData = notification.toJSON();
          
          // If notification has likerProfileId in data, fetch the profile
          if (notificationData.data?.likerProfileId) {
            try {
              const likerProfile = await this.profileRepository.findById(notificationData.data.likerProfileId);
              if (likerProfile) {
                notificationData.data.likerProfile = likerProfile.toJSON();
              }
            } catch (error) {
              console.error('Failed to fetch liker profile:', error);
              // Continue without the profile data if fetch fails
            }
          }
          
          return notificationData;
        })
      );

      const response: ApiResponse<any[]> = {
        success: true,
        data: enrichedNotifications
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