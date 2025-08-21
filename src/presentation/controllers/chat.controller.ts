import { Request, Response } from 'express';
import { ICreateOrFindChatUseCase, IGetAccountUseCase } from '@/domain/use-cases';
import { ApiResponse } from '@/shared/types';
import { AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';

export class ChatController {
  constructor(
    private readonly createOrFindChatUseCase: ICreateOrFindChatUseCase,
    private readonly getAccountUseCase: IGetAccountUseCase
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
      const currentAccount = await this.getAccountUseCase.execute(req.userId);
      if (!currentAccount || !currentAccount.profile) {
        const response: ApiResponse = {
          success: false,
          error: 'Current user profile not found'
        };
        res.status(404).json(response);
        return;
      }

      // Extract pagination parameters from query
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const cursor = req.query.cursor as string | undefined;

      // Validate limit
      const validatedLimit = Math.min(Math.max(limit, 1), 100); // Between 1 and 100

      const result = await this.createOrFindChatUseCase.execute(
        currentAccount.profile.id, 
        profileId,
        {
          limit: validatedLimit,
          cursor
        }
      );
      
      const response: ApiResponse = {
        success: true,
        data: {
          chat: result.chat.toJSON(),
          participants: result.participants.map(p => p.toJSON()),
          pagination: {
            limit: validatedLimit,
            hasMore: result.chat.messages.length === validatedLimit,
            nextCursor: result.chat.messages.length > 0 ? result.chat.messages[result.chat.messages.length - 1].id : undefined
          }
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