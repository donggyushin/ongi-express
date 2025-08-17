import { Request, Response } from 'express';
import { ICreateAccountUseCase, IGetAccountUseCase, IRefreshTokenUseCase, IDeleteAccountUseCase } from '@/domain/use-cases';
import { AccountType } from '@/domain/entities';
import { ApiResponse, CreateAccountRequest, AuthTokensResponse, RefreshTokenRequest } from '@/shared/types';
import { AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';

export class AccountController {
  constructor(
    private readonly createAccountUseCase: ICreateAccountUseCase,
    private readonly getAccountUseCase: IGetAccountUseCase,
    private readonly refreshTokenUseCase: IRefreshTokenUseCase,
    private readonly deleteAccountUseCase: IDeleteAccountUseCase
  ) {}

  async createAccount(req: Request, res: Response): Promise<void> {
    try {
      const { id, type }: CreateAccountRequest = req.body;

      if (!id || !type) {
        const response: ApiResponse = {
          success: false,
          error: 'Missing required fields: id and type'
        };
        res.status(400).json(response);
        return;
      }

      if (!Object.values(AccountType).includes(type as AccountType)) {
        const response: ApiResponse = {
          success: false,
          error: `Invalid account type. Must be one of: ${Object.values(AccountType).join(', ')}`
        };
        res.status(400).json(response);
        return;
      }

      const tokens = await this.createAccountUseCase.execute(id, type as AccountType);
      
      const response: ApiResponse<AuthTokensResponse> = {
        success: true,
        data: tokens.toJSON(),
        message: 'Account created successfully'
      };
      
      res.status(201).json(response);
    } catch (error) {
      console.error('Account creation error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to create account'
      };
      
      res.status(500).json(response);
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken }: RefreshTokenRequest = req.body;

      if (!refreshToken) {
        const response: ApiResponse = {
          success: false,
          error: 'Missing required field: refreshToken'
        };
        res.status(400).json(response);
        return;
      }

      const tokens = await this.refreshTokenUseCase.execute(refreshToken);
      
      if (!tokens) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid or expired refresh token'
        };
        res.status(401).json(response);
        return;
      }
      
      const response: ApiResponse<AuthTokensResponse> = {
        success: true,
        data: tokens.toJSON(),
        message: 'Token refreshed successfully'
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Token refresh error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to refresh token'
      };
      
      res.status(500).json(response);
    }
  }

  async getAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        const response: ApiResponse = {
          success: false,
          error: 'User ID not found in token'
        };
        res.status(401).json(response);
        return;
      }

      const account = await this.getAccountUseCase.execute(req.userId);
      
      if (!account) {
        const response: ApiResponse = {
          success: false,
          error: 'Account not found'
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse = {
        success: true,
        data: account,
        message: 'Account retrieved successfully'
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Get account error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to retrieve account'
      };
      
      res.status(500).json(response);
    }
  }

  async deleteAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        const response: ApiResponse = {
          success: false,
          error: 'User ID not found in token'
        };
        res.status(401).json(response);
        return;
      }

      const deleted = await this.deleteAccountUseCase.execute(req.userId);
      
      if (!deleted) {
        const response: ApiResponse = {
          success: false,
          error: 'Account not found or failed to delete'
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse = {
        success: true,
        message: '계정이 성공적으로 삭제되었습니다'
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Delete account error:', error);
      const response: ApiResponse = {
        success: false,
        error: '계정 삭제에 실패했습니다'
      };
      
      res.status(500).json(response);
    }
  }
}