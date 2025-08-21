import { Message } from '@/domain/entities/message.entity';
import { IMessageRepository } from '@/domain/repositories';
import { PrismaClient } from '../../generated/prisma';

export class PrismaMessageService implements IMessageRepository {
  constructor(private prisma: PrismaClient) {}

  async create(chatId: string, writerProfileId: string, text: string): Promise<Message> {
    try {
      const message = await this.prisma.message.create({
        data: {
          writerProfileId,
          text,
          chatId
        }
      });

      // Update chat's updatedAt timestamp
      await this.prisma.chat.update({
        where: { id: chatId },
        data: { updatedAt: new Date() }
      });

      return new Message(
        message.id,
        message.writerProfileId,
        message.text,
        message.createdAt,
        message.updatedAt
      );
    } catch (error) {
      console.error('Error creating message:', error);
      throw new Error('Failed to create message');
    }
  }
}