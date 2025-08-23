import { IFirebaseService } from '@/domain/services/IFirebaseService';

export interface ISendNotificationRequest {
  token?: string;
  tokens?: string[];
  topic?: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface INotificationUseCase {
  sendNotification(request: ISendNotificationRequest): Promise<void>;
}

export class NotificationUseCase implements INotificationUseCase {
  constructor(private readonly firebaseService: IFirebaseService) {}

  async sendNotification(request: ISendNotificationRequest): Promise<void> {
    const { token, tokens, topic, title, body, data } = request;

    if (token) {
      await this.firebaseService.sendToDevice(token, title, body, data);
    } else if (tokens && tokens.length > 0) {
      await this.firebaseService.sendToMultipleDevices(tokens, title, body, data);
    } else if (topic) {
      await this.firebaseService.sendToTopic(topic, title, body, data);
    } else {
      throw new Error('Either token, tokens, or topic must be provided');
    }
  }
}