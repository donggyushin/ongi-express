import { QnA } from './qna.entity';

export enum MBTIType {
  INTJ = 'INTJ',
  INTP = 'INTP',
  ENTJ = 'ENTJ',
  ENTP = 'ENTP',
  INFJ = 'INFJ',
  INFP = 'INFP',
  ENFJ = 'ENFJ',
  ENFP = 'ENFP',
  ISTJ = 'ISTJ',
  ISFJ = 'ISFJ',
  ESTJ = 'ESTJ',
  ESFJ = 'ESFJ',
  ISTP = 'ISTP',
  ISFP = 'ISFP',
  ESTP = 'ESTP',
  ESFP = 'ESFP'
}

export class Profile {
  constructor(
    public readonly id: string,
    public readonly accountId: string,
    public readonly nickname: string,
    public readonly profileImage: string | null = null,
    public readonly images: string[] = [],
    public readonly mbti: MBTIType | null = null,
    public readonly qnas: QnA[] = [],
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  toJSON() {
    return {
      id: this.id,
      accountId: this.accountId,
      nickname: this.nickname,
      profileImage: this.profileImage,
      images: this.images,
      mbti: this.mbti,
      qnas: this.qnas.map(qna => qna.toJSON()),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }
}