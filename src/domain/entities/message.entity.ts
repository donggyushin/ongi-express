export class Message {
  constructor(
    public readonly id: string,
    public readonly writerProfileId: string,
    public readonly text: string,
    public readonly messageType?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  toJSON() {
    return {
      id: this.id,
      writerProfileId: this.writerProfileId,
      text: this.text,
      messageType: this.messageType,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }
}