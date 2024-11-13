import { InjectDeleteFileQueue } from '@/common/decorators/delete-file.decorator';
import { InjectUploadFileQueue } from '@/common/decorators/upload-file.decorator';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { DECORATOR_KEYS } from '@/constants/common';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';

@Injectable()
export class UploadService {
  constructor(
    @InjectUploadFileQueue() private avatarUploadQueue: Queue,
    @InjectDeleteFileQueue() private deleteFileQueue: Queue,
    private readonly configService: ConfigService,
  ) {}

  async uploadAvatar(file: Express.Multer.File, userId: string) {
    if (!file) {
      throw new CustomHttpException('File not found', HttpStatus.NOT_FOUND, {
        field: 'file',
        message: 'not-found',
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

  async deleteFile(key: string) {
    await this.deleteFileQueue.add(DECORATOR_KEYS.DELETE_IMAGE, {
      key,
    });

    return {
      success: true,
      key,
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
