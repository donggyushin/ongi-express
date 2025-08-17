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

export enum BodyType {
  SLIM = 'SLIM',
  NORMAL = 'NORMAL',
  CHUBBY = 'CHUBBY',
  LARGE = 'LARGE'
}

export class Profile {
  constructor(
    public readonly id: string,
    public readonly accountId: string,
    public readonly nickname: string,
    public readonly email: string | null = null,
    public readonly introduction: string | null = null,
    public readonly profileImage: Image | null = null,
    public readonly images: Image[] = [],
    public readonly mbti: MBTIType | null = null,
    public readonly gender: GenderType | null = null,
    public readonly height: number | null = null,
    public readonly weight: number | null = null,
    public readonly lastTokenAuthAt: Date | null = null,
    public readonly qnas: QnA[] = [],
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  private calculateBMI(): number | null {
    if (!this.height || !this.weight) {
      return null;
    }
    // BMI = weight(kg) / (height(m))^2
    const heightInMeters = this.height / 100;
    return this.weight / (heightInMeters * heightInMeters);
  }

  get bodyType(): BodyType | null {
    const bmi = this.calculateBMI();
    
    if (bmi === null) {
      return null;
    }

    if (bmi < 18.5) {
      return BodyType.SLIM;
    } else if (bmi < 25) {
      return BodyType.NORMAL;
    } else if (bmi < 30) {
      return BodyType.CHUBBY;
    } else {
      return BodyType.LARGE;
    }
  }

  toJSON() {
    return {
      id: this.id,
      accountId: this.accountId,
      nickname: this.nickname,
      email: this.email,
      introduction: this.introduction,
      profileImage: this.profileImage?.toJSON() ?? null,
      images: this.images.map(image => image.toJSON()),
      mbti: this.mbti,
      gender: this.gender,
      height: this.height,
      weight: this.weight,
      lastTokenAuthAt: this.lastTokenAuthAt?.toISOString() ?? null,
      bodyType: this.bodyType,
      qnas: this.qnas.map(qna => qna.toJSON()),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }
}