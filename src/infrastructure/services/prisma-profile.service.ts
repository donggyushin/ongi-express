import { PrismaClient } from '@/generated/prisma';
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
      profile.profileImage ? new Image(profile.profileImage.url, profile.profileImage.publicId) : null,
      profile.images.map((img: any) => new Image(img.url, img.publicId)),
      profile.mbti as any,
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