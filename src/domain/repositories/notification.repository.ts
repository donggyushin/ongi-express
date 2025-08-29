import { Notification, NotificationType } from '../entities';

export interface INotificationRepository {
  create(notification: {
    recipientId: string;
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;
    data?: any;
  }): Promise<Notification>;
  findById(id: string): Promise<Notification | null>;
  findByRecipientId(recipientId: string, limit?: number, offset?: number): Promise<Notification[]>;
  findByRecipientIdWithCursor(recipientId: string, limit?: number, cursorId?: string): Promise<Notification[]>;
  findUnreadByRecipientId(recipientId: string): Promise<Notification[]>;
  countUnreadByRecipientId(recipientId: string): Promise<number>;
  markAsRead(id: string): Promise<Notification>;
  markAllAsRead(recipientId: string): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByRecipientId(recipientId: string): Promise<void>;
  findByType(recipientId: string, type: NotificationType): Promise<Notification[]>;
}