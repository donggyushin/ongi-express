import { Request, Response } from 'express';
import { ICreateAccountUseCase, IRefreshTokenUseCase } from '@/domain/use-cases';
import { AccountType } from '@/domain/entities';
import { ApiResponse, CreateAccountRequest, AuthTokensResponse, RefreshTokenRequest } from '@/shared/types';

export class AccountController {
  constructor(
    private readonly createAccountUseCase: ICreateAccountUseCase,
    private readonly refreshTokenUseCase: IRefreshTokenUseCase
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
}