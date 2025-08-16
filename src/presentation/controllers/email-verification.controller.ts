import { Request, Response } from 'express';
import { IEmailVerificationUseCase } from '@/domain/use-cases/email-verification.use-case';
import { ApiResponse } from '@/shared/types/response';
import { Profile } from '@/domain/entities';
import { AuthenticatedRequest } from '../middlewares';

export class EmailVerificationController {
  constructor(private emailVerificationUseCase: IEmailVerificationUseCase) {}

  public sendVerificationCode = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const accountId = req.userId;
      const { email } = req.body;

      if (!accountId) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Authentication required'
        };
        res.status(401).json(response);
        return;
      }

      if (!email) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Email is required'
        };
        res.status(400).json(response);
        return;
      }

      await this.emailVerificationUseCase.sendVerificationCode(accountId, email);

      const response: ApiResponse<null> = {
        success: true,
        message: 'Verification code sent to your email'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send verification code'
      };
      res.status(500).json(response);
    }
  };

  public sendCompanyVerificationCode = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const accountId = req.userId;
      const { email } = req.body;

      if (!accountId) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Authentication required'
        };
        res.status(401).json(response);
        return;
      }

      if (!email) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Email is required'
        };
        res.status(400).json(response);
        return;
      }

      await this.emailVerificationUseCase.sendCompanyVerificationCode(accountId, email);

      const response: ApiResponse<null> = {
        success: true,
        message: 'Verification code sent to your company email'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send verification code'
      };
      
      // 회사 이메일이 아닌 경우 400 에러
      if (error instanceof Error && 
          (error.message.includes('Personal email addresses') || 
           error.message.includes('Disposable email addresses'))) {
        res.status(400).json(response);
      } else {
        res.status(500).json(response);
      }
    }
  };

  public verifyEmail = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const accountId = req.userId;
      const { code } = req.body;

      if (!accountId) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Authentication required'
        };
        res.status(401).json(response);
        return;
      }

      if (!code) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Verification code is required'
        };
        res.status(400).json(response);
        return;
      }

      const updatedProfile = await this.emailVerificationUseCase.verifyEmailAndUpdateProfile(accountId, code);

      const response: ApiResponse<Profile> = {
        success: true,
        data: updatedProfile,
        message: 'Email verified and profile updated successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify email'
      };
      
      // 인증 코드가 잘못되었거나 만료된 경우 400 에러
      if (error instanceof Error && 
          (error.message.includes('Invalid verification code') || 
           error.message.includes('expired') || 
           error.message.includes('already used'))) {
        res.status(400).json(response);
      } else {
        res.status(500).json(response);
      }
    }
  };
}