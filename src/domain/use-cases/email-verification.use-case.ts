import { IEmailVerificationRepository, IProfileRepository } from '../repositories';
import { EmailVerification, Profile } from '../entities';

export interface IEmailVerificationUseCase {
  sendVerificationCode(accountId: string, email: string): Promise<void>;
  verifyEmailAndUpdateProfile(accountId: string, code: string): Promise<Profile>;
}

export class EmailVerificationUseCase implements IEmailVerificationUseCase {
  constructor(
    private emailVerificationRepository: IEmailVerificationRepository,
    private profileRepository: IProfileRepository,
    private emailService: any // IEmailService 타입은 나중에 정의
  ) {}

  async sendVerificationCode(accountId: string, email: string): Promise<void> {
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // 프로필 존재 확인
    const profile = await this.profileRepository.findByAccountId(accountId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    // 6자리 랜덤 인증 코드 생성
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 만료 시간 설정 (5분 후)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    // 인증 코드 저장
    await this.emailVerificationRepository.create(accountId, email, code, expiresAt);

    // 이메일 발송
    await this.emailService.sendVerificationEmail(email, code);
  }

  async verifyEmailAndUpdateProfile(accountId: string, code: string): Promise<Profile> {
    // 인증 코드 검증
    if (!code || code.length !== 6) {
      throw new Error('Invalid verification code format');
    }

    // 프로필 존재 확인
    const profile = await this.profileRepository.findByAccountId(accountId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    // 인증 코드 조회
    const verification = await this.emailVerificationRepository.findByAccountIdAndCode(accountId, code);
    if (!verification) {
      throw new Error('Invalid verification code');
    }

    // 인증 코드 유효성 검사
    if (!verification.isValid()) {
      throw new Error('Verification code is expired or already used');
    }

    // 인증 코드를 사용됨으로 표시
    await this.emailVerificationRepository.markAsUsed(verification.id);

    // 프로필의 이메일 업데이트
    const updatedProfile = await this.profileRepository.update(profile.id, {
      email: verification.email
    });

    return updatedProfile;
  }
}