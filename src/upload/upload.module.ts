import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadProcessor } from '@/common/processors/upload.processor';
import { QueueModule } from '@/queue/queue.module';
import { DECORATOR_KEYS, QUEUES } from '@/constants/common';

@Module({
  imports: [
    QueueModule.register({
      queues: [DECORATOR_KEYS.UPLOAD_AVATAR],
      flows: [QUEUES.UPLOAD_AVATAR_QUEUE],
    }),
  ],
  providers: [UploadService, UploadProcessor],
  exports: [UploadService],
})
export class UploadModule {}
