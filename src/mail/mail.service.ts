import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { SendMailDto } from './dtos/send-mail.dto';
import { InjectSendMailQueue } from '@/common/decorators/send-mail.decorator';
import { SEND_MAIL } from './constants/mail.constant';

@Injectable()
export class MailService {
  constructor(
    @InjectSendMailQueue() private readonly mailQueue: Queue,
    private readonly configService: ConfigService,
  ) {}

  async sendMail(sendMailDto: SendMailDto) {
    const { to, context, subject, template } = sendMailDto;
    const sendMailPayload = {
      to,
      from: this.configService.get<string>('MAILER_FROM'),
      subject,
      template: `./${template}`,
      context,
    };
    console.log('sendMailPayload', sendMailPayload);
    await this.mailQueue.add(SEND_MAIL, sendMailPayload);
  }
}
