import { Chat } from '@/domain/entities/chat.entity';

export interface IChatRepository {
  findByParticipantsIds(participantsIds: string[]): Promise<Chat | null>;
  create(participantsIds: string[]): Promise<Chat>;
}