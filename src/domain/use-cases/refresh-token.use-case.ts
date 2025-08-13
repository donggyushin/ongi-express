import { AuthTokens } from '@/domain/entities';
import { IJwtRepository } from '@/domain/repositories';

export interface IRefreshTokenUseCase {
  execute(refreshToken: string): Promise<AuthTokens | null>;
}

export class RefreshTokenUseCase implements IRefreshTokenUseCase {
  constructor(private readonly jwtRepository: IJwtRepository) {}

  async execute(refreshToken: string): Promise<AuthTokens | null> {
    const validationResult = await this.jwtRepository.validateRefreshToken(refreshToken);
    
    if (!validationResult) {
      return null;
    }

    return await this.jwtRepository.generateTokens(validationResult.userId);
  }
}