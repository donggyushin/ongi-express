import { Request, Response } from 'express';
import { ApiResponse } from '@/shared/types';
import { 
  ISendPasswordResetUseCase, 
  IVerifyPasswordResetCodeUseCase, 
  IResetPasswordUseCase 
} from '@/domain/use-cases/password-reset.use-case';

interface SendPasswordResetRequest {
  email: string;
}

interface VerifyCodeRequest {
  code: string;
}

interface ResetPasswordRequest {
  code: string;
  newPassword: string;
}

export class PasswordResetController {
  constructor(
    private sendPasswordResetUseCase: ISendPasswordResetUseCase,
    private verifyPasswordResetCodeUseCase: IVerifyPasswordResetCodeUseCase,
    private resetPasswordUseCase: IResetPasswordUseCase
  ) {}

  sendResetCode = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email }: SendPasswordResetRequest = req.body;

      if (!email) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Email is required'
        };
        res.status(400).json(response);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Invalid email format'
        };
        res.status(400).json(response);
        return;
      }

      const result = await this.sendPasswordResetUseCase.execute(email);

      if (result.success) {
        const response: ApiResponse<null> = {
          success: true,
          message: result.message
        };
        res.status(200).json(response);
      } else {
        const response: ApiResponse<null> = {
          success: false,
          error: result.message
        };
        res.status(400).json(response);
      }
    } catch (error) {
      console.error('Error in sendResetCode:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  };

  verifyResetCode = async (req: Request, res: Response): Promise<void> => {
    try {
      const { code }: VerifyCodeRequest = req.body;

      if (!code) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Verification code is required'
        };
        res.status(400).json(response);
        return;
      }

      if (code.length !== 6 || !/^\d{6}$/.test(code)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Invalid verification code format'
        };
        res.status(400).json(response);
        return;
      }

      const result = await this.verifyPasswordResetCodeUseCase.execute(code);

      if (result.success) {
        const response: ApiResponse<{ email: string }> = {
          success: true,
          data: { email: result.email! },
          message: result.message
        };
        res.status(200).json(response);
      } else {
        const response: ApiResponse<null> = {
          success: false,
          error: result.message
        };
        res.status(400).json(response);
      }
    } catch (error) {
      console.error('Error in verifyResetCode:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { code, newPassword }: ResetPasswordRequest = req.body;

      if (!code || !newPassword) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Code and new password are required'
        };
        res.status(400).json(response);
        return;
      }

      if (code.length !== 6 || !/^\d{6}$/.test(code)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Invalid verification code format'
        };
        res.status(400).json(response);
        return;
      }

      if (newPassword.length < 8) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Password must be at least 8 characters long'
        };
        res.status(400).json(response);
        return;
      }

      const result = await this.resetPasswordUseCase.execute(code, newPassword);

      if (result.success) {
        const response: ApiResponse<null> = {
          success: true,
          message: result.message
        };
        res.status(200).json(response);
      } else {
        const response: ApiResponse<null> = {
          success: false,
          error: result.message
        };
        res.status(400).json(response);
      }
    } catch (error) {
      console.error('Error in resetPassword:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  };
}