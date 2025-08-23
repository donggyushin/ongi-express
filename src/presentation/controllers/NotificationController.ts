import { Request, Response } from 'express';
import { INotificationUseCase, ISendNotificationRequest } from '@/domain/use-cases/notification.use-case';
import { ApiResponse } from '@/shared/types';

export class NotificationController {
  constructor(private readonly notificationUseCase: INotificationUseCase) {}

  /**
   * Send push notification
   * POST /notifications/send
   */
  sendNotification = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token, tokens, topic, title, body, data }: ISendNotificationRequest = req.body;

      if (!title || !body) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Missing required fields',
          message: 'Title and body are required'
        };
        res.status(400).json(response);
        return;
      }

      if (!token && !tokens && !topic) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Missing target',
          message: 'Either token, tokens, or topic must be provided'
        };
        res.status(400).json(response);
        return;
      }

      await this.notificationUseCase.sendNotification({
        token,
        tokens,
        topic,
        title,
        body,
        data
      });

      const response: ApiResponse<null> = {
        success: true,
        message: 'Notification sent successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to send notification'
      };
      res.status(500).json(response);
    }
  };
}