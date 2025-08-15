export class EmailVerification {
  constructor(
    public readonly id: string,
    public readonly accountId: string,
    public readonly email: string,
    public readonly code: string,
    public readonly expiresAt: Date,
    public readonly isUsed: boolean = false,
    public readonly createdAt: Date = new Date()
  ) {}

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isValid(): boolean {
    return !this.isUsed && !this.isExpired();
  }

  toJSON() {
    return {
      id: this.id,
      accountId: this.accountId,
      email: this.email,
      expiresAt: this.expiresAt.toISOString(),
      isUsed: this.isUsed,
      createdAt: this.createdAt.toISOString()
    };
  }
}