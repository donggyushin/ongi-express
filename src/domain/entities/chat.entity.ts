import { Message } from './message.entity';
import { MessageReadInfo } from './message-read-info.entity';
import { Profile } from './profile.entity';

export class Chat {
  constructor(
    public readonly id: string,
    public readonly participantsIds: string[],
    public readonly messages: Message[] = [],
    public readonly messageReadInfos: MessageReadInfo[] = [],
    public readonly participants: Profile[] = [],
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  toJSON() {
    return {
      id: this.id,
      participantsIds: this.participantsIds,
      messages: this.messages.map(message => message.toJSON()),
      messageReadInfos: this.messageReadInfos.map(info => info.toJSON()),
      participants: this.participants.map(participant => participant.toJSON()),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }
}