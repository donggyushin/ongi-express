import { Profile, Image, QnA } from '../entities';

export interface IProfileRepository {
  findById(id: string): Promise<Profile | null>;
  findByAccountId(accountId: string): Promise<Profile | null>;
  updateProfileImage(accountId: string, image: Image): Promise<Profile>;
  updateNickname(accountId: string, nickname: string): Promise<Profile>;
  updateMbti(accountId: string, mbti: string): Promise<Profile>;
  updateGender(accountId: string, gender: string): Promise<Profile>;
  updatePhysicalInfo(accountId: string, height?: number, weight?: number): Promise<Profile>;
  addImage(accountId: string, image: Image): Promise<Profile>;
  removeImage(accountId: string, publicId: string): Promise<Profile>;
  addQna(accountId: string, question: string, answer: string): Promise<Profile>;
  removeQna(accountId: string, qnaId: string): Promise<Profile>;
  updateQna(accountId: string, qnaId: string, answer: string): Promise<Profile>;
  update(id: string, data: Partial<Profile>): Promise<Profile>;
}