export class Report {
  constructor(
    public readonly id: string,
    public readonly reporterId: string,
    public readonly reportedId: string,
    public readonly content: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  toJSON() {
    return {
      id: this.id,
      reporterId: this.reporterId,
      reportedId: this.reportedId,
      content: this.content,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }
}