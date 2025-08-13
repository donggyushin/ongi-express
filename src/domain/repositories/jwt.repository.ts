import { AuthTokens } from '@/domain/entities';

export interface IJwtRepository {
  generateTokens(userId: string): Promise<AuthTokens>;
}