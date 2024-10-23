import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { Processor } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { WorkerHostProcessor } from './worker-host.processor';
import { DECORATOR_KEYS } from '@/constants/common';

@Processor(DECORATOR_KEYS.DELETE_IMAGE)
export class DeleteFileProcessor extends WorkerHostProcessor {
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
    const { key } = job.data;
    try {
      if (!key) {
        throw new Error('Key is required for deletion');
      }

      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.configService.get('AWS_S3_BUCKET'),
          Key: key,
        }),
      );

      this.logger.log(`Successfully deleted image with key: ${key}`);

      return {
        success: true,
        key,
      };
    } catch (error) {
      this.logger.error(
        `Error deleting image with key ${key}: ${error.message}`,
      );
      throw error;
    }
  }
}
