import { Request, Response } from 'express';
import { IWelcomeUseCase } from '@/domain/use-cases';
import { ApiResponse, WelcomeResponse } from '@/shared/types';

export class WelcomeController {
  constructor(private readonly welcomeUseCase: IWelcomeUseCase) {}

  async getWelcome(req: Request, res: Response): Promise<void> {
    try {
      const welcomeMessage = this.welcomeUseCase.getWelcomeMessage();
      const response: ApiResponse<WelcomeResponse> = {
        success: true,
        data: welcomeMessage.toJSON()
      };
      
      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to get welcome message'
      };
      
      res.status(500).json(response);
    }
  }
}