import { Request, Response } from 'express';
import { IDatabaseService } from '@/shared/types';
import { ApiResponse } from '@/shared/types';

export class DatabaseController {
  constructor(private databaseService: IDatabaseService) {}

  async testConnection(req: Request, res: Response): Promise<void> {
    try {
      const isHealthy = await this.databaseService.healthCheck();
      
      const response: ApiResponse<{ connected: boolean }> = {
        success: isHealthy,
        data: { connected: isHealthy },
        message: isHealthy ? 'Database connection successful' : 'Database connection failed'
      };

      res.status(isHealthy ? 200 : 500).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Database connection test failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      };

      res.status(500).json(response);
    }
  }
}