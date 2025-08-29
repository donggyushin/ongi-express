export enum NotificationType {
  NEW_CONNECTION = 'NEW_CONNECTION',
  NEW_MESSAGE = 'NEW_MESSAGE',
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT',
  PROFILE_UPDATE_REMINDER = 'PROFILE_UPDATE_REMINDER'
}

export class Notification {
  constructor(
    public readonly id: string,
    public readonly recipientId: string,
    public readonly type: NotificationType,
    public readonly title: string,
    public readonly message: string,
    public readonly isRead: boolean = false,
    public readonly data: any = null,
    public readonly urlScheme?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  markAsRead(): Notification {
    return new Notification(
      this.id,
      this.recipientId,
      this.type,
      this.title,
      this.message,
      true,
      this.data,
      this.urlScheme,
      this.createdAt,
      new Date()
    );
  }

  toJSON() {
    return {
      id: this.id,
      recipientId: this.recipientId,
      type: this.type,
      title: this.title,
      message: this.message,
      isRead: this.isRead,
      data: this.data,
      urlScheme: this.urlScheme,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }
}