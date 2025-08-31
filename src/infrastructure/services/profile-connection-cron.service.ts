import axios from 'axios';
import { ICronService } from '@/domain/services/cron.service.interface';
import { ILoggerService } from '@/infrastructure/services/logger.service';

export class ProfileConnectionCronService {
  constructor(
    private cronService: ICronService,
    private loggerService: ILoggerService
  ) {}

  initialize(): void {
    // 매일 한국시간 오후 8시 (cron: 0 11 * * * UTC 기준)
    // 한국시간 8:00 PM = UTC 11:00 AM
    this.cronService.scheduleJob(
      'daily-profile-connections',
      '0 11 * * *',
      this.generateConnectionsForActiveProfiles.bind(this)
    );
  }

  private async generateConnectionsForActiveProfiles(): Promise<void> {
    try {
      const baseUrl = process.env.RAILWAY_PUBLIC_DOMAIN || 'http://localhost:3000';
      const url = `${baseUrl}/profile-connections/generate-for-active-profiles`;
      
      this.loggerService.info('Calling profile connections API:', url);
      
      const response = await axios.post(url, {}, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30초 타임아웃
      });

      this.loggerService.info('Profile connections API response:', response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.loggerService.error('Failed to call profile connections API:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        } as any);
      } else {
        this.loggerService.error('Unexpected error in profile connections cron job:', error as Error);
      }
    }
  }

  stop(): void {
    this.cronService.stopJob('daily-profile-connections');
  }
}