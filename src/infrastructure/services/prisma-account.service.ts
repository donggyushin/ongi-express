import { Account, AccountType, Profile, QnA, Image, Location } from '@/domain/entities';
import { IAccountRepository } from '@/domain/repositories';
import { PrismaClient } from '../../generated/prisma';
import { generateFriendlyNickname, PasswordHasher } from '@/shared/utils';
import { createId } from '@paralleldrive/cuid2';

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
            qnas: {
              orderBy: {
                createdAt: 'asc'
              }
            },
            profileImage: true,
            images: true,
            location: true
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
        result.profile.location ? new Location(
          result.profile.location.id,
          result.profile.location.latitude,
          result.profile.location.longitude,
          result.profile.location.createdAt,
          result.profile.location.updatedAt
        ) : null,
        result.profile.lastTokenAuthAt,
        result.profile.fcmToken,
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

      return new Account(result.account.id, result.account.type as AccountType, profile, result.account.email, result.account.password, result.account.createdAt);
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
          qnas: {
            orderBy: {
              createdAt: 'asc'
            }
          },
          profileImage: true,
          images: true,
          location: true
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
        profile.location ? new Location(
          profile.location.id,
          profile.location.latitude,
          profile.location.longitude,
          profile.location.createdAt,
          profile.location.updatedAt
        ) : null,
        profile.lastTokenAuthAt,
        profile.fcmToken,
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

      return new Account(account.id, account.type as AccountType, profileEntity, account.email, account.password, account.createdAt);
    } catch (error) {
      console.error('Error finding account by id:', error);
      throw new Error('Failed to find account');
    }
  }

  async findByEmail(email: string): Promise<Account | null> {
    try {
      const account = await this.prisma.account.findFirst({
        where: { email },
      });

      if (!account) {
        return null;
      }

      const profile = await this.prisma.profile.findUnique({
        where: { accountId: account.id },
        include: {
          qnas: {
            orderBy: {
              createdAt: 'asc'
            }
          },
          profileImage: true,
          images: true,
          location: true
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
        profile.location ? new Location(
          profile.location.id,
          profile.location.latitude,
          profile.location.longitude,
          profile.location.createdAt,
          profile.location.updatedAt
        ) : null,
        profile.lastTokenAuthAt,
        profile.fcmToken,
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

      return new Account(account.id, account.type as AccountType, profileEntity, account.email, account.password, account.createdAt);
    } catch (error) {
      console.error('Error finding account by email:', error);
      throw new Error('Failed to find account by email');
    }
  }

  async createWithEmailPassword(email: string, password: string): Promise<Account> {
    try {
      const hashedPassword = await PasswordHasher.hash(password);
      const accountId = createId();

      // Check if account with this email already exists
      const existingAccount = await this.prisma.account.findFirst({
        where: { email },
      });

      if (existingAccount) {
        throw new Error('Account with this email already exists');
      }

      // Create account and profile in a transaction
      const result = await this.prisma.$transaction(async (tx) => {
        const account = await tx.account.create({
          data: {
            id: accountId,
            type: 'email',
            email,
            password: hashedPassword,
          },
        });

        const profile = await tx.profile.create({
          data: {
            accountId,
            nickname: generateFriendlyNickname(),
          },
          include: {
            qnas: {
              orderBy: {
                createdAt: 'asc'
              }
            },
            profileImage: true,
            images: true,
            location: true
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
        result.profile.location ? new Location(
          result.profile.location.id,
          result.profile.location.latitude,
          result.profile.location.longitude,
          result.profile.location.createdAt,
          result.profile.location.updatedAt
        ) : null,
        result.profile.lastTokenAuthAt,
        result.profile.fcmToken,
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

      return new Account(result.account.id, result.account.type as AccountType, profile, result.account.email, result.account.password, result.account.createdAt);
    } catch (error) {
      console.error('Error creating account with email/password:', error);
      throw new Error('Failed to create account with email and password');
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

          await tx.profileConnection.deleteMany({
            where: { myProfileId: profile.id },
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