export class ProfileConnection {
  constructor(
    public readonly id: string,
    public readonly myProfileId: string,
    public readonly othersProfileIds: string[] = [],
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  addConnection(profileId: string): ProfileConnection {
    if (this.othersProfileIds.includes(profileId)) {
      return this;
    }
    
    return new ProfileConnection(
      this.id,
      this.myProfileId,
      [...this.othersProfileIds, profileId],
      this.createdAt,
      new Date()
    );
  }

  removeConnection(profileId: string): ProfileConnection {
    const updatedIds = this.othersProfileIds.filter(id => id !== profileId);
    
    return new ProfileConnection(
      this.id,
      this.myProfileId,
      updatedIds,
      this.createdAt,
      new Date()
    );
  }

  hasConnection(profileId: string): boolean {
    return this.othersProfileIds.includes(profileId);
  }

  get connectionCount(): number {
    return this.othersProfileIds.length;
  }

  toJSON() {
    return {
      id: this.id,
      myProfileId: this.myProfileId,
      othersProfileIds: this.othersProfileIds,
      connectionCount: this.connectionCount,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }
}