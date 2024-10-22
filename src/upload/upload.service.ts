import { InjectUploadAvatarlQueue } from '@/common/decorators/upload-avatar.decorator';
import { DECORATOR_KEYS } from '@/constants/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';

@Injectable()
export class UploadService {
  constructor(
    @InjectUploadAvatarlQueue() private avatarUploadQueue: Queue,
    private readonly configService: ConfigService,
  ) {}

  async uploadAvatar(file: Express.Multer.File, userId: string) {
    const key = `avatars/${userId + '_' + new Date().getTime()}-${file.originalname}`;
    const newKey = this.sanitizeFileName(key);
    await this.avatarUploadQueue.add(
      DECORATOR_KEYS.UPLOAD_AVATAR,
      {
        userId,
        fileKey: newKey,
        file,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    );

    const url = `https://${this.configService.get('AWS_S3_BUCKET')}.s3.amazonaws.com/${newKey}`;

    return {
      url,
      newKey,
    };
  }

  private sanitizeFileName(fileName: string): string {
    const sanitized = fileName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9.-]/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase();

    return sanitized;
  }
}
