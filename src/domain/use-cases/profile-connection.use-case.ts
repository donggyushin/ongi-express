import { ProfileConnection, Profile } from '@/domain/entities';
import { IProfileConnectionRepository, IProfileRepository } from '@/domain/repositories';

export interface IProfileConnectionUseCase {
  addRandomConnection(profileId: string): Promise<{ connection: ProfileConnection; addedProfile: Profile | null }>;
  getConnectedProfiles(accountId: string, limit?: number): Promise<{ profiles: Profile[]; newProfileIds: string[]; profileConnection: ProfileConnection | null }>;
  markConnectionAsViewed(accountId: string, otherProfileId: string): Promise<ProfileConnection>;
  generateConnectionsForRecentlyActiveProfiles(): Promise<{ processed: number; connectionsCreated: number }>;
  likeProfile(likerAccountId: string, likedProfileId: string): Promise<void>;
  unlikeProfile(likerAccountId: string, likedProfileId: string): Promise<void>;
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

    // 2. 현재 프로필이 매칭 조건을 만족하는지 확인
    if (!currentProfile.isCompleteForMatching()) {
      throw new Error('Current profile is not complete for matching. Required: profileImage, mbti, qnas, gender, height, weight, introduction');
    }

    // 3. ProfileConnection 조회 또는 생성
    let connection = await this.profileConnectionRepository.findByProfileId(profileId);
    if (!connection) {
      connection = await this.profileConnectionRepository.create(profileId);
    }

    // 4. 현재 프로필의 성별과 다르고, 이미 연결되지 않은 완성된 프로필 조회
    const currentGender = currentProfile.gender;
    if (!currentGender) {
      throw new Error('Current profile must have gender set');
    }

    const excludeProfileIds = [...connection.connectedProfileIds, profileId]; // 자기 자신도 제외
    const randomProfile = await this.profileRepository.findRandomCompleteProfileByGender(
      currentGender,
      excludeProfileIds
    );

    if (!randomProfile) {
      // 조건에 맞는 프로필이 없으면 현재 connection 반환
      return { connection, addedProfile: null };
    }

    // 5. 찾은 프로필을 connection에 추가
    const updatedConnection = await this.profileConnectionRepository.addConnection(
      profileId,
      randomProfile.id
    );

    return { connection: updatedConnection, addedProfile: randomProfile };
  }

  async getConnectedProfiles(accountId: string, limit?: number): Promise<{ profiles: Profile[]; newProfileIds: string[]; profileConnection: ProfileConnection | null }> {
    // accountId로 프로필 조회
    const currentProfile = await this.profileRepository.findByAccountId(accountId);
    if (!currentProfile) {
      throw new Error('Profile not found');
    }

    const result = await this.profileConnectionRepository.getConnectedProfiles(currentProfile.id, limit);
    const profileConnection = await this.profileConnectionRepository.findByProfileId(currentProfile.id);

    return {
      ...result,
      profileConnection
    };
  }

  async markConnectionAsViewed(accountId: string, otherProfileId: string): Promise<ProfileConnection> {
    // accountId로 프로필 조회
    const currentProfile = await this.profileRepository.findByAccountId(accountId);
    if (!currentProfile) {
      throw new Error('Profile not found');
    }

    return await this.profileConnectionRepository.markConnectionAsViewed(currentProfile.id, otherProfileId);
  }

  async generateConnectionsForRecentlyActiveProfiles(): Promise<{ processed: number; connectionsCreated: number }> {
    // 최근 한 달(30일) 이내에 활동한 프로필들 조회
    const recentlyActiveProfiles = await this.profileRepository.findRecentlyActiveProfiles(30);
    
    let processed = 0;
    let connectionsCreated = 0;

    // 각 프로필에 대해 랜덤 연결 시도
    for (const profile of recentlyActiveProfiles) {
      try {
        const result = await this.addRandomConnection(profile.id);
        processed++;
        
        if (result.addedProfile) {
          connectionsCreated++;
        }
      } catch (error) {
        // 에러가 발생해도 계속 진행 (예: 성별 미설정, 연결할 프로필 없음 등)
        console.error(`Failed to create connection for profile ${profile.id}:`, error);
        processed++;
      }
    }

    return { processed, connectionsCreated };
  }

  async likeProfile(likerAccountId: string, likedProfileId: string): Promise<void> {
    // 1. likerAccountId로 프로필 조회
    const likerProfile = await this.profileRepository.findByAccountId(likerAccountId);
    if (!likerProfile) {
      throw new Error('Liker profile not found');
    }

    // 2. likedProfileId로 프로필 조회 (존재 확인)
    const likedProfile = await this.profileRepository.findById(likedProfileId);
    if (!likedProfile) {
      throw new Error('Liked profile not found');
    }

    // 3. 자기 자신을 좋아요할 수 없음
    if (likerProfile.id === likedProfileId) {
      throw new Error('Cannot like your own profile');
    }

    // 4. 좋아요 추가
    await this.profileConnectionRepository.addLike(likerProfile.id, likedProfileId);
  }

  async unlikeProfile(likerAccountId: string, likedProfileId: string): Promise<void> {
    // 1. likerAccountId로 프로필 조회
    const likerProfile = await this.profileRepository.findByAccountId(likerAccountId);
    if (!likerProfile) {
      throw new Error('Liker profile not found');
    }

    // 2. likedProfileId로 프로필 조회 (존재 확인)
    const likedProfile = await this.profileRepository.findById(likedProfileId);
    if (!likedProfile) {
      throw new Error('Liked profile not found');
    }

    // 3. 좋아요 취소
    await this.profileConnectionRepository.removeLike(likerProfile.id, likedProfileId);
  }
}