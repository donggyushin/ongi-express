export class AuthTokens {
  constructor(
    public readonly accessToken: string,
    public readonly refreshToken: string
  ) {}

  toJSON() {
    return {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken
    };
  }
}