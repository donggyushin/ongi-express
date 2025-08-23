import { Request, Response } from 'express';
import { ICreateOrFindChatUseCase, IGetUserChatsUseCase, IAddMessageUseCase, IUpdateMessageReadInfoUseCase, IGetAccountUseCase, IGetChatByIdUseCase } from '@/domain/use-cases';
import { ApiResponse } from '@/shared/types';
import { AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { IRealtimeChatService } from '@/domain/interfaces/realtime-chat.service.interface';

export class ChatController {
  constructor(
    private readonly createOrFindChatUseCase: ICreateOrFindChatUseCase,
    private readonly getUserChatsUseCase: IGetUserChatsUseCase,
    private readonly addMessageUseCase: IAddMessageUseCase,
    private readonly updateMessageReadInfoUseCase: IUpdateMessageReadInfoUseCase,
    private readonly getAccountUseCase: IGetAccountUseCase,
    private readonly getChatByIdUseCase: IGetChatByIdUseCase,
    private readonly realtimeChatService: IRealtimeChatService
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

      const result = await this.createOrFindChatUseCase.execute(
        currentAccount.profile.id, 
        profileId
      );
      
      const response: ApiResponse = {
        success: true,
        data: {
          chat: result.chat.toJSON()
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

  async getUserChats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        const response: ApiResponse = {
          success: false,
          error: 'User ID not found in token'
        };
        res.status(401).json(response);
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

      const result = await this.getUserChatsUseCase.execute(currentAccount.profile.id);
      
      const response: ApiResponse = {
        success: true,
        data: {
          chats: result.chats.map(chat => chat.toJSON())
        },
        message: 'User chats retrieved successfully'
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Get user chats error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to get user chats'
      };
      
      res.status(500).json(response);
    }
  }

  async addMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        const response: ApiResponse = {
          success: false,
          error: 'User ID not found in token'
        };
        res.status(401).json(response);
        return;
      }

      const { chatId } = req.params;
      const { text } = req.body;

      if (!chatId) {
        const response: ApiResponse = {
          success: false,
          error: 'Missing required parameter: chatId'
        };
        res.status(400).json(response);
        return;
      }

      if (!text) {
        const response: ApiResponse = {
          success: false,
          error: 'Missing required field: text'
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

      const message = await this.addMessageUseCase.execute(
        chatId,
        currentAccount.profile.id,
        text
      );

      // Broadcast message to all users in the chat room
      this.realtimeChatService.broadcastMessage(chatId, {
        id: message.id,
        writerProfileId: message.writerProfileId,
        text: message.text,
        createdAt: message.createdAt.toISOString(),
        updatedAt: message.updatedAt.toISOString()
      });
      
      const response: ApiResponse = {
        success: true,
        data: {
          message: message.toJSON()
        },
        message: 'Message added successfully'
      };
      
      res.status(201).json(response);
    } catch (error) {
      console.error('Add message error:', error);
      
      let errorMessage = 'Failed to add message';
      let statusCode = 500;

      if (error instanceof Error) {
        if (error.message.includes('Chat not found') || 
            error.message.includes('not authorized') ||
            error.message.includes('not a participant')) {
          errorMessage = error.message;
          statusCode = 403;
        } else if (error.message.includes('empty') || 
                   error.message.includes('too long')) {
          errorMessage = error.message;
          statusCode = 400;
        }
      }

      const response: ApiResponse = {
        success: false,
        error: errorMessage
      };
      
      res.status(statusCode).json(response);
    }
  }

  async updateMessageReadInfo(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        const response: ApiResponse = {
          success: false,
          error: 'User ID not found in token'
        };
        res.status(401).json(response);
        return;
      }

      const { chatId } = req.params;
      const { dateInfoUserViewedRecently } = req.body;

      if (!chatId) {
        const response: ApiResponse = {
          success: false,
          error: 'Missing required parameter: chatId'
        };
        res.status(400).json(response);
        return;
      }

      if (!dateInfoUserViewedRecently) {
        const response: ApiResponse = {
          success: false,
          error: 'Missing required field: dateInfoUserViewedRecently'
        };
        res.status(400).json(response);
        return;
      }

      // Validate date format
      const date = new Date(dateInfoUserViewedRecently);
      if (isNaN(date.getTime())) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid date format for dateInfoUserViewedRecently'
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

      const chat = await this.updateMessageReadInfoUseCase.execute(
        chatId,
        currentAccount.profile.id,
        date
      );
      
      const response: ApiResponse = {
        success: true,
        data: {
          chat: chat.toJSON()
        },
        message: 'Message read info updated successfully'
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Update message read info error:', error);
      
      let errorMessage = 'Failed to update message read info';
      let statusCode = 500;

      if (error instanceof Error) {
        if (error.message.includes('Chat not found') || 
            error.message.includes('not authorized')) {
          errorMessage = error.message;
          statusCode = 403;
        }
      }

      const response: ApiResponse = {
        success: false,
        error: errorMessage
      };
      
      res.status(statusCode).json(response);
    }
  }

  async getChatById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        const response: ApiResponse = {
          success: false,
          error: 'User ID not found in token'
        };
        res.status(401).json(response);
        return;
      }

      const { chatId } = req.params;

      if (!chatId) {
        const response: ApiResponse = {
          success: false,
          error: 'Missing required parameter: chatId'
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
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const cursor = req.query.cursor as string | undefined;

      const result = await this.getChatByIdUseCase.execute(
        chatId,
        currentAccount.profile.id,
        {
          limit,
          cursor
        }
      );
      
      const response: ApiResponse = {
        success: true,
        data: {
          chat: result.chat.toJSON(),
          pagination: result.pagination
        },
        message: 'Chat retrieved successfully'
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Get chat by ID error:', error);
      
      let errorMessage = 'Failed to get chat';
      let statusCode = 500;

      if (error instanceof Error) {
        if (error.message.includes('Chat not found')) {
          errorMessage = error.message;
          statusCode = 404;
        } else if (error.message.includes('Not authorized')) {
          errorMessage = error.message;
          statusCode = 403;
        }
      }

      const response: ApiResponse = {
        success: false,
        error: errorMessage
      };
      
      res.status(statusCode).json(response);
    }
  }
}