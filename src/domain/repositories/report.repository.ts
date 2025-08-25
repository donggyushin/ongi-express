import { Report } from '@/domain/entities';

export interface IReportRepository {
  /**
   * Create a new report
   */
  create(reporterId: string, reportedId: string, content: string): Promise<Report>;

  /**
   * Find reports made by a specific reporter
   */
  findByReporterId(reporterId: string, limit?: number): Promise<Report[]>;

  /**
   * Find reports received by a specific user
   */
  findByReportedId(reportedId: string, limit?: number): Promise<Report[]>;

  /**
   * Check if reporter has already reported the reported user
   */
  hasReported(reporterId: string, reportedId: string): Promise<boolean>;

  /**
   * Get report information between two users
   */
  getReportStatus(userId1: string, userId2: string): Promise<{
    userId1ReportedUserId2: boolean;
    userId2ReportedUserId1: boolean;
  }>;

  /**
   * Get all report statuses for a user against multiple other users
   */
  getMultipleReportStatuses(userId: string, otherUserIds: string[]): Promise<{
    [otherUserId: string]: {
      iReported: boolean;
      theyReported: boolean;
    };
  }>;
}