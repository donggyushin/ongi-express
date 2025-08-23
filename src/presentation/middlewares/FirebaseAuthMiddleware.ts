import { Request, Response, NextFunction } from 'express';
import { IFirebaseService } from '@/domain/services/IFirebaseService';
import { Container } from '@/shared/utils/container';
import { ApiResponse } from '@/shared/types';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    [key: string]: any;
  };
}

export class FirebaseAuthMiddleware {
  private firebaseService: IFirebaseService;

  constructor() {
    this.firebaseService = Container.getInstance().get<IFirebaseService>('firebaseService');
  }

  /**
   * Middleware to verify Firebase ID token
   * Adds decoded user information to request object
   */
  authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Missing or invalid authorization header',
          message: 'Authorization header must start with "Bearer "'
        };
        res.status(401).json(response);
        return;
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      if (!token) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Missing Firebase ID token',
          message: 'Firebase ID token is required'
        };
        res.status(401).json(response);
        return;
      }

      // Verify the Firebase ID token
      const decodedToken = await this.firebaseService.verifyIdToken(token);

      // Add user information to request object
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        ...decodedToken
      };

      next();
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Invalid Firebase ID token',
        message: 'Failed to authenticate user'
      };
      res.status(401).json(response);
    }
  };

  /**
   * Optional authentication middleware
   * Adds user information if token is valid, but doesn't block request if missing
   */
  optionalAuthenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        next();
        return;
      }

      const token = authHeader.substring(7);

      if (!token) {
        next();
        return;
      }

      // Try to verify the token, but don't fail if invalid
      const decodedToken = await this.firebaseService.verifyIdToken(token);

      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        ...decodedToken
      };

      next();
    } catch (error) {
      // Continue without user information if token is invalid
      next();
    }
  };
}