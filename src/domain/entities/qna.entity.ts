export class QnA {
  constructor(
    public readonly id: string,
    public readonly question: string,
    public readonly answer: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  toJSON() {
    return {
      id: this.id,
      question: this.question,
      answer: this.answer,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }
}