import { Router } from 'express';
import { PasswordResetController } from '../controllers/password-reset.controller';

export class PasswordResetRoutes {
  public router: Router;
  private passwordResetController: PasswordResetController;

  constructor(passwordResetController: PasswordResetController) {
    this.router = Router();
    this.passwordResetController = passwordResetController;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // POST /password-reset/send-code - 비밀번호 재설정 코드 전송
    this.router.post('/send-code', this.passwordResetController.sendResetCode);

    // POST /password-reset/verify-code - 인증 코드 검증
    this.router.post('/verify-code', this.passwordResetController.verifyResetCode);

    // POST /password-reset/reset - 비밀번호 재설정
    this.router.post('/reset', this.passwordResetController.resetPassword);
  }

  public getRouter(): Router {
    return this.router;
  }
}