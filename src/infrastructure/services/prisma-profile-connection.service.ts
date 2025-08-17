import { PrismaClient } from '../../generated/prisma';
import { IProfileConnectionRepository } from '@/domain/repositories';
import { ProfileConnection } from '@/domain/entities';

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
        othersProfileIds: []
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
      const connection = await this.prisma.profileConnection.create({
        data: {
          myProfileId,
          othersProfileIds: [otherProfileId]
        }
      });
      return this.mapToEntity(connection);
    }

    // Add to existing connections if not already present
    const updatedIds = existing.othersProfileIds.includes(otherProfileId) 
      ? existing.othersProfileIds 
      : [...existing.othersProfileIds, otherProfileId];

    const connection = await this.prisma.profileConnection.update({
      where: { myProfileId },
      data: { othersProfileIds: updatedIds }
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

    const updatedIds = existing.othersProfileIds.filter(id => id !== otherProfileId);

    const connection = await this.prisma.profileConnection.update({
      where: { myProfileId },
      data: { othersProfileIds: updatedIds }
    });

    return this.mapToEntity(connection);
  }

  async updateConnections(myProfileId: string, othersProfileIds: string[]): Promise<ProfileConnection> {
    const connection = await this.prisma.profileConnection.upsert({
      where: { myProfileId },
      update: { othersProfileIds },
      create: {
        myProfileId,
        othersProfileIds
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
    return new ProfileConnection(
      connection.id,
      connection.myProfileId,
      connection.othersProfileIds,
      connection.createdAt,
      connection.updatedAt
    );
  }
}