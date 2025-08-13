import { Account, AccountType, Profile, QnA } from '@/domain/entities';
import { IAccountRepository } from '@/domain/repositories';
import { PrismaClient } from '@/generated/prisma';

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
          },
          include: {
            qnas: true
          }
        });

        return { account, profile };
      });
      
      const profile = new Profile(
        result.profile.id,
        result.profile.accountId,
        result.profile.nickname,
        result.profile.profileImage,
        result.profile.images,
        result.profile.mbti as any,
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
          qnas: true
        }
      });
      
      if (!profile) {
        return null;
      }
      
      const profileEntity = new Profile(
        profile.id,
        profile.accountId,
        profile.nickname,
        profile.profileImage,
        profile.images,
        profile.mbti as any,
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
}