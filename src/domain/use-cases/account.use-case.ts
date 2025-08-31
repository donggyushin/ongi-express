import { Account, AccountType, AuthTokens } from '@/domain/entities';
import { IAccountRepository, IJwtRepository } from '@/domain/repositories';

export interface ICreateAccountUseCase {
  execute(id: string, type: AccountType): Promise<AuthTokens>;
}

export interface IGetAccountUseCase {
  execute(id: string): Promise<Account | null>;
}

export interface IGetAccountByEmailUseCase {
  execute(email: string): Promise<Account | null>;
}

export interface IDeleteAccountUseCase {
  execute(id: string): Promise<boolean>;
}

export class CreateAccountUseCase implements ICreateAccountUseCase {
  constructor(
    private accountRepository: IAccountRepository,
    private jwtRepository: IJwtRepository
  ) {}

  async execute(id: string, type: AccountType): Promise<AuthTokens> {
    // Check if account already exists
    const existingAccount = await this.accountRepository.findById(id);
    
    if (!existingAccount) {
      // Create new account if it doesn't exist
      await this.accountRepository.create(id, type);
    }

    // Generate and return tokens for the user
    return await this.jwtRepository.generateTokens(id);
  }
}

export class GetAccountUseCase implements IGetAccountUseCase {
  constructor(
    private accountRepository: IAccountRepository
  ) {}

  async execute(id: string): Promise<Account | null> {
    return await this.accountRepository.findById(id);
  }
}

export class GetAccountByEmailUseCase implements IGetAccountByEmailUseCase {
  constructor(
    private accountRepository: IAccountRepository
  ) {}

  async execute(email: string): Promise<Account | null> {
    return await this.accountRepository.findByEmail(email);
  }
}

export class DeleteAccountUseCase implements IDeleteAccountUseCase {
  constructor(
    private accountRepository: IAccountRepository
  ) {}

  async execute(id: string): Promise<boolean> {
    return await this.accountRepository.deleteById(id);
  }
}