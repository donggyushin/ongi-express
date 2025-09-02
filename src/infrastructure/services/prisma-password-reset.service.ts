import { PrismaClient } from '../../generated/prisma';
import { IPasswordResetRepository } from '../../domain/repositories/password-reset.repository';
import { PasswordReset } from '../../domain/entities/password-reset.entity';

export class PrismaPasswordResetService implements IPasswordResetRepository {
  constructor(private prisma: PrismaClient) {}

  async create(email: string, code: string, expiresAt: Date): Promise<PasswordReset> {
    const passwordReset = await this.prisma.passwordReset.create({
      data: {
        email,
        code,
        expiresAt,
        isUsed: false
      }
    });

    return new PasswordReset(
      passwordReset.id,
      passwordReset.email,
      passwordReset.code,
      passwordReset.expiresAt,
      passwordReset.isUsed,
      passwordReset.createdAt
    );
  }

  async findByEmail(email: string): Promise<PasswordReset | null> {
    const passwordReset = await this.prisma.passwordReset.findFirst({
      where: {
        email,
        isUsed: false
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!passwordReset) return null;

    return new PasswordReset(
      passwordReset.id,
      passwordReset.email,
      passwordReset.code,
      passwordReset.expiresAt,
      passwordReset.isUsed,
      passwordReset.createdAt
    );
  }

  async findByCode(code: string): Promise<PasswordReset | null> {
    const passwordReset = await this.prisma.passwordReset.findFirst({
      where: {
        code,
        isUsed: false
      }
    });

    if (!passwordReset) return null;

    return new PasswordReset(
      passwordReset.id,
      passwordReset.email,
      passwordReset.code,
      passwordReset.expiresAt,
      passwordReset.isUsed,
      passwordReset.createdAt
    );
  }

  async markAsUsed(id: string): Promise<void> {
    await this.prisma.passwordReset.update({
      where: { id },
      data: { isUsed: true }
    });
  }

  async deleteExpired(): Promise<void> {
    await this.prisma.passwordReset.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });
  }
}