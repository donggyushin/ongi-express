export class Location {
  constructor(
    public readonly id: string,
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  toJSON() {
    return {
      id: this.id,
      latitude: this.latitude,
      longitude: this.longitude,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }
}