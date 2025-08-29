import { INotificationRepository } from '@/domain/repositories';
import { Notification, NotificationType } from '@/domain/entities';

export interface ICreateNotificationRequest {
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
}

export interface IGetNotificationsRequest {
  recipientId: string;
  limit?: number;
  offset?: number;
}

export interface IGetNotificationsWithCursorRequest {
  recipientId: string;
  limit?: number;
  cursorId?: string;
}

export interface INotificationDataUseCase {
  createNotification(request: ICreateNotificationRequest): Promise<Notification>;
  getNotifications(request: IGetNotificationsRequest): Promise<Notification[]>;
  getNotificationsWithCursor(request: IGetNotificationsWithCursorRequest): Promise<Notification[]>;
  getUnreadNotifications(recipientId: string): Promise<Notification[]>;
  getUnreadCount(recipientId: string): Promise<number>;
  markAsRead(notificationId: string): Promise<Notification>;
  markAllAsRead(recipientId: string): Promise<void>;
  deleteNotification(notificationId: string): Promise<void>;
  getNotificationsByType(recipientId: string, type: NotificationType): Promise<Notification[]>;
}

export class NotificationDataUseCase implements INotificationDataUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async createNotification(request: ICreateNotificationRequest): Promise<Notification> {
    const notification = {
      recipientId: request.recipientId,
      type: request.type,
      title: request.title,
      message: request.message,
      isRead: false,
      data: request.data || null
    };

    return await this.notificationRepository.create(notification);
  }

  async getNotifications(request: IGetNotificationsRequest): Promise<Notification[]> {
    return await this.notificationRepository.findByRecipientId(
      request.recipientId,
      request.limit,
      request.offset
    );
  }

  async getNotificationsWithCursor(request: IGetNotificationsWithCursorRequest): Promise<Notification[]> {
    return await this.notificationRepository.findByRecipientIdWithCursor(
      request.recipientId,
      request.limit,
      request.cursorId
    );
  }

  async getUnreadNotifications(recipientId: string): Promise<Notification[]> {
    return await this.notificationRepository.findUnreadByRecipientId(recipientId);
  }

  async getUnreadCount(recipientId: string): Promise<number> {
    return await this.notificationRepository.countUnreadByRecipientId(recipientId);
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    return await this.notificationRepository.markAsRead(notificationId);
  }

  async markAllAsRead(recipientId: string): Promise<void> {
    await this.notificationRepository.markAllAsRead(recipientId);
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await this.notificationRepository.delete(notificationId);
  }

  async getNotificationsByType(recipientId: string, type: NotificationType): Promise<Notification[]> {
    return await this.notificationRepository.findByType(recipientId, type);
  }
}