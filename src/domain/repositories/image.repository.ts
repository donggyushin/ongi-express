export interface IImageRepository {
  uploadImage(file: Buffer, fileName: string, folder?: string): Promise<string>;
  deleteImage(publicId: string): Promise<boolean>;
}