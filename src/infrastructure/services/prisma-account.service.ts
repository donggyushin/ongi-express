import { Account, AccountType } from '@/domain/entities';
import { IAccountRepository } from '@/domain/repositories';
import { PrismaClient } from '@/generated/prisma';

export class PrismaAccountService implements IAccountRepository {
  constructor(private prisma: PrismaClient) {}

  async create(id: string, type: AccountType): Promise<Account> {
    try {
      const accountData = await this.prisma.account.create({
        data: {
          id,
          type: type as any, // Prisma enum conversion
        },
      });
      
      return new Account(accountData.id, accountData.type as AccountType, accountData.createdAt);
    } catch (error) {
      console.error('Error creating account:', error);
      throw new Error('Failed to create account');
    }
  }

  async findById(id: string): Promise<Account | null> {
    try {
      const accountData = await this.prisma.account.findUnique({
        where: { id },
      });
      
      if (!accountData) {
        return null;
      }
      
      return new Account(accountData.id, accountData.type as AccountType, accountData.createdAt);
    } catch (error) {
      console.error('Error finding account by id:', error);
      throw new Error('Failed to find account');
    }
  }
}