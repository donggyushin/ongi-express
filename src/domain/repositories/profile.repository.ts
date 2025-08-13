import { Profile } from '../entities';

export interface IProfileRepository {
  findById(id: string): Promise<Profile | null>;
  findByAccountId(accountId: string): Promise<Profile | null>;
  updateProfileImage(accountId: string, imageUrl: string): Promise<Profile>;
  updateNickname(accountId: string, nickname: string): Promise<Profile>;
  update(id: string, data: Partial<Profile>): Promise<Profile>;
}