import { Account, AccountType } from '@/domain/entities';
import { IAccountRepository } from '@/domain/repositories';

export interface ICreateAccountUseCase {
  execute(id: string, type: AccountType): Promise<Account>;
}

export class CreateAccountUseCase implements ICreateAccountUseCase {
  constructor(private accountRepository: IAccountRepository) {}

  async execute(id: string, type: AccountType): Promise<Account> {
    const existingAccount = await this.accountRepository.findById(id);
    
    if (existingAccount) {
      return existingAccount;
    }

    return await this.accountRepository.create(id, type);
  }
}