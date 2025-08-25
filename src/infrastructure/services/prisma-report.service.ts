import { Report } from '@/domain/entities';
import { IReportRepository } from '@/domain/repositories';
import { PrismaClient } from '@/generated/prisma';

export class PrismaReportService implements IReportRepository {
  constructor(private prisma: PrismaClient) {}

  async create(reporterId: string, reportedId: string, content: string): Promise<Report> {
    const report = await this.prisma.report.create({
      data: {
        reporterId,
        reportedId,
        content
      }
    });

    return new Report(
      report.id,
      report.reporterId,
      report.reportedId,
      report.content,
      report.createdAt,
      report.updatedAt
    );
  }

  async findByReporterId(reporterId: string, limit: number = 50): Promise<Report[]> {
    const reports = await this.prisma.report.findMany({
      where: {
        reporterId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: Math.min(limit, 100) // Max 100 reports at once
    });

    return reports.map(report => new Report(
      report.id,
      report.reporterId,
      report.reportedId,
      report.content,
      report.createdAt,
      report.updatedAt
    ));
  }

  async findByReportedId(reportedId: string, limit: number = 50): Promise<Report[]> {
    const reports = await this.prisma.report.findMany({
      where: {
        reportedId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: Math.min(limit, 100) // Max 100 reports at once
    });

    return reports.map(report => new Report(
      report.id,
      report.reporterId,
      report.reportedId,
      report.content,
      report.createdAt,
      report.updatedAt
    ));
  }

  async hasReported(reporterId: string, reportedId: string): Promise<boolean> {
    const report = await this.prisma.report.findFirst({
      where: {
        reporterId,
        reportedId
      }
    });

    return !!report;
  }

  async getReportStatus(userId1: string, userId2: string): Promise<{
    userId1ReportedUserId2: boolean;
    userId2ReportedUserId1: boolean;
  }> {
    const [report1, report2] = await Promise.all([
      this.prisma.report.findFirst({
        where: {
          reporterId: userId1,
          reportedId: userId2
        }
      }),
      this.prisma.report.findFirst({
        where: {
          reporterId: userId2,
          reportedId: userId1
        }
      })
    ]);

    return {
      userId1ReportedUserId2: !!report1,
      userId2ReportedUserId1: !!report2
    };
  }

  async getMultipleReportStatuses(userId: string, otherUserIds: string[]): Promise<{
    [otherUserId: string]: {
      iReported: boolean;
      theyReported: boolean;
    };
  }> {
    if (otherUserIds.length === 0) {
      return {};
    }

    // Get all reports where userId reported others or others reported userId
    const [reportsIMade, reportsAgainstMe] = await Promise.all([
      this.prisma.report.findMany({
        where: {
          reporterId: userId,
          reportedId: {
            in: otherUserIds
          }
        },
        select: {
          reportedId: true
        }
      }),
      this.prisma.report.findMany({
        where: {
          reporterId: {
            in: otherUserIds
          },
          reportedId: userId
        },
        select: {
          reporterId: true
        }
      })
    ]);

    // Create sets for faster lookup
    const reportedByMe = new Set(reportsIMade.map(r => r.reportedId));
    const reportedMe = new Set(reportsAgainstMe.map(r => r.reporterId));

    // Build result object
    const result: { [otherUserId: string]: { iReported: boolean; theyReported: boolean } } = {};
    
    for (const otherUserId of otherUserIds) {
      result[otherUserId] = {
        iReported: reportedByMe.has(otherUserId),
        theyReported: reportedMe.has(otherUserId)
      };
    }

    return result;
  }
}