import { Module } from '@nestjs/common';
import { SocialLoginService } from './social-login.service';
import { SocialLoginController } from './social-login.controller';

@Module({
  controllers: [SocialLoginController],
  providers: [SocialLoginService],
})
export class SocialLoginModule {}
