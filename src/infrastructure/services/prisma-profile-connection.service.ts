import { PrismaClient } from '../../generated/prisma';
import { IProfileConnectionRepository } from '@/domain/repositories';
import { ProfileConnection, ConnectedProfile } from '@/domain/entities';

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

  async delete(myProfileId: string): Promise<void> {
    await this.prisma.profileConnection.delete({
      where: { myProfileId }
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
      connection.createdAt,
      connection.updatedAt
    );
  }
}