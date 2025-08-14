import { Request, Response } from 'express';
import multer from 'multer';
import { IProfileUseCase } from '@/domain/use-cases';
import { ApiResponse } from '@/shared/types/response';
import { Profile } from '@/domain/entities';
import { AuthenticatedRequest } from '../middlewares';

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

export class ProfileController {
  constructor(private profileUseCase: IProfileUseCase) {}

  // Multer middleware for single image upload
  public uploadMiddleware = upload.single('profileImage');
  public addImageMiddleware = upload.single('image');

  public uploadProfileImage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const accountId = req.userId;
      const file = req.file;

      if (!file) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'No image file provided'
        };
        res.status(400).json(response);
        return;
      }

      if (!accountId) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Authentication required'
        };
        res.status(401).json(response);
        return;
      }

      // Generate unique filename
      const fileName = `profile_${accountId}_${Date.now()}`;
      
      // Upload image and update profile
      const updatedProfile = await this.profileUseCase.updateProfileImage(
        accountId,
        file.buffer,
        fileName
      );

      const response: ApiResponse<Profile> = {
        success: true,
        data: updatedProfile,
        message: 'Profile image updated successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload profile image'
      };
      res.status(500).json(response);
    }
  };

  public updateNickname = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const accountId = req.userId;
      const { nickname } = req.body;

      if (!accountId) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Authentication required'
        };
        res.status(401).json(response);
        return;
      }

      if (!nickname) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Nickname is required'
        };
        res.status(400).json(response);
        return;
      }

      const updatedProfile = await this.profileUseCase.updateNickname(accountId, nickname);

      const response: ApiResponse<Profile> = {
        success: true,
        data: updatedProfile,
        message: 'Nickname updated successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update nickname'
      };
      res.status(500).json(response);
    }
  };

  public getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const accountId = req.userId;

      if (!accountId) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Authentication required'
        };
        res.status(401).json(response);
        return;
      }

      const profile = await this.profileUseCase.getProfile(accountId);

      if (!profile) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Profile not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<Profile> = {
        success: true,
        data: profile
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get profile'
      };
      res.status(500).json(response);
    }
  };

  public addImage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const accountId = req.userId;
      const file = req.file;

      if (!file) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'No image file provided'
        };
        res.status(400).json(response);
        return;
      }

      if (!accountId) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Authentication required'
        };
        res.status(401).json(response);
        return;
      }

      // Generate unique filename
      const fileName = `profile_gallery_${accountId}_${Date.now()}`;
      
      // Add image to profile gallery
      const updatedProfile = await this.profileUseCase.addImage(
        accountId,
        file.buffer,
        fileName
      );

      const response: ApiResponse<Profile> = {
        success: true,
        data: updatedProfile,
        message: 'Image added to profile gallery successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add image'
      };
      res.status(500).json(response);
    }
  };

  public removeImage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const accountId = req.userId;
      const { publicId } = req.body;

      if (!accountId) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Authentication required'
        };
        res.status(401).json(response);
        return;
      }

      if (!publicId) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Public ID is required'
        };
        res.status(400).json(response);
        return;
      }

      // Remove image from profile gallery
      const updatedProfile = await this.profileUseCase.removeImage(accountId, publicId);

      const response: ApiResponse<Profile> = {
        success: true,
        data: updatedProfile,
        message: 'Image removed from profile gallery successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove image'
      };
      res.status(500).json(response);
    }
  };

  public updateMbti = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const accountId = req.userId;
      const { mbti } = req.body;

      if (!accountId) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Authentication required'
        };
        res.status(401).json(response);
        return;
      }

      if (!mbti) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'MBTI type is required'
        };
        res.status(400).json(response);
        return;
      }

      const updatedProfile = await this.profileUseCase.updateMbti(accountId, mbti);

      const response: ApiResponse<Profile> = {
        success: true,
        data: updatedProfile,
        message: 'MBTI updated successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update MBTI'
      };
      res.status(500).json(response);
    }
  };

  public addQna = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const accountId = req.userId;
      const { question, answer } = req.body;

      if (!accountId) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Authentication required'
        };
        res.status(401).json(response);
        return;
      }

      if (!question) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Question is required'
        };
        res.status(400).json(response);
        return;
      }

      if (!answer) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Answer is required'
        };
        res.status(400).json(response);
        return;
      }

      const updatedProfile = await this.profileUseCase.addQna(accountId, question, answer);

      const response: ApiResponse<Profile> = {
        success: true,
        data: updatedProfile,
        message: 'Q&A added successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add Q&A'
      };
      res.status(500).json(response);
    }
  };

  public removeQna = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const accountId = req.userId;
      const { qnaId } = req.body;

      if (!accountId) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Authentication required'
        };
        res.status(401).json(response);
        return;
      }

      if (!qnaId) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Q&A ID is required'
        };
        res.status(400).json(response);
        return;
      }

      const updatedProfile = await this.profileUseCase.removeQna(accountId, qnaId);

      const response: ApiResponse<Profile> = {
        success: true,
        data: updatedProfile,
        message: 'Q&A removed successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove Q&A'
      };
      res.status(500).json(response);
    }
  };

  public updateQna = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const accountId = req.userId;
      const { qnaId, answer } = req.body;

      if (!accountId) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Authentication required'
        };
        res.status(401).json(response);
        return;
      }

      if (!qnaId) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Q&A ID is required'
        };
        res.status(400).json(response);
        return;
      }

      if (!answer) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Answer is required'
        };
        res.status(400).json(response);
        return;
      }

      const updatedProfile = await this.profileUseCase.updateQna(accountId, qnaId, answer);

      const response: ApiResponse<Profile> = {
        success: true,
        data: updatedProfile,
        message: 'Q&A answer updated successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update Q&A answer'
      };
      res.status(500).json(response);
    }
  };
}