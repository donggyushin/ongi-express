import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiResponse } from '@/shared/types';
import { Container } from '@/shared/utils';
import { IProfileRepository } from '@/domain/repositories';

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export class AuthMiddleware {
  private static secretKey = process.env.JWT_SECRET || 'your-secret-key-here';

  static async optionalVerifyToken(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // No token provided, continue without authentication
        next();
        return;
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      const decoded = jwt.verify(token, AuthMiddleware.secretKey) as any;
      
      if (decoded.type === 'access') {
        req.userId = decoded.userId;

        // Update lastTokenAuthAt for the user's profile
        try {
          const container = Container.getInstance();
          const profileRepository = container.get<IProfileRepository>('profileRepository');
          await profileRepository.updateLastTokenAuth(decoded.userId);
        } catch (updateError) {
          // Log error but don't fail the authentication
          console.error('Failed to update lastTokenAuthAt:', updateError);
        }
      }

      next();
    } catch (error) {
      // Invalid token, continue without authentication
      next();
    }
  }

  static async verifyToken(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Authorization token is required'
        };
        res.status(401).json(response);
        return;
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      const decoded = jwt.verify(token, AuthMiddleware.secretKey) as any;
      
      if (decoded.type !== 'access') {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Invalid token type'
        };
        res.status(401).json(response);
        return;
      }

      req.userId = decoded.userId;

      // Update lastTokenAuthAt for the user's profile
      try {
        const container = Container.getInstance();
        const profileRepository = container.get<IProfileRepository>('profileRepository');
        await profileRepository.updateLastTokenAuth(decoded.userId);
      } catch (updateError) {
        // Log error but don't fail the authentication
        console.error('Failed to update lastTokenAuthAt:', updateError);
      }

      next();
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Invalid or expired token'
      };
      res.status(401).json(response);
    }
  }
}

export { AuthenticatedRequest };