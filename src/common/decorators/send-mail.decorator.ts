import { SEND_MAIL } from '@/mail/constants/mail.constant';
import { InjectQueue } from '@nestjs/bullmq';

export const InjectSendMailQueue = () => InjectQueue(SEND_MAIL);
