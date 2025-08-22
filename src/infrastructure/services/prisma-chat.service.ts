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

  async findByProfileId(profileId: string): Promise<Chat[]> {
    try {
      const chats = await this.prisma.chat.findMany({
        where: {
          participantsIds: {
            has: profileId
          }
        },
        include: {
          messages: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1 // Get only the latest message for chat list
          },
          messageReadInfos: true
        },
        orderBy: {
          updatedAt: 'desc' // Sort chats by most recently updated
        }
      });

      return chats.map(chat => {
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
      });
    } catch (error) {
      console.error('Error finding chats by profile ID:', error);
      throw new Error('Failed to find chats');
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

  async updateMessageReadInfo(chatId: string, profileId: string, dateInfoUserViewedRecently: Date): Promise<Chat> {
    try {
      // First, check if MessageReadInfo already exists for this user in this chat
      const existingReadInfo = await this.prisma.messageReadInfo.findFirst({
        where: {
          chatId: chatId,
          profileId: profileId
        }
      });

      if (existingReadInfo) {
        // Update existing MessageReadInfo
        await this.prisma.messageReadInfo.update({
          where: {
            id: existingReadInfo.id
          },
          data: {
            dateInfoUserViewedRecently: dateInfoUserViewedRecently
          }
        });
      } else {
        // Create new MessageReadInfo
        await this.prisma.messageReadInfo.create({
          data: {
            chatId: chatId,
            profileId: profileId,
            dateInfoUserViewedRecently: dateInfoUserViewedRecently
          }
        });
      }

      // Return updated chat with all data
      const updatedChat = await this.prisma.chat.findUnique({
        where: { id: chatId },
        include: {
          messages: {
            orderBy: {
              createdAt: 'desc'
            }
          },
          messageReadInfos: true
        }
      });

      if (!updatedChat) {
        throw new Error('Chat not found after update');
      }

      const messages = updatedChat.messages.map(message => 
        new Message(
          message.id,
          message.writerProfileId,
          message.text,
          message.createdAt,
          message.updatedAt
        )
      );

      const messageReadInfos = updatedChat.messageReadInfos.map(info =>
        new MessageReadInfo(
          info.id,
          info.profileId,
          info.dateInfoUserViewedRecently
        )
      );

      return new Chat(
        updatedChat.id,
        updatedChat.participantsIds,
        messages,
        messageReadInfos,
        updatedChat.createdAt,
        updatedChat.updatedAt
      );
    } catch (error) {
      console.error('Error updating message read info:', error);
      throw new Error('Failed to update message read info');
    }
  }
}