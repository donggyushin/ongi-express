export class WelcomeMessage {
  constructor(
    public readonly message: string,
    public readonly status: string,
    public readonly timestamp: Date = new Date()
  ) {}

  toJSON() {
    return {
      message: this.message,
      status: this.status,
      timestamp: this.timestamp.toISOString()
    };
  }
}