import { Router } from 'express';
import { AccountController } from '@/presentation/controllers';

export class AccountRoutes {
  private router = Router();

  constructor(private readonly accountController: AccountController) {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/', (req, res) => this.accountController.createAccount(req, res));
  }

  getRouter(): Router {
    return this.router;
  }
}