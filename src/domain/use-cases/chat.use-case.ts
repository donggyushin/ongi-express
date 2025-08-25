import { Chat, Profile, Message } from '@/domain/entities';
import { IChatRepository, IProfileRepository, IMessageRepository } from '@/domain/repositories';
import { IFirebaseService } from '@/domain/services/IFirebaseService';

export interface ICreateOrFindChatUseCase {
  execute(
    currentProfileId: string, 
    targetProfileId: string
  ): Promise<{
    chat: Chat;
    participants: Profile[];
  }>;
}

export interface IGetUserChatsUseCase {
  execute(profileId: string): Promise<{
    chats: Chat[];
  }>;
}

export interface IGetChatByIdUseCase {
  execute(
    chatId: string, 
    currentProfileId: string,
    options?: {
      limit?: number;
      cursor?: string;
    }
  ): Promise<{
    chat: Chat;
    pagination: {
      limit: number;
      hasMore: boolean;
      nextCursor?: string;
    };
  }>;
}

export interface IAddMessageUseCase {
  execute(chatId: string, writerProfileId: string, text: string): Promise<Message>;
}

export interface IUpdateMessageReadInfoUseCase {
  execute(chatId: string, profileId: string, dateInfoUserViewedRecently: Date): Promise<Chat>;
}

export class CreateOrFindChatUseCase implements ICreateOrFindChatUseCase {
  constructor(
    private chatRepository: IChatRepository,
    private profileRepository: IProfileRepository
  ) {}

  async execute(
    currentProfileId: string, 
    targetProfileId: string
  ): Promise<{
    chat: Chat;
    participants: Profile[];
  }> {
    const participantsIds = [currentProfileId, targetProfileId];
    
    // Try to find existing chat first
    let chat = await this.chatRepository.findByParticipantsIds(participantsIds);
    
    // If no existing chat, create a new one
    if (!chat) {
      chat = await this.chatRepository.create(participantsIds);
    }

    // Get participant profiles (only return existing profiles, don't error on missing ones)
    const participants: Profile[] = [];
    
    for (const profileId of participantsIds) {
      try {
        const profile = await this.profileRepository.findById(profileId);
        if (profile) {
          participants.push(profile);
        }
      } catch (error) {
        // Silently continue if profile doesn't exist
        console.warn(`Profile not found: ${profileId}`);
      }
    }

    return {
      chat,
      participants
    };
  }
}

export class GetUserChatsUseCase implements IGetUserChatsUseCase {
  constructor(
    private chatRepository: IChatRepository,
    private profileRepository: IProfileRepository
  ) {}

  async execute(profileId: string): Promise<{
    chats: Chat[];
  }> {
    // Get all chats for the user (participants are now included in each chat)
    const chats = await this.chatRepository.findByProfileId(profileId);
    
    return {
      chats
    };
  }
}

export class AddMessageUseCase implements IAddMessageUseCase {
  constructor(
    private messageRepository: IMessageRepository,
    private chatRepository: IChatRepository,
    private profileRepository: IProfileRepository,
    private firebaseService: IFirebaseService
  ) {}

  async execute(chatId: string, writerProfileId: string, text: string): Promise<Message> {
    // Validate text input
    if (!text || text.trim().length === 0) {
      throw new Error('Message text cannot be empty');
    }

    if (text.length > 1000) {
      throw new Error('Message text is too long (max 1000 characters)');
    }

    // Verify that the chat exists
    const chat = await this.chatRepository.findByParticipantsIds([writerProfileId]);
    const userChat = chat ? [chat] : await this.chatRepository.findByProfileId(writerProfileId);
    
    const targetChat = userChat.find(c => c.id === chatId);
    if (!targetChat) {
      throw new Error('Chat not found or user not authorized to send messages to this chat');
    }

    // Check if user is a participant of the chat
    if (!targetChat.participantsIds.includes(writerProfileId)) {
      throw new Error('User is not a participant of this chat');
    }

    // Get writer profile for notification
    const writerProfile = await this.profileRepository.findById(writerProfileId);
    if (!writerProfile) {
      throw new Error('Writer profile not found');
    }

    // Create the message
    const message = await this.messageRepository.create(chatId, writerProfileId, text.trim());

    // Send push notifications to other participants
    const otherParticipantIds = targetChat.participantsIds.filter(id => id !== writerProfileId);
    
    if (otherParticipantIds.length > 0) {
      try {
        // Get profiles of other participants
        const otherParticipants = await Promise.all(
          otherParticipantIds.map(id => this.profileRepository.findById(id))
        );

        // Filter out profiles that don't exist and get FCM tokens
        const fcmTokens = otherParticipants
          .filter(profile => profile && profile.fcmToken)
          .map(profile => profile!.fcmToken!);

        // Send push notification if there are valid FCM tokens
        if (fcmTokens.length > 0) {
          await this.firebaseService.sendToMultipleDevices(
            fcmTokens,
            `${writerProfile.nickname}님이 메시지를 보냈습니다`,
            text.length > 100 ? text.substring(0, 100) + '...' : text,
            {
              type: 'message',
              chatId: chatId,
              url_scheme: `ongi://chats/${chatId}`
            }
          );
        }
      } catch (error) {
        // Push notification 실패는 메시지 전송 자체를 실패시키지 않음
        console.error('Failed to send push notification for message:', error);
      }
    }

    return message;
  }
}

export class UpdateMessageReadInfoUseCase implements IUpdateMessageReadInfoUseCase {
  constructor(
    private chatRepository: IChatRepository
  ) {}

  async execute(chatId: string, profileId: string, dateInfoUserViewedRecently: Date): Promise<Chat> {
    // Get user's chats to verify access
    const userChats = await this.chatRepository.findByProfileId(profileId);
    const targetChat = userChats.find(chat => chat.id === chatId);

    if (!targetChat) {
      throw new Error('Chat not found or user not authorized to access this chat');
    }

    // Update message read info
    return await this.chatRepository.updateMessageReadInfo(chatId, profileId, dateInfoUserViewedRecently);
  }
}

export class GetChatByIdUseCase implements IGetChatByIdUseCase {
  constructor(
    private chatRepository: IChatRepository
  ) {}

  async execute(
    chatId: string, 
    currentProfileId: string,
    options?: {
      limit?: number;
      cursor?: string;
    }
  ): Promise<{
    chat: Chat;
    pagination: {
      limit: number;
      hasMore: boolean;
      nextCursor?: string;
    };
  }> {
    const limit = options?.limit ? Math.min(Math.max(options.limit, 1), 50) : 20; // Between 1 and 50
    
    const chat = await this.chatRepository.findById(chatId, {
      limit,
      cursor: options?.cursor
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    // Verify that the current user is a participant
    if (!chat.participantsIds.includes(currentProfileId)) {
      throw new Error('Not authorized to access this chat');
    }

    return {
      chat,
      pagination: {
        limit,
        hasMore: chat.messages.length === limit,
        nextCursor: chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].id : undefined
      }
    };
  }
}