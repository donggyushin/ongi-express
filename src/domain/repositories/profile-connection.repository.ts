import { ProfileConnection, Profile } from '../entities';

export interface IProfileConnectionRepository {
  findByProfileId(myProfileId: string): Promise<ProfileConnection | null>;
  create(myProfileId: string): Promise<ProfileConnection>;
  addConnection(myProfileId: string, otherProfileId: string): Promise<ProfileConnection>;
  removeConnection(myProfileId: string, otherProfileId: string): Promise<ProfileConnection>;
  markConnectionAsViewed(myProfileId: string, otherProfileId: string): Promise<ProfileConnection>;
  updateConnections(myProfileId: string, othersProfileIds: string[]): Promise<ProfileConnection>;
  getConnectedProfiles(myProfileId: string, limit?: number): Promise<{ profiles: Profile[]; newProfileIds: string[] }>;
  delete(myProfileId: string): Promise<void>;
}