export interface ICronService {
  scheduleJob(name: string, schedule: string, callback: () => void | Promise<void>): void;
  stopJob(name: string): void;
  stopAllJobs(): void;
  getActiveJobs(): string[];
}