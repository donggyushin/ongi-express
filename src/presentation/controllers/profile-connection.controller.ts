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

      const result = await this.profileConnectionUseCase.getConnectedProfiles(userId, limitNumber);

      const response: ApiResponse<{
        profiles: any[];
        newProfileIds: string[];
        profileIDsILike: string[];
        profileIDsLikeMe: string[];
        count: number;
        limit: number;
      }> = {
        success: true,
        data: {
          profiles: result.profiles.map(profile => ({
            ...profile.toJSON(),
            isNew: profile.isNew
          })),
          newProfileIds: result.newProfileIds,
          profileIDsILike: result.profileConnection?.profileIDsILike || [],
          profileIDsLikeMe: result.profileConnection?.profileIDsLikeMe || [],
          count: result.profiles.length,
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

  async markConnectionAsViewed(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { otherProfileId } = req.params;

      if (!userId) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'User authentication required'
        };
        res.status(401).json(response);
        return;
      }

      if (!otherProfileId) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Other profile ID is required'
        };
        res.status(400).json(response);
        return;
      }

      const connection = await this.profileConnectionUseCase.markConnectionAsViewed(userId, otherProfileId);

      const response: ApiResponse<any> = {
        success: true,
        data: connection.toJSON()
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

  async generateConnectionsForActiveProfiles(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.profileConnectionUseCase.generateConnectionsForRecentlyActiveProfiles();

      const response: ApiResponse<{
        processed: number;
        connectionsCreated: number;
        message: string;
      }> = {
        success: true,
        data: {
          processed: result.processed,
          connectionsCreated: result.connectionsCreated,
          message: `처리된 프로필: ${result.processed}개, 생성된 연결: ${result.connectionsCreated}개`
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

  async likeProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { likedProfileId } = req.params;

      if (!userId) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'User authentication required'
        };
        res.status(401).json(response);
        return;
      }

      if (!likedProfileId) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Liked profile ID is required'
        };
        res.status(400).json(response);
        return;
      }

      await this.profileConnectionUseCase.likeProfile(userId, likedProfileId);

      const response: ApiResponse<{ message: string }> = {
        success: true,
        data: {
          message: 'Profile liked successfully'
        }
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      res.status(400).json(response);
    }
  }

  async unlikeProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { likedProfileId } = req.params;

      if (!userId) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'User authentication required'
        };
        res.status(401).json(response);
        return;
      }

      if (!likedProfileId) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Liked profile ID is required'
        };
        res.status(400).json(response);
        return;
      }

      await this.profileConnectionUseCase.unlikeProfile(userId, likedProfileId);

      const response: ApiResponse<{ message: string }> = {
        success: true,
        data: {
          message: 'Profile unliked successfully'
        }
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      res.status(400).json(response);
    }
  }
}