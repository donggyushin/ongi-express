export class ConnectedProfile {
  constructor(
    public readonly profileId: string,
    public readonly addedAt: Date = new Date(),
    public readonly isNew: boolean = true
  ) {}

  markAsViewed(): ConnectedProfile {
    return new ConnectedProfile(
      this.profileId,
      this.addedAt,
      false
    );
  }

  toJSON() {
    return {
      profileId: this.profileId,
      addedAt: this.addedAt.toISOString(),
      isNew: this.isNew
    };
  }
}