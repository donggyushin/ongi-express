export interface ImageData {
  url: string;
  publicId: string;
}

export interface IImageRepository {
  uploadImage(file: Buffer, fileName: string, folder?: string): Promise<string>;
  uploadImageWithData(file: Buffer, fileName: string, folder?: string): Promise<ImageData>;
  deleteImage(publicId: string): Promise<boolean>;
}