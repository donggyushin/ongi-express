import { IProfileRepository, IImageRepository } from '../repositories';
import { Profile } from '../entities';

export interface IProfileUseCase {
  updateProfileImage(accountId: string, imageFile: Buffer, fileName: string): Promise<Profile>;
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

  async getProfile(accountId: string): Promise<Profile | null> {
    return await this.profileRepository.findByAccountId(accountId);
  }
}