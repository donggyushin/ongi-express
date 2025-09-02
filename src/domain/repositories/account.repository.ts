import { Account, AccountType } from '@/domain/entities';

export interface IAccountRepository {
  create(id: string, type: AccountType): Promise<Account>;
  createWithEmailPassword(email: string, password: string): Promise<Account>;
  findById(id: string): Promise<Account | null>;
  findByEmail(email: string): Promise<Account | null>;
  validatePassword(accountId: string, password: string): Promise<boolean>;
  updatePassword(email: string, newPassword: string): Promise<void>;
  deleteById(id: string): Promise<boolean>;
}