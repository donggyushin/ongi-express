import { IProfileRepository, IImageRepository } from '../repositories';
import { Profile, Image } from '../entities';
import { validateKoreanNickname } from '@/shared/utils';

export interface IProfileUseCase {
  updateProfileImage(accountId: string, imageFile: Buffer, fileName: string): Promise<Profile>;
  updateNickname(accountId: string, nickname: string): Promise<Profile>;
  getProfile(accountId: string): Promise<Profile | null>;
  addImage(accountId: string, imageFile: Buffer, fileName: string): Promise<Profile>;
  removeImage(accountId: string, publicId: string): Promise<Profile>;
}

export class ProfileUseCase implements IProfileUseCase {
  constructor(
    private profileRepository: IProfileRepository,
    private imageRepository: IImageRepository
  ) {}

  async updateProfileImage(accountId: string, imageFile: Buffer, fileName: string): Promise<Profile> {
    // Upload image to Cloudinary
    const imageData = await this.imageRepository.uploadImageWithData(imageFile, fileName, 'profile-images');
    const newImage = new Image(imageData.url, imageData.publicId);
    
    // Update profile with new image
    const updatedProfile = await this.profileRepository.updateProfileImage(accountId, newImage);
    
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

  async addImage(accountId: string, imageFile: Buffer, fileName: string): Promise<Profile> {
    // Check if profile exists
    const existingProfile = await this.profileRepository.findByAccountId(accountId);
    if (!existingProfile) {
      throw new Error('Profile not found');
    }

    // Check image count limit (max 6)
    if (existingProfile.images.length >= 6) {
      throw new Error('Maximum image limit (6) reached');
    }

    // Upload image to Cloudinary
    const imageData = await this.imageRepository.uploadImageWithData(imageFile, fileName, 'profile-images');
    const newImage = new Image(imageData.url, imageData.publicId);
    
    // Add image to profile
    const updatedProfile = await this.profileRepository.addImage(accountId, newImage);
    
    return updatedProfile;
  }

  async removeImage(accountId: string, publicId: string): Promise<Profile> {
    // Check if profile exists
    const existingProfile = await this.profileRepository.findByAccountId(accountId);
    if (!existingProfile) {
      throw new Error('Profile not found');
    }

    // Check if image exists in profile
    const imageExists = existingProfile.images.some(img => img.publicId === publicId);
    if (!imageExists) {
      throw new Error('Image not found in profile');
    }

    // Delete image from Cloudinary
    await this.imageRepository.deleteImage(publicId);
    
    // Remove image from profile
    const updatedProfile = await this.profileRepository.removeImage(accountId, publicId);
    
    return updatedProfile;
  }
}