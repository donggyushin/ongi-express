import jwt from 'jsonwebtoken';
import { AuthTokens } from '@/domain/entities';
import { IJwtRepository } from '@/domain/repositories';

export class JwtService implements IJwtRepository {
  private readonly secretKey: string;
  private readonly expiresIn: string;

  constructor() {
    this.secretKey = process.env.JWT_SECRET || 'your-secret-key-here';
    this.expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  }

  async generateTokens(userId: string): Promise<AuthTokens> {
    const payload = { userId, type: 'access' };
    const refreshPayload = { userId, type: 'refresh' };

    const accessToken = jwt.sign(payload, this.secretKey, { 
      expiresIn: this.expiresIn 
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(refreshPayload, this.secretKey, { 
      expiresIn: '30d' // Refresh tokens last longer
    } as jwt.SignOptions);

    return new AuthTokens(accessToken, refreshToken);
  }
}