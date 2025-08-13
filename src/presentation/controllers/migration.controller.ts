import { Request, Response } from 'express';
import { IDatabaseService } from '@/shared/types';
import { ApiResponse } from '@/shared/types';

export class MigrationController {
  constructor(private readonly databaseService: IDatabaseService) {}

  async createAccountsTable(req: Request, res: Response): Promise<void> {
    try {
      const query = `
        CREATE TABLE IF NOT EXISTS accounts (
          id VARCHAR(255) PRIMARY KEY,
          type VARCHAR(50) NOT NULL CHECK (type IN ('email', 'apple', 'kakao', 'gmail')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      
      await this.databaseService.query(query);
      
      const response: ApiResponse = {
        success: true,
        message: 'Accounts table created successfully'
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Migration error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to create accounts table'
      };
      
      res.status(500).json(response);
    }
  }
}