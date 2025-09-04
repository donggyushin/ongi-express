import { IPasswordResetRepository } from '../repositories/password-reset.repository';
import { IAccountRepository } from '../repositories/account.repository';
import { IEmailService } from '../../infrastructure/services/mailgun.service';

export interface ISendPasswordResetUseCase {
  execute(email: string): Promise<{ success: boolean; message: string }>;
}

export interface IVerifyPasswordResetCodeUseCase {
  execute(code: string): Promise<{ success: boolean; email?: string; message: string }>;
}

export interface IResetPasswordUseCase {
  execute(code: string, newPassword: string): Promise<{ success: boolean; message: string }>;
}

export class SendPasswordResetUseCase implements ISendPasswordResetUseCase {
  constructor(
    private passwordResetRepository: IPasswordResetRepository,
    private accountRepository: IAccountRepository,
    private emailService: IEmailService
  ) {}

  async execute(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const account = await this.accountRepository.findByEmail(email);
      if (!account) {
        return {
          success: false,
          message: '해당 이메일로 등록된 계정을 찾을 수 없습니다.'
        };
      }

      if (account.type !== 'email') {
        return {
          success: false,
          message: '소셜 로그인 계정은 비밀번호 재설정이 불가능합니다.'
        };
      }

      const resetCode = this.generateResetCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10분 후 만료

      await this.passwordResetRepository.create(email, resetCode, expiresAt);
      await this.emailService.sendPasswordResetEmail(email, resetCode);

      return {
        success: true,
        message: '비밀번호 재설정 코드가 이메일로 전송되었습니다.'
      };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return {
        success: false,
        message: '이메일 전송 중 오류가 발생했습니다.'
      };
    }
  }

  private generateResetCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

export class VerifyPasswordResetCodeUseCase implements IVerifyPasswordResetCodeUseCase {
  constructor(private passwordResetRepository: IPasswordResetRepository) {}

  async execute(code: string): Promise<{ success: boolean; email?: string; message: string }> {
    try {
      const passwordReset = await this.passwordResetRepository.findByCode(code);
      
      if (!passwordReset) {
        return {
          success: false,
          message: '유효하지 않은 인증 코드입니다.'
        };
      }

      if (!passwordReset.isValid()) {
        return {
          success: false,
          message: passwordReset.isExpired() ? '인증 코드가 만료되었습니다.' : '이미 사용된 인증 코드입니다.'
        };
      }

      return {
        success: true,
        email: passwordReset.email,
        message: '인증 코드가 확인되었습니다.'
      };
    } catch (error) {
      console.error('Error verifying password reset code:', error);
      return {
        success: false,
        message: '인증 코드 확인 중 오류가 발생했습니다.'
      };
    }
  }
}

export class ResetPasswordUseCase implements IResetPasswordUseCase {
  constructor(
    private passwordResetRepository: IPasswordResetRepository,
    private accountRepository: IAccountRepository
  ) {}

  async execute(code: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const passwordReset = await this.passwordResetRepository.findByCode(code);
      
      if (!passwordReset) {
        return {
          success: false,
          message: '유효하지 않은 인증 코드입니다.'
        };
      }

      if (!passwordReset.isValid()) {
        return {
          success: false,
          message: passwordReset.isExpired() ? '인증 코드가 만료되었습니다.' : '이미 사용된 인증 코드입니다.'
        };
      }

      await this.accountRepository.updatePassword(passwordReset.email, newPassword);
      await this.passwordResetRepository.markAsUsed(passwordReset.id);

      return {
        success: true,
        message: '비밀번호가 성공적으로 재설정되었습니다.'
      };
    } catch (error) {
      console.error('Error resetting password:', error);
      return {
        success: false,
        message: '비밀번호 재설정 중 오류가 발생했습니다.'
      };
    }
  }
}