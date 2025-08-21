import { Chat } from '@/domain/entities/chat.entity';
import { IChatRepository } from '@/domain/repositories';
import { PrismaClient } from '../../generated/prisma';

export class PrismaChatService implements IChatRepository {
  constructor(private prisma: PrismaClient) {}

  async findByParticipantsIds(participantsIds: string[]): Promise<Chat | null> {
    try {
      const sortedIds = [...participantsIds].sort();
      
      const chat = await this.prisma.chat.findFirst({
        where: {
          participantsIds: { hasEvery: sortedIds }
        },
        include: {
          messages: true,
          messageReadInfos: true
        }
      });

      if (!chat) {
        return null;
      }

      return new Chat(
        chat.id,
        chat.participantsIds,
        [],
        [],
        chat.createdAt,
        chat.updatedAt
      );
    } catch (error) {
      console.error('Error finding chat by participants:', error);
      throw new Error('Failed to find chat');
    }
  }

  async create(participantsIds: string[]): Promise<Chat> {
    try {
      const sortedIds = [...participantsIds].sort();
      
      const chat = await this.prisma.chat.create({
        data: {
          participantsIds: sortedIds
        }
      });

      return new Chat(
        chat.id,
        chat.participantsIds,
        [],
        [],
        chat.createdAt,
        chat.updatedAt
      );
    } catch (error) {
      console.error('Error creating chat:', error);
      throw new Error('Failed to create chat');
    }
  }
}