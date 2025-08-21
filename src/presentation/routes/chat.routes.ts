import { Router } from 'express';
import { ChatController } from '@/presentation/controllers';
import { AuthMiddleware } from '@/presentation/middlewares/auth.middleware';

export class ChatRoutes {
  private router = Router();

  constructor(private readonly chatController: ChatController) {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/:profileId', AuthMiddleware.verifyToken, (req, res) => this.chatController.createOrFindChat(req, res));
  }

  getRouter(): Router {
    return this.router;
  }
}