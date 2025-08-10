import { Router } from 'express';
import { WelcomeController } from '@/presentation/controllers';

export class WelcomeRoutes {
  private router = Router();

  constructor(private readonly welcomeController: WelcomeController) {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', (req, res) => this.welcomeController.getWelcome(req, res));
  }

  getRouter(): Router {
    return this.router;
  }
}