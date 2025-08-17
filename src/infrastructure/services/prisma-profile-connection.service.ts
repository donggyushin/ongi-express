import { PrismaClient } from '../../generated/prisma';
import { IProfileConnectionRepository } from '@/domain/repositories';
import { ProfileConnection, ConnectedProfile } from '@/domain/entities';

interface ConnectedProfileData {
  profileId: string;
  addedAt: string;
  isNew: boolean;
}

export class PrismaProfileConnectionService implements IProfileConnectionRepository {
  constructor(private prisma: PrismaClient) {}

  async findByProfileId(myProfileId: string): Promise<ProfileConnection | null> {
    const connection = await this.prisma.profileConnection.findUnique({
      where: { myProfileId }
    });

    return connection ? this.mapToEntity(connection) : null;
  }

  async create(myProfileId: string): Promise<ProfileConnection> {
    const connection = await this.prisma.profileConnection.create({
      data: {
        myProfileId,
        otherProfiles: []
      }
    });

    return this.mapToEntity(connection);
  }

  async addConnection(myProfileId: string, otherProfileId: string): Promise<ProfileConnection> {
    const existing = await this.prisma.profileConnection.findUnique({
      where: { myProfileId }
    });

    if (!existing) {
      // Create new connection if it doesn't exist
      const newConnectedProfile = {
        profileId: otherProfileId,
        addedAt: new Date().toISOString(),
        isNew: true
      };

      const connection = await this.prisma.profileConnection.create({
        data: {
          myProfileId,
          otherProfiles: [newConnectedProfile]
        }
      });
      return this.mapToEntity(connection);
    }

    // Parse existing connections
    const otherProfiles = Array.isArray(existing.otherProfiles) 
      ? existing.otherProfiles as unknown as ConnectedProfileData[]
      : [];

    // Check if connection already exists
    const alreadyConnected = otherProfiles.some(cp => cp.profileId === otherProfileId);
    if (alreadyConnected) {
      return this.mapToEntity(existing);
    }

    // Add new connection
    const newConnectedProfile = {
      profileId: otherProfileId,
      addedAt: new Date().toISOString(),
      isNew: true
    };

    const updatedProfiles = [...otherProfiles, newConnectedProfile];

    const connection = await this.prisma.profileConnection.update({
      where: { myProfileId },
      data: { otherProfiles: updatedProfiles as any }
    });

    return this.mapToEntity(connection);
  }

  async removeConnection(myProfileId: string, otherProfileId: string): Promise<ProfileConnection> {
    const existing = await this.prisma.profileConnection.findUnique({
      where: { myProfileId }
    });

    if (!existing) {
      throw new Error('Profile connection not found');
    }

    const otherProfiles = Array.isArray(existing.otherProfiles) 
      ? existing.otherProfiles as unknown as ConnectedProfileData[]
      : [];

    const updatedProfiles = otherProfiles.filter(cp => cp.profileId !== otherProfileId);

    const connection = await this.prisma.profileConnection.update({
      where: { myProfileId },
      data: { otherProfiles: updatedProfiles as any }
    });

    return this.mapToEntity(connection);
  }

  async updateConnections(myProfileId: string, othersProfileIds: string[]): Promise<ProfileConnection> {
    const otherProfiles = othersProfileIds.map(profileId => ({
      profileId,
      addedAt: new Date().toISOString(),
      isNew: true
    }));

    const connection = await this.prisma.profileConnection.upsert({
      where: { myProfileId },
      update: { otherProfiles: otherProfiles as any },
      create: {
        myProfileId,
        otherProfiles: otherProfiles as any
      }
    });

    return this.mapToEntity(connection);
  }

  async delete(myProfileId: string): Promise<void> {
    await this.prisma.profileConnection.delete({
      where: { myProfileId }
    });
  }

  private mapToEntity(connection: any): ProfileConnection {
    const otherProfiles = Array.isArray(connection.otherProfiles) 
      ? connection.otherProfiles as unknown as ConnectedProfileData[]
      : [];

    const connectedProfiles = otherProfiles.map(cp => 
      new ConnectedProfile(
        cp.profileId,
        new Date(cp.addedAt),
        cp.isNew
      )
    );

    return new ProfileConnection(
      connection.id,
      connection.myProfileId,
      connectedProfiles,
      connection.createdAt,
      connection.updatedAt
    );
  }
}