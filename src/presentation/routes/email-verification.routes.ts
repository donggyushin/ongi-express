import { Router } from 'express';
import { EmailVerificationController } from '../controllers/email-verification.controller';
import { AuthMiddleware } from '../middlewares';

export class EmailVerificationRoutes {
  private router: Router;

  constructor(private emailVerificationController: EmailVerificationController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // POST /email-verification/send - Send verification code to email
    this.router.post(
      '/send',
      AuthMiddleware.verifyToken,
      this.emailVerificationController.sendVerificationCode
    );

    // POST /email-verification/verify - Verify email with code and update profile
    this.router.post(
      '/verify',
      AuthMiddleware.verifyToken,
      this.emailVerificationController.verifyEmail
    );
  }

  getRouter(): Router {
    return this.router;
  }
}