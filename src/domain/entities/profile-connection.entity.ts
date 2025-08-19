import { ConnectedProfile } from './connected-profile.entity';

export class ProfileConnection {
  constructor(
    public readonly id: string,
    public readonly myProfileId: string,
    public readonly otherProfiles: ConnectedProfile[] = [],
    public readonly profileIDsILike: string[] = [],
    public readonly profileIDsLikeMe: string[] = [],
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  addConnection(profileId: string): ProfileConnection {
    if (this.hasConnection(profileId)) {
      return this;
    }
    
    const newConnection = new ConnectedProfile(profileId);
    
    return new ProfileConnection(
      this.id,
      this.myProfileId,
      [...this.otherProfiles, newConnection],
      this.profileIDsILike,
      this.profileIDsLikeMe,
      this.createdAt,
      new Date()
    );
  }

  removeConnection(profileId: string): ProfileConnection {
    const updatedProfiles = this.otherProfiles.filter(cp => cp.profileId !== profileId);
    
    return new ProfileConnection(
      this.id,
      this.myProfileId,
      updatedProfiles,
      this.profileIDsILike,
      this.profileIDsLikeMe,
      this.createdAt,
      new Date()
    );
  }

  markConnectionAsViewed(profileId: string): ProfileConnection {
    const updatedProfiles = this.otherProfiles.map(cp => 
      cp.profileId === profileId ? cp.markAsViewed() : cp
    );
    
    return new ProfileConnection(
      this.id,
      this.myProfileId,
      updatedProfiles,
      this.profileIDsILike,
      this.profileIDsLikeMe,
      this.createdAt,
      new Date()
    );
  }

  hasConnection(profileId: string): boolean {
    return this.otherProfiles.some(cp => cp.profileId === profileId);
  }

  get connectionCount(): number {
    return this.otherProfiles.length;
  }

  get newConnectionCount(): number {
    return this.otherProfiles.filter(cp => cp.isNew).length;
  }

  get connectedProfileIds(): string[] {
    return this.otherProfiles.map(cp => cp.profileId);
  }

  toJSON() {
    return {
      id: this.id,
      myProfileId: this.myProfileId,
      otherProfiles: this.otherProfiles.map(cp => cp.toJSON()),
      profileIDsILike: this.profileIDsILike,
      profileIDsLikeMe: this.profileIDsLikeMe,
      connectionCount: this.connectionCount,
      newConnectionCount: this.newConnectionCount,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }
}