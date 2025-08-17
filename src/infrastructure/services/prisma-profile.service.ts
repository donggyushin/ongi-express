import { PrismaClient } from '../../generated/prisma';
import { IProfileRepository } from '@/domain/repositories';
import { Profile, Image, QnA } from '@/domain/entities';

export class PrismaProfileService implements IProfileRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Profile | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { id },
      include: {
        qnas: true,
        profileImage: true,
        images: true
      }
    });

    return profile ? this.mapToProfileEntity(profile) : null;
  }

  async findByAccountId(accountId: string): Promise<Profile | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { accountId },
      include: {
        qnas: true,
        profileImage: true,
        images: true
      }
    });

    return profile ? this.mapToProfileEntity(profile) : null;
  }

  async updateProfileImage(accountId: string, image: Image): Promise<Profile> {
    const updatedProfile = await this.prisma.profile.update({
      where: { accountId },
      data: {
        profileImage: {
          create: {
            url: image.url,
            publicId: image.publicId
          }
        }
      },
      include: {
        qnas: true,
        profileImage: true,
        images: true
      }
    });

    return this.mapToProfileEntity(updatedProfile);
  }

  async updateNickname(accountId: string, nickname: string): Promise<Profile> {
    const updatedProfile = await this.prisma.profile.update({
      where: { accountId },
      data: { nickname },
      include: {
        qnas: true,
        profileImage: true,
        images: true
      }
    });

    return this.mapToProfileEntity(updatedProfile);
  }

  async updateMbti(accountId: string, mbti: string): Promise<Profile> {
    const updatedProfile = await this.prisma.profile.update({
      where: { accountId },
      data: { mbti: mbti as any },
      include: {
        qnas: true,
        profileImage: true,
        images: true
      }
    });

    return this.mapToProfileEntity(updatedProfile);
  }

  async addImage(accountId: string, image: Image): Promise<Profile> {
    const updatedProfile = await this.prisma.profile.update({
      where: { accountId },
      data: {
        images: {
          create: {
            url: image.url,
            publicId: image.publicId
          }
        }
      },
      include: {
        qnas: true,
        profileImage: true,
        images: true
      }
    });

    return this.mapToProfileEntity(updatedProfile);
  }

  async removeImage(accountId: string, publicId: string): Promise<Profile> {
    // First, get the profile to find its ID
    const profile = await this.prisma.profile.findUnique({
      where: { accountId },
      select: { id: true }
    });

    if (!profile) {
      throw new Error('Profile not found');
    }

    // Delete the image record using profile.id
    await this.prisma.image.deleteMany({
      where: {
        publicId: publicId,
        profileId: profile.id
      }
    });

    // Then get the updated profile
    const updatedProfile = await this.prisma.profile.findUnique({
      where: { accountId },
      include: {
        qnas: true,
        profileImage: true,
        images: true
      }
    });

    if (!updatedProfile) {
      throw new Error('Profile not found');
    }

    return this.mapToProfileEntity(updatedProfile);
  }

  async addQna(accountId: string, question: string, answer: string): Promise<Profile> {
    // First, get the profile to find its ID
    const profile = await this.prisma.profile.findUnique({
      where: { accountId },
      select: { id: true }
    });

    if (!profile) {
      throw new Error('Profile not found');
    }

    // Create new QnA record
    await this.prisma.qnA.create({
      data: {
        profileId: profile.id,
        question: question,
        answer: answer
      }
    });

    // Get the updated profile with all relations
    const updatedProfile = await this.prisma.profile.findUnique({
      where: { accountId },
      include: {
        qnas: true,
        profileImage: true,
        images: true
      }
    });

    if (!updatedProfile) {
      throw new Error('Profile not found');
    }

    return this.mapToProfileEntity(updatedProfile);
  }

  async removeQna(accountId: string, qnaId: string): Promise<Profile> {
    // First, get the profile to verify ownership
    const profile = await this.prisma.profile.findUnique({
      where: { accountId },
      select: { id: true }
    });

    if (!profile) {
      throw new Error('Profile not found');
    }

    // Delete the Q&A record (only if it belongs to this profile)
    await this.prisma.qnA.deleteMany({
      where: {
        id: qnaId,
        profileId: profile.id
      }
    });

    // Get the updated profile with all relations
    const updatedProfile = await this.prisma.profile.findUnique({
      where: { accountId },
      include: {
        qnas: true,
        profileImage: true,
        images: true
      }
    });

    if (!updatedProfile) {
      throw new Error('Profile not found');
    }

    return this.mapToProfileEntity(updatedProfile);
  }

  async updateQna(accountId: string, qnaId: string, answer: string): Promise<Profile> {
    // First, get the profile to verify ownership
    const profile = await this.prisma.profile.findUnique({
      where: { accountId },
      select: { id: true }
    });

    if (!profile) {
      throw new Error('Profile not found');
    }

    // Update the Q&A record (only if it belongs to this profile)
    await this.prisma.qnA.updateMany({
      where: {
        id: qnaId,
        profileId: profile.id
      },
      data: {
        answer: answer
      }
    });

    // Get the updated profile with all relations
    const updatedProfile = await this.prisma.profile.findUnique({
      where: { accountId },
      include: {
        qnas: true,
        profileImage: true,
        images: true
      }
    });

    if (!updatedProfile) {
      throw new Error('Profile not found');
    }

    return this.mapToProfileEntity(updatedProfile);
  }

  async updateGender(accountId: string, gender: string): Promise<Profile> {
    const updatedProfile = await this.prisma.profile.update({
      where: { accountId },
      data: { gender: gender as any },
      include: {
        qnas: true,
        profileImage: true,
        images: true
      }
    });

    return this.mapToProfileEntity(updatedProfile);
  }

  async updatePhysicalInfo(accountId: string, height?: number, weight?: number): Promise<Profile> {
    const updateData: any = {};
    
    if (height !== undefined) {
      updateData.height = height;
    }
    
    if (weight !== undefined) {
      updateData.weight = weight;
    }

    const updatedProfile = await this.prisma.profile.update({
      where: { accountId },
      data: updateData,
      include: {
        qnas: true,
        profileImage: true,
        images: true
      }
    });

    return this.mapToProfileEntity(updatedProfile);
  }

  async updateIntroduction(accountId: string, introduction: string): Promise<Profile> {
    const updatedProfile = await this.prisma.profile.update({
      where: { accountId },
      data: { introduction },
      include: {
        qnas: true,
        profileImage: true,
        images: true
      }
    });

    return this.mapToProfileEntity(updatedProfile);
  }

  async updateLastTokenAuth(accountId: string): Promise<void> {
    await this.prisma.profile.update({
      where: { accountId },
      data: { lastTokenAuthAt: new Date() }
    });
  }

  async findRandomProfileByGender(excludeGender: string, excludeProfileIds: string[]): Promise<Profile | null> {
    const profiles = await this.prisma.profile.findMany({
      where: {
        AND: [
          { gender: { not: excludeGender as any } },
          { id: { notIn: excludeProfileIds } },
          { gender: { not: null } }
        ]
      },
      include: {
        qnas: true,
        profileImage: true,
        images: true
      },
      take: 10
    });

    if (profiles.length === 0) {
      return null;
    }

    // 랜덤하게 선택
    const randomIndex = Math.floor(Math.random() * profiles.length);
    return this.mapToProfileEntity(profiles[randomIndex]);
  }

  async update(id: string, data: any): Promise<Profile> {
    const updatedProfile = await this.prisma.profile.update({
      where: { id },
      data,
      include: {
        qnas: true,
        profileImage: true,
        images: true
      }
    });

    return this.mapToProfileEntity(updatedProfile);
  }

  private mapToProfileEntity(profile: any): Profile {
    return new Profile(
      profile.id,
      profile.accountId,
      profile.nickname,
      profile.email,
      profile.introduction,
      profile.profileImage ? new Image(profile.profileImage.url, profile.profileImage.publicId) : null,
      profile.images.map((img: any) => new Image(img.url, img.publicId)),
      profile.mbti as any,
      profile.gender as any,
      profile.height,
      profile.weight,
      profile.lastTokenAuthAt,
      profile.qnas.map((qna: any) => new QnA(
        qna.id,
        qna.question,
        qna.answer,
        qna.createdAt,
        qna.updatedAt
      )),
      profile.createdAt,
      profile.updatedAt
    );
  }
}