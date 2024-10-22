import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { Processor } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import * as sharp from 'sharp';
import { WorkerHostProcessor } from './worker-host.processor';
import { DECORATOR_KEYS } from '@/constants/common';

export class UploadAvatarDto {
  userId: string;
  fileKey: string;
  originalName: string;
}

@Processor(DECORATOR_KEYS.UPLOAD_AVATAR)
export class UploadProcessor extends WorkerHostProcessor {
  private s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    super();
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async process(job: Job) {
    try {
      const { userId, fileKey, file } = job.data;

      const imageBuffer = Buffer.isBuffer(file.buffer)
        ? file.buffer
        : Buffer.from(file.buffer.data);

      const sizes = [
        { width: 50, height: 50, suffix: 'thumb' },
        { width: 200, height: 200, suffix: 'medium' },
        { width: 500, height: 500, suffix: 'large' },
      ];

      for (const size of sizes) {
        const resizedBuffer = await sharp(imageBuffer)
          .resize(size.width, size.height, {
            fit: 'cover',
            position: 'center',
          })
          .jpeg({ quality: 80 })
          .toBuffer();

        const resizedKey = this.getResizedKey(fileKey, size.suffix);

        await this.s3Client.send(
          new PutObjectCommand({
            Bucket: this.configService.get('AWS_S3_BUCKET'),
            Key: resizedKey,
            Body: resizedBuffer,
            ACL: 'public-read',
            ContentType: 'image/jpeg',
          }),
        );
      }

      this.logger.log(`Successfully processed avatar for user ${userId}`);

      return {
        success: true,
        userId,
        sizes: sizes.map((size) => ({
          size: `${size.width}x${size.height}`,
          key: this.getResizedKey(fileKey, size.suffix),
        })),
      };
    } catch (error) {
      this.logger.error(`Error processing avatar: ${error.message}`);
      throw error;
    }
  }

  private getResizedKey(originalKey: string, suffix: string): string {
    const keyParts = originalKey.split('.');
    const extension = keyParts.pop();
    return `${keyParts.join('.')}-${suffix}.${extension}`;
  }
}
