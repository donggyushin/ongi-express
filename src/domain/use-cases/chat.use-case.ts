import { Chat, Profile } from '@/domain/entities';
import { IChatRepository, IProfileRepository } from '@/domain/repositories';

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