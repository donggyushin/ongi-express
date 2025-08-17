import { ProfileConnection } from '../entities';

export interface IProfileConnectionRepository {
  findByProfileId(myProfileId: string): Promise<ProfileConnection | null>;
  create(myProfileId: string): Promise<ProfileConnection>;
  addConnection(myProfileId: string, otherProfileId: string): Promise<ProfileConnection>;
  removeConnection(myProfileId: string, otherProfileId: string): Promise<ProfileConnection>;
  updateConnections(myProfileId: string, othersProfileIds: string[]): Promise<ProfileConnection>;
  delete(myProfileId: string): Promise<void>;
}