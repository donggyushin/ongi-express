import { QnA } from './qna.entity';
import { Image } from './image.entity';

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

export enum GenderType {
  MALE = 'MALE',
  FEMALE = 'FEMALE'
}

export class Profile {
  constructor(
    public readonly id: string,
    public readonly accountId: string,
    public readonly nickname: string,
    public readonly email: string | null = null,
    public readonly profileImage: Image | null = null,
    public readonly images: Image[] = [],
    public readonly mbti: MBTIType | null = null,
    public readonly gender: GenderType | null = null,
    public readonly height: number | null = null,
    public readonly weight: number | null = null,
    public readonly qnas: QnA[] = [],
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  toJSON() {
    return {
      id: this.id,
      accountId: this.accountId,
      nickname: this.nickname,
      email: this.email,
      profileImage: this.profileImage?.toJSON() ?? null,
      images: this.images.map(image => image.toJSON()),
      mbti: this.mbti,
      gender: this.gender,
      height: this.height,
      weight: this.weight,
      qnas: this.qnas.map(qna => qna.toJSON()),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }
}