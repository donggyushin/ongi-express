import { Request, Response } from 'express';
import { IHealthUseCase } from '@/domain/use-cases';
import { ApiResponse, HealthCheckResponse } from '@/shared/types';

export class HealthController {
  constructor(private readonly healthUseCase: IHealthUseCase) {}

  async getHealth(req: Request, res: Response): Promise<void> {
    try {
      const healthStatus = this.healthUseCase.getHealthStatus();
      const response: ApiResponse<HealthCheckResponse> = {
        success: true,
        data: healthStatus.toJSON()
      };
      
      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to get health status'
      };
      
      res.status(500).json(response);
    }
  }
}