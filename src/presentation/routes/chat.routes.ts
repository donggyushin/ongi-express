import { Router } from 'express';
import { ChatController } from '@/presentation/controllers';
import { AuthMiddleware } from '@/presentation/middlewares/auth.middleware';

export class ChatRoutes {
  private router = Router();

  constructor(private readonly chatController: ChatController) {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', AuthMiddleware.verifyToken, (req, res) => this.chatController.getUserChats(req, res));
    this.router.get('/:chatId', AuthMiddleware.verifyToken, (req, res) => this.chatController.getChatById(req, res));
    this.router.post('/:profileId', AuthMiddleware.verifyToken, (req, res) => this.chatController.createOrFindChat(req, res));
    this.router.post('/:chatId/messages', AuthMiddleware.verifyToken, (req, res) => this.chatController.addMessage(req, res));
    this.router.put('/:chatId/read-info', AuthMiddleware.verifyToken, (req, res) => this.chatController.updateMessageReadInfo(req, res));
    this.router.delete('/:chatId/leave', AuthMiddleware.verifyToken, (req, res) => this.chatController.leaveChat(req, res));
  }

  getRouter(): Router {
    return this.router;
  }
}