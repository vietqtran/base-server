import { InjectUploadAvatarlQueue } from '@/common/decorators/upload-avatar.decorator';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { DECORATOR_KEYS } from '@/constants/common';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';

@Injectable()
export class UploadService {
  constructor(
    @InjectUploadAvatarlQueue() private avatarUploadQueue: Queue,
    private readonly configService: ConfigService,
  ) {}

  async uploadAvatar(file: Express.Multer.File, userId: string) {
    if (!file) {
      throw new CustomHttpException('File not found', HttpStatus.NOT_FOUND, {
        file: ['File not found'],
      });
    }
    const key = `avatars/${userId + '_' + new Date().getTime()}-${file.originalname}`;
    const newKey = this.sanitizeFileName(key);
    const url = `https://${this.configService.get('AWS_S3_BUCKET')}.s3.amazonaws.com/${newKey}`;
    await this.avatarUploadQueue.add(
      DECORATOR_KEYS.UPLOAD_AVATAR,
      {
        userId,
        key: newKey,
        file,
        size: {
          width: 200,
          height: 200,
        },
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    );

    return {
      url,
      key: newKey,
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
