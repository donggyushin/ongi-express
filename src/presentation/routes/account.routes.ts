import { Router } from 'express';
import { AccountController } from '@/presentation/controllers';
import { AuthMiddleware } from '@/presentation/middlewares/auth.middleware';

export class AccountRoutes {
  private router = Router();

  constructor(private readonly accountController: AccountController) {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/', (req, res) => this.accountController.createAccount(req, res));
    this.router.post('/email-password', (req, res) => this.accountController.createAccountWithEmailPassword(req, res));
    this.router.post('/login', (req, res) => this.accountController.loginWithEmailPassword(req, res));
    this.router.post('/refresh', (req, res) => this.accountController.refreshToken(req, res));
    this.router.get('/me', AuthMiddleware.verifyToken, (req, res) => this.accountController.getAccount(req, res));
    this.router.get('/by-email', (req, res) => this.accountController.getAccountByEmail(req, res));
    this.router.delete('/me', AuthMiddleware.verifyToken, (req, res) => this.accountController.deleteAccount(req, res));
  }

  getRouter(): Router {
    return this.router;
  }
}