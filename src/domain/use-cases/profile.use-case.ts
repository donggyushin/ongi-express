import { IProfileRepository, IImageRepository } from '../repositories';
import { Profile, Image } from '../entities';
import { validateKoreanNickname } from '@/shared/utils';

export interface IProfileUseCase {
  updateProfileImage(accountId: string, imageFile: Buffer, fileName: string): Promise<Profile>;
  updateNickname(accountId: string, nickname: string): Promise<Profile>;
  updateMbti(accountId: string, mbti: string): Promise<Profile>;
  updateGender(accountId: string, gender: string): Promise<Profile>;
  updatePhysicalInfo(accountId: string, height?: number, weight?: number): Promise<Profile>;
  getProfile(accountId: string): Promise<Profile | null>;
  addImage(accountId: string, imageFile: Buffer, fileName: string): Promise<Profile>;
  removeImage(accountId: string, publicId: string): Promise<Profile>;
  addQna(accountId: string, question: string, answer: string): Promise<Profile>;
  removeQna(accountId: string, qnaId: string): Promise<Profile>;
  updateQna(accountId: string, qnaId: string, answer: string): Promise<Profile>;
}

export class ProfileUseCase implements IProfileUseCase {
  constructor(
    private profileRepository: IProfileRepository,
    private imageRepository: IImageRepository
  ) {}

  async updateProfileImage(accountId: string, imageFile: Buffer, fileName: string): Promise<Profile> {
    // Check if profile exists and get current profile image
    const existingProfile = await this.profileRepository.findByAccountId(accountId);
    if (!existingProfile) {
      throw new Error('Profile not found');
    }

    // Delete existing profile image from Cloudinary if it exists
    if (existingProfile.profileImage && existingProfile.profileImage.publicId) {
      await this.imageRepository.deleteImage(existingProfile.profileImage.publicId);
    }
    
    // Upload new image to Cloudinary
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

  async updateMbti(accountId: string, mbti: string): Promise<Profile> {
    // Validate MBTI type
    const validMbtiTypes = [
      'INTJ', 'INTP', 'ENTJ', 'ENTP',
      'INFJ', 'INFP', 'ENFJ', 'ENFP', 
      'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
      'ISTP', 'ISFP', 'ESTP', 'ESFP'
    ];
    
    if (!validMbtiTypes.includes(mbti.toUpperCase())) {
      throw new Error('Invalid MBTI type. Must be one of: ' + validMbtiTypes.join(', '));
    }

    // Check if profile exists
    const existingProfile = await this.profileRepository.findByAccountId(accountId);
    if (!existingProfile) {
      throw new Error('Profile not found');
    }

    // Update MBTI
    const updatedProfile = await this.profileRepository.updateMbti(accountId, mbti.toUpperCase());
    
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

  async addQna(accountId: string, question: string, answer: string): Promise<Profile> {
    // Validate input
    if (!question || question.trim().length === 0) {
      throw new Error('Question is required');
    }
    if (!answer || answer.trim().length === 0) {
      throw new Error('Answer is required');
    }

    // Validate length limits (based on schema constraints)
    if (question.length > 500) {
      throw new Error('Question must be 500 characters or less');
    }
    if (answer.length > 1500) {
      throw new Error('Answer must be 1500 characters or less');
    }

    // Check if profile exists and get current Q&A count
    const existingProfile = await this.profileRepository.findByAccountId(accountId);
    if (!existingProfile) {
      throw new Error('Profile not found');
    }

    // Check Q&A count limit (max 6)
    if (existingProfile.qnas.length >= 6) {
      throw new Error('Maximum Q&A limit (6) reached');
    }

    // Add Q&A to profile
    const updatedProfile = await this.profileRepository.addQna(accountId, question.trim(), answer.trim());
    
    return updatedProfile;
  }

  async removeQna(accountId: string, qnaId: string): Promise<Profile> {
    // Validate input
    if (!qnaId || qnaId.trim().length === 0) {
      throw new Error('Q&A ID is required');
    }

    // Check if profile exists
    const existingProfile = await this.profileRepository.findByAccountId(accountId);
    if (!existingProfile) {
      throw new Error('Profile not found');
    }

    // Check if Q&A exists in profile and belongs to this user
    const qnaExists = existingProfile.qnas.some(qna => qna.id === qnaId);
    if (!qnaExists) {
      throw new Error('Q&A not found in profile');
    }

    // Remove Q&A from profile
    const updatedProfile = await this.profileRepository.removeQna(accountId, qnaId);
    
    return updatedProfile;
  }

  async updateQna(accountId: string, qnaId: string, answer: string): Promise<Profile> {
    // Validate input
    if (!qnaId || qnaId.trim().length === 0) {
      throw new Error('Q&A ID is required');
    }
    if (!answer || answer.trim().length === 0) {
      throw new Error('Answer is required');
    }

    // Validate answer length (based on schema constraints)
    if (answer.length > 1500) {
      throw new Error('Answer must be 1500 characters or less');
    }

    // Check if profile exists
    const existingProfile = await this.profileRepository.findByAccountId(accountId);
    if (!existingProfile) {
      throw new Error('Profile not found');
    }

    // Check if Q&A exists in profile and belongs to this user
    const qnaExists = existingProfile.qnas.some(qna => qna.id === qnaId);
    if (!qnaExists) {
      throw new Error('Q&A not found in profile');
    }

    // Update Q&A answer
    const updatedProfile = await this.profileRepository.updateQna(accountId, qnaId, answer.trim());
    
    return updatedProfile;
  }

  async updateGender(accountId: string, gender: string): Promise<Profile> {
    // Validate gender type
    const validGenderTypes = ['MALE', 'FEMALE'];
    
    if (!validGenderTypes.includes(gender.toUpperCase())) {
      throw new Error('Invalid gender type. Must be one of: ' + validGenderTypes.join(', '));
    }

    // Check if profile exists
    const existingProfile = await this.profileRepository.findByAccountId(accountId);
    if (!existingProfile) {
      throw new Error('Profile not found');
    }

    // Update gender
    const updatedProfile = await this.profileRepository.updateGender(accountId, gender.toUpperCase());
    
    return updatedProfile;
  }

  async updatePhysicalInfo(accountId: string, height?: number, weight?: number): Promise<Profile> {
    // Validate inputs if provided
    if (height !== undefined) {
      if (height < 50 || height > 300) {
        throw new Error('Height must be between 50cm and 300cm');
      }
    }

    if (weight !== undefined) {
      if (weight < 10 || weight > 500) {
        throw new Error('Weight must be between 10kg and 500kg');
      }
    }

    // At least one field must be provided
    if (height === undefined && weight === undefined) {
      throw new Error('At least one of height or weight must be provided');
    }

    // Check if profile exists
    const existingProfile = await this.profileRepository.findByAccountId(accountId);
    if (!existingProfile) {
      throw new Error('Profile not found');
    }

    // Update physical info
    const updatedProfile = await this.profileRepository.updatePhysicalInfo(accountId, height, weight);
    
    return updatedProfile;
  }
}