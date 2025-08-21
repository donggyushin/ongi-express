import { Request, Response } from 'express';
import { ICreateOrFindChatUseCase } from '@/domain/use-cases';
import { ApiResponse } from '@/shared/types';
import { AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { Container } from '@/shared/utils';

export class ChatController {
  private container = Container.getInstance();

  constructor(
    private readonly createOrFindChatUseCase: ICreateOrFindChatUseCase
  ) {}

  async createOrFindChat(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        const response: ApiResponse = {
          success: false,
          error: 'User ID not found in token'
        };
        res.status(401).json(response);
        return;
      }

      const { profileId } = req.params;

      if (!profileId) {
        const response: ApiResponse = {
          success: false,
          error: 'Missing required parameter: profileId'
        };
        res.status(400).json(response);
        return;
      }

      // Get current user's profile first  
      const accountRepository = this.container.get('accountRepository') as any;
      const currentAccount = await accountRepository.findById(req.userId);
      if (!currentAccount || !currentAccount.profile) {
        const response: ApiResponse = {
          success: false,
          error: 'Current user profile not found'
        };
        res.status(404).json(response);
        return;
      }

      const result = await this.createOrFindChatUseCase.execute(currentAccount.profile.id, profileId);
      
      const response: ApiResponse = {
        success: true,
        data: {
          chat: result.chat.toJSON(),
          participants: result.participants.map(p => p.toJSON())
        },
        message: 'Chat retrieved successfully'
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Create or find chat error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to create or find chat'
      };
      
      res.status(500).json(response);
    }
  }
}