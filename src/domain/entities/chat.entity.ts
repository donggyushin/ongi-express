import { Message } from './message.entity';
import { MessageReadInfo } from './message-read-info.entity';

export class Chat {
  constructor(
    public readonly id: string,
    public readonly participantsIds: string[],
    public readonly messages: Message[] = [],
    public readonly messageReadInfos: MessageReadInfo[] = [],
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  toJSON() {
    return {
      id: this.id,
      participantsIds: this.participantsIds,
      messages: this.messages.map(message => message.toJSON()),
      messageReadInfos: this.messageReadInfos.map(info => info.toJSON()),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }
}