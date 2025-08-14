import { Profile, Image, QnA } from '../entities';

export interface IProfileRepository {
  findById(id: string): Promise<Profile | null>;
  findByAccountId(accountId: string): Promise<Profile | null>;
  updateProfileImage(accountId: string, image: Image): Promise<Profile>;
  updateNickname(accountId: string, nickname: string): Promise<Profile>;
  updateMbti(accountId: string, mbti: string): Promise<Profile>;
  addImage(accountId: string, image: Image): Promise<Profile>;
  removeImage(accountId: string, publicId: string): Promise<Profile>;
  addQna(accountId: string, question: string, answer: string): Promise<Profile>;
  removeQna(accountId: string, qnaId: string): Promise<Profile>;
  update(id: string, data: Partial<Profile>): Promise<Profile>;
}