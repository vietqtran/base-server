import { DECORATOR_KEYS } from '@/constants/common';
import { InjectQueue } from '@nestjs/bullmq';

export const InjectSendMailQueue = () => InjectQueue(DECORATOR_KEYS.SEND_MAIL);
