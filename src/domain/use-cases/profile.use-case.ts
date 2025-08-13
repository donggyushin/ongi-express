import { IProfileRepository, IImageRepository } from '../repositories';
import { Profile } from '../entities';
import { validateKoreanNickname } from '@/shared/utils';

export interface IProfileUseCase {
  updateProfileImage(accountId: string, imageFile: Buffer, fileName: string): Promise<Profile>;
  updateNickname(accountId: string, nickname: string): Promise<Profile>;
  getProfile(accountId: string): Promise<Profile | null>;
}

export class ProfileUseCase implements IProfileUseCase {
  constructor(
    private profileRepository: IProfileRepository,
    private imageRepository: IImageRepository
  ) {}

  async updateProfileImage(accountId: string, imageFile: Buffer, fileName: string): Promise<Profile> {
    // Upload image to Cloudinary
    const imageUrl = await this.imageRepository.uploadImage(imageFile, fileName, 'profile-images');
    
    // Update profile with new image URL
    const updatedProfile = await this.profileRepository.updateProfileImage(accountId, imageUrl);
    
    return updatedProfile;
  }

  async updateNickname(accountId: string, nickname: string): Promise<Profile> {
    // Validate Korean nickname
    const validation = validateKoreanNickname(nickname);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Check if profile exists
    const existingProfile = await this.profileRepository.findByAccountId(accountId);
    if (!existingProfile) {
      throw new Error('Profile not found');
    }

    // Update nickname
    const updatedProfile = await this.profileRepository.updateNickname(accountId, nickname);
    
    return updatedProfile;
  }

  async getProfile(accountId: string): Promise<Profile | null> {
    return await this.profileRepository.findByAccountId(accountId);
  }
}