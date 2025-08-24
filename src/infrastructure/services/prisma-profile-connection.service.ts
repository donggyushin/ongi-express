import { PrismaClient } from '../../generated/prisma';
import { IProfileConnectionRepository } from '@/domain/repositories';
import { ProfileConnection, ConnectedProfile, Profile, Image, QnA, Location } from '@/domain/entities';

export class PrismaProfileConnectionService implements IProfileConnectionRepository {
  constructor(private prisma: PrismaClient) {}

  async findByProfileId(myProfileId: string): Promise<ProfileConnection | null> {
    const connection = await this.prisma.profileConnection.findUnique({
      where: { myProfileId },
      include: {
        connectedProfiles: true
      }
    });

    return connection ? this.mapToEntity(connection) : null;
  }

  async create(myProfileId: string): Promise<ProfileConnection> {
    const connection = await this.prisma.profileConnection.create({
      data: {
        myProfileId
      },
      include: {
        connectedProfiles: true
      }
    });

    return this.mapToEntity(connection);
  }

  async addConnection(myProfileId: string, otherProfileId: string): Promise<ProfileConnection> {
    const existing = await this.prisma.profileConnection.findUnique({
      where: { myProfileId },
      include: {
        connectedProfiles: true
      }
    });

    if (!existing) {
      // Create new ProfileConnection with the connected profile
      const connection = await this.prisma.profileConnection.create({
        data: {
          myProfileId,
          connectedProfiles: {
            create: {
              profileId: otherProfileId,
              addedAt: new Date(),
              isNew: true
            }
          }
        },
        include: {
          connectedProfiles: true
        }
      });
      return this.mapToEntity(connection);
    }

    // Check if connection already exists
    const alreadyConnected = existing.connectedProfiles.some(cp => cp.profileId === otherProfileId);
    if (alreadyConnected) {
      return this.mapToEntity(existing);
    }

    // Add new connected profile
    await this.prisma.connectedProfile.create({
      data: {
        profileConnectionId: existing.id,
        profileId: otherProfileId,
        addedAt: new Date(),
        isNew: true
      }
    });

    // Fetch updated connection
    const updatedConnection = await this.prisma.profileConnection.findUnique({
      where: { myProfileId },
      include: {
        connectedProfiles: true
      }
    });

    return this.mapToEntity(updatedConnection!);
  }

  async removeConnection(myProfileId: string, otherProfileId: string): Promise<ProfileConnection> {
    const connection = await this.prisma.profileConnection.findUnique({
      where: { myProfileId },
      include: {
        connectedProfiles: true
      }
    });

    if (!connection) {
      throw new Error('Profile connection not found');
    }

    // Delete the specific connected profile
    await this.prisma.connectedProfile.deleteMany({
      where: {
        profileConnectionId: connection.id,
        profileId: otherProfileId
      }
    });

    // Fetch updated connection
    const updatedConnection = await this.prisma.profileConnection.findUnique({
      where: { myProfileId },
      include: {
        connectedProfiles: true
      }
    });

    return this.mapToEntity(updatedConnection!);
  }

  async markConnectionAsViewed(myProfileId: string, otherProfileId: string): Promise<ProfileConnection> {
    const connection = await this.prisma.profileConnection.findUnique({
      where: { myProfileId },
      include: {
        connectedProfiles: true
      }
    });

    if (!connection) {
      throw new Error('Profile connection not found');
    }

    // Update the specific connected profile's isNew to false
    await this.prisma.connectedProfile.updateMany({
      where: {
        profileConnectionId: connection.id,
        profileId: otherProfileId
      },
      data: {
        isNew: false
      }
    });

    // Fetch updated connection
    const updatedConnection = await this.prisma.profileConnection.findUnique({
      where: { myProfileId },
      include: {
        connectedProfiles: true
      }
    });

    return this.mapToEntity(updatedConnection!);
  }

  async updateConnections(myProfileId: string, othersProfileIds: string[]): Promise<ProfileConnection> {
    const connection = await this.prisma.profileConnection.upsert({
      where: { myProfileId },
      update: {},
      create: {
        myProfileId
      },
      include: {
        connectedProfiles: true
      }
    });

    // Delete all existing connected profiles
    await this.prisma.connectedProfile.deleteMany({
      where: {
        profileConnectionId: connection.id
      }
    });

    // Create new connected profiles
    if (othersProfileIds.length > 0) {
      await this.prisma.connectedProfile.createMany({
        data: othersProfileIds.map(profileId => ({
          profileConnectionId: connection.id,
          profileId,
          addedAt: new Date(),
          isNew: true
        }))
      });
    }

    // Fetch updated connection
    const updatedConnection = await this.prisma.profileConnection.findUnique({
      where: { myProfileId },
      include: {
        connectedProfiles: true
      }
    });

    return this.mapToEntity(updatedConnection!);
  }

  async getConnectedProfiles(myProfileId: string, limit: number = 100): Promise<{ profiles: (Profile & { isNew: boolean })[]; newProfileIds: string[] }> {
    const connection = await this.prisma.profileConnection.findUnique({
      where: { myProfileId },
      include: {
        connectedProfiles: {
          include: {
            profile: {
              include: {
                qnas: true,
                profileImage: true,
                images: true,
                location: true
              }
            }
          },
          orderBy: {
            addedAt: 'desc'
          },
          take: Math.min(limit, 100) // 최대 100개로 제한
        }
      }
    });

    if (!connection) {
      return { profiles: [], newProfileIds: [] };
    }

    // 프로필이 존재하는 연결들만 필터링
    const validConnectedProfiles = connection.connectedProfiles.filter(cp => cp.profile !== null);

    const profiles = validConnectedProfiles.map(cp => {
      const profile = this.mapProfileToEntity(cp.profile);
      return Object.assign(profile, { isNew: cp.isNew });
    });
    const newProfileIds = validConnectedProfiles
      .filter(cp => cp.isNew)
      .map(cp => cp.profileId);

    return { profiles, newProfileIds };
  }

  async delete(myProfileId: string): Promise<void> {
    await this.prisma.profileConnection.delete({
      where: { myProfileId }
    });
  }

  async addLike(likerProfileId: string, likedProfileId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // 1. 좋아요 하는 사람의 ProfileConnection 생성/업데이트
      const likerConnection = await tx.profileConnection.upsert({
        where: { myProfileId: likerProfileId },
        create: {
          myProfileId: likerProfileId,
          profileIDsILike: [likedProfileId],
          profileIDsLikeMe: []
        },
        update: {
          profileIDsILike: {
            push: likedProfileId
          }
        }
      });

      // 2. 좋아요 받는 사람의 ProfileConnection 생성/업데이트
      await tx.profileConnection.upsert({
        where: { myProfileId: likedProfileId },
        create: {
          myProfileId: likedProfileId,
          profileIDsILike: [],
          profileIDsLikeMe: [likerProfileId]
        },
        update: {
          profileIDsLikeMe: {
            push: likerProfileId
          }
        }
      });
    });
  }

  async removeLike(likerProfileId: string, likedProfileId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // 1. 좋아요 하는 사람의 ProfileConnection에서 제거
      const likerConnection = await tx.profileConnection.findUnique({
        where: { myProfileId: likerProfileId }
      });

      if (likerConnection && likerConnection.profileIDsILike.includes(likedProfileId)) {
        await tx.profileConnection.update({
          where: { myProfileId: likerProfileId },
          data: {
            profileIDsILike: likerConnection.profileIDsILike.filter(id => id !== likedProfileId)
          }
        });
      }

      // 2. 좋아요 받는 사람의 ProfileConnection에서 제거
      const likedConnection = await tx.profileConnection.findUnique({
        where: { myProfileId: likedProfileId }
      });

      if (likedConnection && likedConnection.profileIDsLikeMe.includes(likerProfileId)) {
        await tx.profileConnection.update({
          where: { myProfileId: likedProfileId },
          data: {
            profileIDsLikeMe: likedConnection.profileIDsLikeMe.filter(id => id !== likerProfileId)
          }
        });
      }
    });
  }

  private mapToEntity(connection: any): ProfileConnection {
    const connectedProfiles = connection.connectedProfiles?.map((cp: any) => 
      new ConnectedProfile(
        cp.profileId,
        cp.addedAt,
        cp.isNew
      )
    ) || [];

    return new ProfileConnection(
      connection.id,
      connection.myProfileId,
      connectedProfiles,
      connection.profileIDsILike || [],
      connection.profileIDsLikeMe || [],
      connection.createdAt,
      connection.updatedAt
    );
  }

  private mapProfileToEntity(profile: any): Profile {
    return new Profile(
      profile.id,
      profile.accountId,
      profile.nickname,
      profile.email,
      profile.introduction,
      profile.profileImage ? new Image(profile.profileImage.url, profile.profileImage.publicId) : null,
      profile.images.map((img: any) => new Image(img.url, img.publicId)),
      profile.mbti as any,
      profile.gender as any,
      profile.height,
      profile.weight,
      profile.location ? new Location(
        profile.location.id,
        profile.location.latitude,
        profile.location.longitude,
        profile.location.createdAt,
        profile.location.updatedAt
      ) : null,
      profile.lastTokenAuthAt,
      profile.fcmToken,
      profile.qnas.map((qna: any) => new QnA(
        qna.id,
        qna.question,
        qna.answer,
        qna.createdAt,
        qna.updatedAt
      )),
      profile.createdAt,
      profile.updatedAt
    );
  }
}