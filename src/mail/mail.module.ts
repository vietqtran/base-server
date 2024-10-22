import { MailService } from './mail.service';
import { Module } from '@nestjs/common';
import { QueueModule } from '../queue/queue.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { SendMailProcessor } from '@/common/processors/send-mail.processor';
import { DECORATOR_KEYS, QUEUES } from '@/constants/common';

@Module({
  imports: [
    QueueModule.register({
      queues: [DECORATOR_KEYS.SEND_MAIL],
      flows: [QUEUES.MAIL_QUEUE],
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAILER_HOST'),
          secure: false,
          auth: {
            user: configService.get<string>('MAILER_USER'),
            pass: configService.get<string>('MAILER_PASSWORD'),
          },
        },
        defaults: {
          from: configService.get<string>('MAILER_FROM'),
        },
        template: {
          dir: join('src', 'assets', 'mail', 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [MailService],
  providers: [MailService, SendMailProcessor],
})
export class MailModule {}
