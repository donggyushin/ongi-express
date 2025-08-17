import { Request, Response } from 'express';
import { IProfileConnectionUseCase } from '@/domain/use-cases';
import { ApiResponse } from '@/shared/types';

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
}