import { PrismaClient } from '../../generated/prisma';
import { IEmailVerificationRepository } from '@/domain/repositories';
import { EmailVerification } from '@/domain/entities';

export class PrismaEmailVerificationService implements IEmailVerificationRepository {
  constructor(private prisma: PrismaClient) {}

  async create(accountId: string, email: string, code: string, expiresAt: Date): Promise<EmailVerification> {
    const verification = await this.prisma.emailVerification.create({
      data: {
        accountId,
        email,
        code,
        expiresAt
      }
    });

    return this.mapToEntity(verification);
  }

  async findByAccountIdAndCode(accountId: string, code: string): Promise<EmailVerification | null> {
    const verification = await this.prisma.emailVerification.findFirst({
      where: {
        accountId,
        code,
        isUsed: false
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return verification ? this.mapToEntity(verification) : null;
  }

  async findLatestByAccountId(accountId: string): Promise<EmailVerification | null> {
    const verification = await this.prisma.emailVerification.findFirst({
      where: {
        accountId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return verification ? this.mapToEntity(verification) : null;
  }

  async markAsUsed(id: string): Promise<EmailVerification> {
    const verification = await this.prisma.emailVerification.update({
      where: { id },
      data: { isUsed: true }
    });

    return this.mapToEntity(verification);
  }

  async deleteExpired(): Promise<void> {
    await this.prisma.emailVerification.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });
  }

  private mapToEntity(verification: any): EmailVerification {
    return new EmailVerification(
      verification.id,
      verification.accountId,
      verification.email,
      verification.code,
      verification.expiresAt,
      verification.isUsed,
      verification.createdAt
    );
  }
}