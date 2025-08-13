export enum AccountType {
  EMAIL = 'email',
  APPLE = 'apple',
  KAKAO = 'kakao',
  GMAIL = 'gmail'
}

export class Account {
  constructor(
    public readonly id: string,
    public readonly type: AccountType,
    public readonly createdAt: Date = new Date()
  ) {}

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      createdAt: this.createdAt.toISOString()
    };
  }
}