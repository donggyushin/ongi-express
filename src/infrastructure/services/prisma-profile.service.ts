import { PrismaClient } from '@prisma/client';
import { IProfileRepository } from '@/domain/repositories';
import { Profile } from '@/domain/entities';

export class PrismaProfileService implements IProfileRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Profile | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { id },
      include: {
        qnas: true
      }
    });

    return profile as Profile | null;
  }

  async findByAccountId(accountId: string): Promise<Profile | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { accountId },
      include: {
        qnas: true
      }
    });

    return profile as Profile | null;
  }

  async updateProfileImage(accountId: string, imageUrl: string): Promise<Profile> {
    const updatedProfile = await this.prisma.profile.update({
      where: { accountId },
      data: { profileImage: imageUrl },
      include: {
        qnas: true
      }
    });

    return updatedProfile as Profile;
  }

  async update(id: string, data: Partial<Profile>): Promise<Profile> {
    const updatedProfile = await this.prisma.profile.update({
      where: { id },
      data,
      include: {
        qnas: true
      }
    });

    return updatedProfile as Profile;
  }
}