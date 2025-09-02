import { PasswordReset } from '../entities/password-reset.entity';

export interface IPasswordResetRepository {
  create(email: string, code: string, expiresAt: Date): Promise<PasswordReset>;
  findByEmail(email: string): Promise<PasswordReset | null>;
  findByCode(code: string): Promise<PasswordReset | null>;
  markAsUsed(id: string): Promise<void>;
  deleteExpired(): Promise<void>;
}