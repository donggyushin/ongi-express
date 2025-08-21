import { Chat, Message, MessageReadInfo } from '@/domain/entities';
import { IChatRepository } from '@/domain/repositories';
import { PrismaClient } from '../../generated/prisma';

export class PrismaChatService implements IChatRepository {
  constructor(private prisma: PrismaClient) {}

  async findByParticipantsIds(
    participantsIds: string[],
    options?: {
      limit?: number;
      cursor?: string;
    }
  ): Promise<Chat | null> {
    try {
      const sortedIds = [...participantsIds].sort();
      const limit = options?.limit ?? 100;
      
      const chat = await this.prisma.chat.findFirst({
        where: {
          participantsIds: { hasEvery: sortedIds }
        },
        include: {
          messages: {
            orderBy: {
              createdAt: 'desc' // Sort messages by creation date, newest first
            },
            take: limit,
            ...(options?.cursor && {
              cursor: {
                id: options.cursor
              },
              skip: 1 // Skip the cursor message itself
            })
          },
          messageReadInfos: true
        }
      });

      if (!chat) {
        return null;
      }

      // Convert Prisma entities to domain entities
      const messages = chat.messages.map(message => 
        new Message(
          message.id,
          message.writerProfileId,
          message.text,
          message.createdAt,
          message.updatedAt
        )
      );

      const messageReadInfos = chat.messageReadInfos.map(info =>
        new MessageReadInfo(
          info.id,
          info.profileId,
          info.dateInfoUserViewedRecently
        )
      );

      return new Chat(
        chat.id,
        chat.participantsIds,
        messages,
        messageReadInfos,
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