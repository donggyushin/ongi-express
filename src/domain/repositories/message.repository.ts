import { Message } from '@/domain/entities/message.entity';

export interface IMessageRepository {
  create(chatId: string, writerProfileId: string, text: string): Promise<Message>;
}