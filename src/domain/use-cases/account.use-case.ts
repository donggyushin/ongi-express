import { AccountType, AuthTokens } from '@/domain/entities';
import { IAccountRepository, IJwtRepository } from '@/domain/repositories';

export interface ICreateAccountUseCase {
  execute(id: string, type: AccountType): Promise<AuthTokens>;
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