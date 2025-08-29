import { PrismaClient } from '../../generated/prisma';
import { INotificationRepository } from '@/domain/repositories';
import { Notification, NotificationType } from '@/domain/entities';

export class PrismaNotificationService implements INotificationRepository {
  constructor(private prisma: PrismaClient) {}

  async create(notification: {
    recipientId: string;
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;
    data?: any;
    urlScheme?: string;
  }): Promise<Notification> {
    const createdNotification = await this.prisma.notification.create({
      data: {
        recipientId: notification.recipientId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        isRead: notification.isRead,
        data: notification.data,
        urlScheme: notification.urlScheme
      }
    });

    return this.mapToNotificationEntity(createdNotification);
  }

  async findById(id: string): Promise<Notification | null> {
    const notification = await this.prisma.notification.findUnique({
      where: { id }
    });

    return notification ? this.mapToNotificationEntity(notification) : null;
  }

  async findByRecipientId(recipientId: string, limit: number = 50, offset: number = 0): Promise<Notification[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { recipientId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    return notifications.map(notification => this.mapToNotificationEntity(notification));
  }

  async findByRecipientIdWithCursor(recipientId: string, limit: number = 50, cursorId?: string): Promise<Notification[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { recipientId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursorId && {
        cursor: { id: cursorId },
        skip: 1
      })
    });

    return notifications.map(notification => this.mapToNotificationEntity(notification));
  }

  async findUnreadByRecipientId(recipientId: string): Promise<Notification[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { 
        recipientId,
        isRead: false
      },
      orderBy: { createdAt: 'desc' }
    });

    return notifications.map(notification => this.mapToNotificationEntity(notification));
  }

  async countUnreadByRecipientId(recipientId: string): Promise<number> {
    return await this.prisma.notification.count({
      where: { 
        recipientId,
        isRead: false
      }
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    const updatedNotification = await this.prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    return this.mapToNotificationEntity(updatedNotification);
  }

  async markAllAsRead(recipientId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { 
        recipientId,
        isRead: false
      },
      data: { isRead: true }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.notification.delete({
      where: { id }
    });
  }

  async deleteByRecipientId(recipientId: string): Promise<void> {
    await this.prisma.notification.deleteMany({
      where: { recipientId }
    });
  }

  async findByType(recipientId: string, type: NotificationType): Promise<Notification[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { 
        recipientId,
        type
      },
      orderBy: { createdAt: 'desc' }
    });

    return notifications.map(notification => this.mapToNotificationEntity(notification));
  }

  private mapToNotificationEntity(prismaNotification: any): Notification {
    return new Notification(
      prismaNotification.id,
      prismaNotification.recipientId,
      prismaNotification.type as NotificationType,
      prismaNotification.title,
      prismaNotification.message,
      prismaNotification.isRead,
      prismaNotification.data,
      prismaNotification.urlScheme,
      prismaNotification.createdAt,
      prismaNotification.updatedAt
    );
  }
}