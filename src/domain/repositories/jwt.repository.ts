import { AuthTokens } from '@/domain/entities';

export interface IJwtRepository {
  generateTokens(userId: string): Promise<AuthTokens>;
  validateRefreshToken(refreshToken: string): Promise<{ userId: string } | null>;
}