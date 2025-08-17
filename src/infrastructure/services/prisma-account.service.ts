import { Account, AccountType, Profile, QnA, Image } from '@/domain/entities';
import { IAccountRepository } from '@/domain/repositories';
import { PrismaClient } from '../../generated/prisma';
import { generateFriendlyNickname } from '@/shared/utils';

export class PrismaAccountService implements IAccountRepository {
  constructor(private prisma: PrismaClient) {}

  async create(id: string, type: AccountType): Promise<Account> {
    try {
      // Create account and profile in a transaction
      const result = await this.prisma.$transaction(async (tx) => {
        const account = await tx.account.create({
          data: {
            id,
            type: type as any, // Prisma enum conversion
          },
        });

        const profile = await tx.profile.create({
          data: {
            accountId: id,
            nickname: generateFriendlyNickname(),
          },
          include: {
            qnas: true,
            profileImage: true,
            images: true
          }
        });

        return { account, profile };
      });
      
      const profile = new Profile(
        result.profile.id,
        result.profile.accountId,
        result.profile.nickname,
        result.profile.email,
        result.profile.introduction,
        result.profile.profileImage ? new Image(
          result.profile.profileImage.url,
          result.profile.profileImage.publicId
        ) : null,
        result.profile.images.map((img) => new Image(img.url, img.publicId)),
        result.profile.mbti as any,
        result.profile.gender as any,
        result.profile.height,
        result.profile.weight,
        result.profile.qnas.map(qna => new QnA(
          qna.id,
          qna.question,
          qna.answer,
          qna.createdAt,
          qna.updatedAt
        )),
        result.profile.createdAt,
        result.profile.updatedAt
      );
      
      return new Account(result.account.id, result.account.type as AccountType, profile, result.account.createdAt);
    } catch (error) {
      console.error('Error creating account:', error);
      throw new Error('Failed to create account');
    }
  }

  async findById(id: string): Promise<Account | null> {
    try {
      const account = await this.prisma.account.findUnique({
        where: { id },
      });
      
      if (!account) {
        return null;
      }

      const profile = await this.prisma.profile.findUnique({
        where: { accountId: id },
        include: {
          qnas: true,
          profileImage: true,
          images: true
        }
      });
      
      if (!profile) {
        return null;
      }
      
      const profileEntity = new Profile(
        profile.id,
        profile.accountId,
        profile.nickname,
        profile.email,
        profile.introduction,
        profile.profileImage ? new Image(
          profile.profileImage.url,
          profile.profileImage.publicId
        ) : null,
        profile.images.map((img) => new Image(img.url, img.publicId)),
        profile.mbti as any,
        profile.gender as any,
        profile.height,
        profile.weight,
        profile.qnas.map(qna => new QnA(
          qna.id,
          qna.question,
          qna.answer,
          qna.createdAt,
          qna.updatedAt
        )),
        profile.createdAt,
        profile.updatedAt
      );
      
      return new Account(account.id, account.type as AccountType, profileEntity, account.createdAt);
    } catch (error) {
      console.error('Error finding account by id:', error);
      throw new Error('Failed to find account');
    }
  }

  async deleteById(id: string): Promise<boolean> {
    try {
      await this.prisma.$transaction(async (tx) => {
        const account = await tx.account.findUnique({
          where: { id },
        });

        if (!account) {
          throw new Error('Account not found');
        }

        const profile = await tx.profile.findUnique({
          where: { accountId: id },
        });

        if (profile) {
          await tx.qnA.deleteMany({
            where: { profileId: profile.id },
          });

          await tx.image.deleteMany({
            where: { profileId: profile.id },
          });

          await tx.profile.delete({
            where: { id: profile.id },
          });
        }

        await tx.account.delete({
          where: { id },
        });
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting account:', error);
      return false;
    }
  }
}