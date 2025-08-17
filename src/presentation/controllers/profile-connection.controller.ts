import { Request, Response } from 'express';
import { IProfileConnectionUseCase } from '@/domain/use-cases';
import { ApiResponse } from '@/shared/types';
import { AuthenticatedRequest } from '@/presentation/middlewares';

export class ProfileConnectionController {
  constructor(
    private profileConnectionUseCase: IProfileConnectionUseCase
  ) {}

  async addRandomConnection(req: Request, res: Response): Promise<void> {
    try {
      const { profileId } = req.params;

      if (!profileId) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Profile ID is required'
        };
        res.status(400).json(response);
        return;
      }

      const result = await this.profileConnectionUseCase.addRandomConnection(profileId);

      const response: ApiResponse<{
        connection: any;
        addedProfile: any;
        message?: string;
      }> = {
        success: true,
        data: {
          connection: result.connection.toJSON(),
          addedProfile: result.addedProfile?.toJSON() ?? null,
          message: result.addedProfile 
            ? `새로운 프로필이 연결되었습니다: ${result.addedProfile.nickname}`
            : '조건에 맞는 새로운 프로필을 찾을 수 없습니다.'
        }
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      res.status(500).json(response);
    }
  }

  async getConnectedProfiles(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { limit } = req.query;

      if (!userId) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'User authentication required'
        };
        res.status(401).json(response);
        return;
      }

      // limit이 제공된 경우 숫자로 변환, 기본값은 100
      const limitNumber = limit ? parseInt(limit as string, 10) : 100;

      if (isNaN(limitNumber) || limitNumber <= 0) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Limit must be a positive number'
        };
        res.status(400).json(response);
        return;
      }

      const profiles = await this.profileConnectionUseCase.getConnectedProfiles(userId, limitNumber);

      const response: ApiResponse<{
        profiles: any[];
        count: number;
        limit: number;
      }> = {
        success: true,
        data: {
          profiles: profiles.map(profile => profile.toJSON()),
          count: profiles.length,
          limit: Math.min(limitNumber, 100)
        }
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      res.status(500).json(response);
    }
  }
}