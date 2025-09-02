export class PasswordReset {
  constructor(
    public readonly id: string,
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
      email: this.email,
      code: this.code,
      expiresAt: this.expiresAt.toISOString(),
      isUsed: this.isUsed,
      createdAt: this.createdAt.toISOString()
    };
  }
}