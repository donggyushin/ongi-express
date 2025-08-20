export class MessageReadInfo {
  constructor(
    public readonly id: string,
    public readonly profileId: string,
    public readonly dateInfoUserViewedRecently: Date
  ) {}

  toJSON() {
    return {
      id: this.id,
      profileId: this.profileId,
      dateInfoUserViewedRecently: this.dateInfoUserViewedRecently.toISOString()
    };
  }
}