import { Controller } from '@nestjs/common';
import { SocialLoginService } from './social-login.service';

@Controller('social-login')
export class SocialLoginController {
  constructor(private readonly socialLoginService: SocialLoginService) {}
}
