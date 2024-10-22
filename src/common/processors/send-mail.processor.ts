import { BadRequestException, Injectable } from '@nestjs/common';

import { Job } from 'bullmq';
import { MailerService } from '@nestjs-modules/mailer';
import { Processor } from '@nestjs/bullmq';
import { WorkerHostProcessor } from './worker-host.processor';
import { SEND_MAIL } from '@/mail/constants/mail.constant';

@Processor(SEND_MAIL)
@Injectable()
export class SendMailProcessor extends WorkerHostProcessor {
  constructor(private readonly mailerService: MailerService) {
    super();
  }

  async process(job: Job) {
    console.log('processor', job.data);
    if (job.name === SEND_MAIL) {
      await this.mailerService.sendMail(job.data);
    }
    throw new BadRequestException(`Unknown job name: ${job.name}`);
  }
}
