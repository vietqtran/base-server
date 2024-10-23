import { DECORATOR_KEYS } from '@/constants/common';
import { InjectQueue } from '@nestjs/bullmq';

export const InjectDeleteFileQueue = () =>
  InjectQueue(DECORATOR_KEYS.DELETE_IMAGE);
