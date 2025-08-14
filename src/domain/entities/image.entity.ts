export class Image {
  constructor(
    public readonly url: string,
    public readonly publicId: string
  ) {}

  toJSON() {
    return {
      url: this.url,
      publicId: this.publicId
    };
  }
}