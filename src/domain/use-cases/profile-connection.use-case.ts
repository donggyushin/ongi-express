import { ProfileConnection, Profile } from '@/domain/entities';
import { IProfileConnectionRepository, IProfileRepository } from '@/domain/repositories';

export interface IProfileConnectionUseCase {
  addRandomConnection(accountId: string): Promise<{ connection: ProfileConnection; addedProfile: Profile | null }>;
  getConnectedProfiles(accountId: string, limit?: number): Promise<Profile[]>;
}

export class ProfileConnectionUseCase implements IProfileConnectionUseCase {
  constructor(
    private profileConnectionRepository: IProfileConnectionRepository,
    private profileRepository: IProfileRepository
  ) {}

  async addRandomConnection(profileId: string): Promise<{ connection: ProfileConnection; addedProfile: Profile | null }> {
    // 1. 현재 프로필 조회 (성별 확인을 위해)
    const currentProfile = await this.profileRepository.findById(profileId);
    if (!currentProfile) {
      throw new Error('Profile not found');
    }

    // 2. ProfileConnection 조회 또는 생성
    let connection = await this.profileConnectionRepository.findByProfileId(profileId);
    if (!connection) {
      connection = await this.profileConnectionRepository.create(profileId);
    }

    // 3. 현재 프로필의 성별과 다르고, 이미 연결되지 않은 프로필 조회
    const currentGender = currentProfile.gender;
    if (!currentGender) {
      throw new Error('Current profile must have gender set');
    }

    const excludeProfileIds = [...connection.connectedProfileIds, profileId]; // 자기 자신도 제외
    const randomProfile = await this.profileRepository.findRandomProfileByGender(
      currentGender,
      excludeProfileIds
    );

    if (!randomProfile) {
      // 조건에 맞는 프로필이 없으면 현재 connection 반환
      return { connection, addedProfile: null };
    }

    // 4. 찾은 프로필을 connection에 추가
    const updatedConnection = await this.profileConnectionRepository.addConnection(
      profileId,
      randomProfile.id
    );

    return { connection: updatedConnection, addedProfile: randomProfile };
  }

  async getConnectedProfiles(profileId: string, limit?: number): Promise<Profile[]> {
    return await this.profileConnectionRepository.getConnectedProfiles(profileId, limit);
  }
}