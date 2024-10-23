import { DECORATOR_KEYS } from '@/constants/common';
import { InjectQueue } from '@nestjs/bullmq';

export const InjectUploadFileQueue = () =>
  InjectQueue(DECORATOR_KEYS.UPLOAD_AVATAR);
