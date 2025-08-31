import * as cron from 'node-cron';
import { ICronService } from '@/domain/services/cron.service.interface';
import { ILoggerService } from '@/infrastructure/services/logger.service';

export class CronService implements ICronService {
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  constructor(private loggerService: ILoggerService) {}

  scheduleJob(name: string, schedule: string, callback: () => void | Promise<void>): void {
    if (this.jobs.has(name)) {
      this.loggerService.warn(`Cron job '${name}' already exists. Stopping previous job.`);
      this.stopJob(name);
    }

    const task = cron.schedule(schedule, async () => {
      try {
        this.loggerService.info(`Running cron job: ${name}`);
        await callback();
        this.loggerService.info(`Completed cron job: ${name}`);
      } catch (error) {
        this.loggerService.error(`Error in cron job '${name}':`, error as Error);
      }
    }, {
      timezone: 'Asia/Seoul'
    });

    this.jobs.set(name, task);
    task.start();
    this.loggerService.info(`Scheduled cron job '${name}' with schedule: ${schedule}`);
  }

  stopJob(name: string): void {
    const task = this.jobs.get(name);
    if (task) {
      task.stop();
      this.jobs.delete(name);
      this.loggerService.info(`Stopped cron job: ${name}`);
    }
  }

  stopAllJobs(): void {
    this.jobs.forEach((task, name) => {
      task.stop();
      this.loggerService.info(`Stopped cron job: ${name}`);
    });
    this.jobs.clear();
  }

  getActiveJobs(): string[] {
    return Array.from(this.jobs.keys());
  }
}