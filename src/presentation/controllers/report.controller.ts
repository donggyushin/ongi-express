import { Request, Response } from 'express';
import { ICreateReportUseCase, IGetMyReportsUseCase, IGetReportsAgainstMeUseCase } from '@/domain/use-cases';
import { ApiResponse } from '@/shared/types';
import { AuthenticatedRequest } from '@/presentation/middlewares';

export class ReportController {
  constructor(
    private createReportUseCase: ICreateReportUseCase,
    private getMyReportsUseCase: IGetMyReportsUseCase,
    private getReportsAgainstMeUseCase: IGetReportsAgainstMeUseCase
  ) {}

  async createReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { reportedProfileId } = req.params;
      const { content } = req.body;

      if (!userId) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'User authentication required'
        };
        res.status(401).json(response);
        return;
      }

      if (!reportedProfileId) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Reported profile ID is required'
        };
        res.status(400).json(response);
        return;
      }

      if (!content) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Report content is required'
        };
        res.status(400).json(response);
        return;
      }

      const report = await this.createReportUseCase.execute(userId, reportedProfileId, content);

      const response: ApiResponse<any> = {
        success: true,
        data: {
          report: report.toJSON()
        },
        message: 'Report created successfully'
      };

      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      res.status(400).json(response);
    }
  }

  async getMyReports(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const limitNumber = limit ? parseInt(limit as string, 10) : 50;

      if (isNaN(limitNumber) || limitNumber <= 0) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Limit must be a positive number'
        };
        res.status(400).json(response);
        return;
      }

      const reports = await this.getMyReportsUseCase.execute(userId, Math.min(limitNumber, 100));

      const response: ApiResponse<{
        reports: any[];
        count: number;
        limit: number;
      }> = {
        success: true,
        data: {
          reports: reports.map(report => report.toJSON()),
          count: reports.length,
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

  async getReportsAgainstMe(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const limitNumber = limit ? parseInt(limit as string, 10) : 50;

      if (isNaN(limitNumber) || limitNumber <= 0) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Limit must be a positive number'
        };
        res.status(400).json(response);
        return;
      }

      const reports = await this.getReportsAgainstMeUseCase.execute(userId, Math.min(limitNumber, 100));

      const response: ApiResponse<{
        reports: any[];
        count: number;
        limit: number;
      }> = {
        success: true,
        data: {
          reports: reports.map(report => report.toJSON()),
          count: reports.length,
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