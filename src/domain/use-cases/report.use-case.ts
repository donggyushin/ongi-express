import { Report } from '@/domain/entities';
import { IReportRepository, IProfileRepository } from '@/domain/repositories';

export interface ICreateReportUseCase {
  execute(reporterAccountId: string, reportedProfileId: string, content: string): Promise<Report>;
}

export interface IGetMyReportsUseCase {
  execute(reporterAccountId: string, limit?: number): Promise<Report[]>;
}

export interface IGetReportsAgainstMeUseCase {
  execute(reportedAccountId: string, limit?: number): Promise<Report[]>;
}

export class CreateReportUseCase implements ICreateReportUseCase {
  constructor(
    private reportRepository: IReportRepository,
    private profileRepository: IProfileRepository
  ) {}

  async execute(reporterAccountId: string, reportedProfileId: string, content: string): Promise<Report> {
    // Validate content
    if (!content || content.trim().length === 0) {
      throw new Error('Report content cannot be empty');
    }

    if (content.length > 1000) {
      throw new Error('Report content is too long (max 1000 characters)');
    }

    // Get reporter profile
    const reporterProfile = await this.profileRepository.findByAccountId(reporterAccountId);
    if (!reporterProfile) {
      throw new Error('Reporter profile not found');
    }

    // Verify reported profile exists
    const reportedProfile = await this.profileRepository.findById(reportedProfileId);
    if (!reportedProfile) {
      throw new Error('Reported profile not found');
    }

    // Cannot report yourself
    if (reporterProfile.id === reportedProfileId) {
      throw new Error('Cannot report yourself');
    }

    // Check if already reported
    const hasAlreadyReported = await this.reportRepository.hasReported(
      reporterProfile.id, 
      reportedProfileId
    );
    if (hasAlreadyReported) {
      throw new Error('You have already reported this user');
    }

    // Create the report
    return await this.reportRepository.create(
      reporterProfile.id, 
      reportedProfileId, 
      content.trim()
    );
  }
}

export class GetMyReportsUseCase implements IGetMyReportsUseCase {
  constructor(
    private reportRepository: IReportRepository,
    private profileRepository: IProfileRepository
  ) {}

  async execute(reporterAccountId: string, limit: number = 50): Promise<Report[]> {
    // Get reporter profile
    const reporterProfile = await this.profileRepository.findByAccountId(reporterAccountId);
    if (!reporterProfile) {
      throw new Error('Reporter profile not found');
    }

    return await this.reportRepository.findByReporterId(reporterProfile.id, limit);
  }
}

export class GetReportsAgainstMeUseCase implements IGetReportsAgainstMeUseCase {
  constructor(
    private reportRepository: IReportRepository,
    private profileRepository: IProfileRepository
  ) {}

  async execute(reportedAccountId: string, limit: number = 50): Promise<Report[]> {
    // Get reported user's profile
    const reportedProfile = await this.profileRepository.findByAccountId(reportedAccountId);
    if (!reportedProfile) {
      throw new Error('Reported user profile not found');
    }

    return await this.reportRepository.findByReportedId(reportedProfile.id, limit);
  }
}