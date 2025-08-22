import { Chat } from '@/domain/entities/chat.entity';

export interface IChatRepository {
  findByParticipantsIds(
    participantsIds: string[],
    options?: {
      limit?: number;
      cursor?: string;
    }
  ): Promise<Chat | null>;
  findByProfileId(profileId: string): Promise<Chat[]>;
  create(participantsIds: string[]): Promise<Chat>;
  updateMessageReadInfo(chatId: string, profileId: string, dateInfoUserViewedRecently: Date): Promise<Chat>;
}