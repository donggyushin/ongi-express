import { EmailVerification } from '../entities';

export interface IEmailVerificationRepository {
  create(accountId: string, email: string, code: string, expiresAt: Date): Promise<EmailVerification>;
  findByAccountIdAndCode(accountId: string, code: string): Promise<EmailVerification | null>;
  findLatestByAccountId(accountId: string): Promise<EmailVerification | null>;
  markAsUsed(id: string): Promise<EmailVerification>;
  deleteExpired(): Promise<void>;
}