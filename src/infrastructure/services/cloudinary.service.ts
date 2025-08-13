import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { IImageRepository } from '@/domain/repositories';
import { ILoggerService } from '@/infrastructure/services';

export class CloudinaryService implements IImageRepository {
  private logger: ILoggerService;

  constructor(logger: ILoggerService) {
    this.logger = logger;
    
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(file: Buffer, fileName: string, folder: string = 'profile-images'): Promise<string> {
    try {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder,
            public_id: fileName,
            resource_type: 'image'
          },
          (error, result: UploadApiResponse | undefined) => {
            if (error) {
              this.logger.error('Cloudinary upload error:', error);
              reject(new Error(`Image upload failed: ${error.message}`));
            } else if (result) {
              this.logger.info(`Image uploaded successfully: ${result.secure_url}`);
              resolve(result.secure_url);
            } else {
              reject(new Error('Image upload failed: No result returned'));
            }
          }
        ).end(file);
      });
    } catch (error) {
      this.logger.error('Error uploading image to Cloudinary:', error instanceof Error ? error : new Error(String(error)));
      throw new Error('Failed to upload image');
    }
  }

  async deleteImage(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      this.logger.info(`Image deletion result: ${result.result}`);
      return result.result === 'ok';
    } catch (error) {
      this.logger.error('Error deleting image from Cloudinary:', error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }
}