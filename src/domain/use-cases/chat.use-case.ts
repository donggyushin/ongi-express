import { Chat, Profile, Message } from '@/domain/entities';
import { IChatRepository, IProfileRepository, IMessageRepository } from '@/domain/repositories';

export interface ICreateOrFindChatUseCase {
  execute(
    currentProfileId: string, 
    targetProfileId: string,
    options?: {
      limit?: number;
      cursor?: string;
    }
  ): Promise<{
    chat: Chat;
    participants: Profile[];
  }>;
}

export interface IGetUserChatsUseCase {
  execute(profileId: string): Promise<{
    chats: Chat[];
    participants: { [chatId: string]: Profile[] };
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
    targetProfileId: string,
    options?: {
      limit?: number;
      cursor?: string;
    }
  ): Promise<{
    chat: Chat;
    participants: Profile[];
  }> {
    const participantsIds = [currentProfileId, targetProfileId];
    
    // Try to find existing chat first
    let chat = await this.chatRepository.findByParticipantsIds(participantsIds, options);
    
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
    participants: { [chatId: string]: Profile[] };
  }> {
    // Get all chats for the user
    const chats = await this.chatRepository.findByProfileId(profileId);
    
    // Collect all unique participant IDs
    const allParticipantIds = new Set<string>();
    chats.forEach(chat => {
      chat.participantsIds.forEach(id => allParticipantIds.add(id));
    });

    // Get all profiles in one query
    const allProfiles = await this.profileRepository.findByIds(Array.from(allParticipantIds));

    // Create profile lookup map
    const profileMap = new Map<string, Profile>();
    allProfiles.forEach(profile => {
      profileMap.set(profile.id, profile);
    });

    // Map participants to chats
    const participants: { [chatId: string]: Profile[] } = {};
    chats.forEach(chat => {
      const chatParticipants: Profile[] = [];
      chat.participantsIds.forEach(participantId => {
        const profile = profileMap.get(participantId);
        if (profile) {
          chatParticipants.push(profile);
        }
      });
      participants[chat.id] = chatParticipants;
    });

    return {
      chats,
      participants
    };
  }
}

export class AddMessageUseCase implements IAddMessageUseCase {
  constructor(
    private messageRepository: IMessageRepository,
    private chatRepository: IChatRepository
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

    // Create the message
    const message = await this.messageRepository.create(chatId, writerProfileId, text.trim());

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