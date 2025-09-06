import { ProfileConnection, Profile, NotificationType } from '@/domain/entities';
import { IProfileConnectionRepository, IProfileRepository, IReportRepository, INotificationRepository } from '@/domain/repositories';
import { IFirebaseService } from '@/domain/services/IFirebaseService';

export interface IProfileConnectionUseCase {
  addRandomConnection(profileId: string): Promise<{ connection: ProfileConnection; addedProfile: Profile | null }>;
  getConnectedProfiles(accountId: string, limit?: number): Promise<{
    profiles: (Profile & {
      isNew: boolean;
      reportStatus: {
        isReported: boolean;
        theyReported: boolean;
      };
    })[];
    newProfileIds: string[];
    profileConnection: ProfileConnection | null;
  }>;
  markConnectionAsViewed(accountId: string, otherProfileId: string): Promise<ProfileConnection>;
  generateConnectionsForRecentlyActiveProfiles(): Promise<{ processed: number; connectionsCreated: number }>;
  likeProfile(likerAccountId: string, likedProfileId: string): Promise<void>;
  unlikeProfile(likerAccountId: string, likedProfileId: string): Promise<void>;
  getProfilesThatLikedMe(accountId: string, limit?: number): Promise<Profile[]>;
}

export class ProfileConnectionUseCase implements IProfileConnectionUseCase {
  constructor(
    private profileConnectionRepository: IProfileConnectionRepository,
    private profileRepository: IProfileRepository,
    private firebaseService: IFirebaseService,
    private reportRepository: IReportRepository,
    private notificationRepository: INotificationRepository
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

  async getConnectedProfiles(accountId: string, limit?: number): Promise<{
    profiles: (Profile & {
      isNew: boolean;
      reportStatus: {
        isReported: boolean;
        theyReported: boolean;
      };
    })[];
    newProfileIds: string[];
    profileConnection: ProfileConnection | null;
  }> {
    // accountId로 프로필 조회
    const currentProfile = await this.profileRepository.findByAccountId(accountId);
    if (!currentProfile) {
      throw new Error('Profile not found');
    }

    const result = await this.profileConnectionRepository.getConnectedProfiles(currentProfile.id, limit);
    const profileConnection = await this.profileConnectionRepository.findByProfileId(currentProfile.id);

    // Get report statuses for all connected profiles
    const otherProfileIds = result.profiles.map(profile => profile.id);
    const reportStatuses = await this.reportRepository.getMultipleReportStatuses(
      currentProfile.id,
      otherProfileIds
    );

    // Combine profiles with report status
    const profilesWithReportStatus = result.profiles.map(profile => {
      const profileWithReportStatus = Object.assign(profile, {
        reportStatus: reportStatuses[profile.id] || {
          isReported: false,
          theyReported: false
        }
      });
      return profileWithReportStatus;
    });

    return {
      profiles: profilesWithReportStatus,
      newProfileIds: result.newProfileIds,
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

          // 새로운 연결이 생성된 경우 데이터베이스 알림 생성
          try {
            await this.notificationRepository.create({
              recipientId: profile.id,
              type: NotificationType.NEW_CONNECTION,
              title: '새로운 인연이 생겼어요! 💕',
              message: '새로운 프로필과 연결되었습니다. 지금 확인해보세요!',
              isRead: false,
              data: {
                connectedProfileId: result.addedProfile.id,
                type: 'match'
              },
              urlScheme: 'ongi://'
            });
          } catch (error) {
            console.error(`Failed to create notification for profile ${profile.id}:`, error);
          }

          // 새로운 연결이 생성된 경우 해당 프로필에게 푸시 알림 전송
          if (profile.fcmToken) {
            try {
              await this.firebaseService.sendToDevice(
                profile.fcmToken,
                '새로운 인연이 생겼어요! 💕',
                `새로운 프로필과 연결되었습니다. 지금 확인해보세요!`,
                {
                  type: 'match',
                  url_scheme: 'ongi://'
                }
              );
            } catch (error) {
              // Push notification 실패는 연결 생성 자체를 실패시키지 않음
              console.error(`Failed to send push notification to profile ${profile.id}:`, error);
            }
          }
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

    // 4. 중복 좋아요 체크 - 이미 좋아요했는지 확인
    const likerConnection = await this.profileConnectionRepository.findByProfileId(likerProfile.id);
    if (likerConnection && likerConnection.profileIDsILike.includes(likedProfileId)) {
      // 이미 좋아요한 경우 - 아무 작업도 하지 않고 조용히 성공 처리
      return;
    }

    // 5. 좋아요 추가
    await this.profileConnectionRepository.addLike(likerProfile.id, likedProfileId);

    // 6. 좋아요 받은 사람에게 데이터베이스 알림 생성
    try {
      await this.notificationRepository.create({
        recipientId: likedProfile.id,
        type: NotificationType.NEW_CONNECTION,
        title: '새로운 좋아요 💖',
        message: `${likerProfile.nickname}님이 당신을 좋아합니다!`,
        isRead: false,
        data: {
          likerProfileId: likerProfile.id,
          likerNickname: likerProfile.nickname,
          type: 'like'
        },
        urlScheme: 'ongi://profiles/like'
      });
    } catch (error) {
      console.error('Failed to create notification for like:', error);
    }

    // 7. Push notification 전송 (FCM 토큰이 있는 경우)
    if (likedProfile.fcmToken) {
      try {
        await this.firebaseService.sendToDevice(
          likedProfile.fcmToken,
          '새로운 좋아요 💖',
          `${likerProfile.nickname}님이 당신을 좋아합니다!`,
          {
            type: 'like',
            url_scheme: 'ongi://profiles/like'
          }
        );
      } catch (error) {
        // Push notification 실패는 좋아요 기능 자체를 실패시키지 않음
        console.error('Failed to send push notification for like:', error);
      }
    }
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

  async getProfilesThatLikedMe(accountId: string, limit: number = 100): Promise<Profile[]> {
    // 1. accountId로 프로필 조회
    const currentProfile = await this.profileRepository.findByAccountId(accountId);
    if (!currentProfile) {
      throw new Error('Profile not found');
    }

    // 2. ProfileConnection 조회
    const connection = await this.profileConnectionRepository.findByProfileId(currentProfile.id);
    if (!connection || connection.profileIDsLikeMe.length === 0) {
      return [];
    }

    // 3. profileIDsLikeMe를 역순으로 정렬하고 최대 limit개까지 제한
    const likerProfileIds = connection.profileIDsLikeMe
      .slice()
      .reverse()
      .slice(0, Math.min(limit, 100));

    // 4. 배치로 프로필들 조회 (N개 쿼리 → 1개 쿼리로 최적화)
    const profiles = await this.profileRepository.findByIds(likerProfileIds);

    return profiles;
  }
}