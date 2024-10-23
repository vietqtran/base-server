import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadProcessor } from '@/common/processors/upload-file.processor';
import { QueueModule } from '@/queue/queue.module';
import { DECORATOR_KEYS, QUEUES } from '@/constants/common';
import { DeleteFileProcessor } from '@/common/processors/delete-file.processor';

@Module({
  imports: [
    QueueModule.register({
      queues: [DECORATOR_KEYS.UPLOAD_AVATAR, DECORATOR_KEYS.DELETE_IMAGE],
      flows: [QUEUES.UPLOAD_AVATAR_QUEUE, QUEUES.DELETE_IMAGE_QUEUE],
    }),
  ],
  providers: [UploadService, UploadProcessor, DeleteFileProcessor],
  exports: [UploadService],
})
export class UploadModule {}
