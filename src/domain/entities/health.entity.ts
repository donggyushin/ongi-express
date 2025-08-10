export class HealthStatus {
  constructor(
    public readonly status: string,
    public readonly uptime: number,
    public readonly timestamp: Date = new Date()
  ) {}

  toJSON() {
    return {
      status: this.status,
      uptime: this.uptime,
      timestamp: this.timestamp.toISOString()
    };
  }
}