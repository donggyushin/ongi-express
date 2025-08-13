import { Request, Response } from 'express';
import { ICreateAccountUseCase } from '@/domain/use-cases';
import { AccountType } from '@/domain/entities';
import { ApiResponse, CreateAccountRequest, AccountResponse } from '@/shared/types';

export class AccountController {
  constructor(private readonly createAccountUseCase: ICreateAccountUseCase) {}

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

      const account = await this.createAccountUseCase.execute(id, type as AccountType);
      
      const response: ApiResponse<AccountResponse> = {
        success: true,
        data: account.toJSON(),
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
}