import { Body, Controller, Get, Post } from '@nestjs/common';
import { PasskeyService } from './passkey.service';
import { PasskeyVerifyRegistrationDto } from './dtos/passkey-verify-registration.dto';
import { PasskeyStartAuthenticationDto } from './dtos/passkey-start-authentication.dto';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '../users/schemas/user.schema';

@Controller('passkey')
@ApiTags('Passkeys')
export class PasskeyController {
  constructor(private readonly passkeyService: PasskeyService) {}

  @Get('start-registration')
  async startRegistration(@CurrentUser() user: User) {
    const { _id } = user;
    return this.passkeyService.startRegistration(_id);
  }

  @Post('verify-registration')
  async verifyRegistration(
    @CurrentUser() user: User,
    @Body() passkeyVerifyRegistrationDto: PasskeyVerifyRegistrationDto,
  ) {
    const { _id } = user;
    return this.passkeyService.verifyRegistration(
      _id,
      passkeyVerifyRegistrationDto,
    );
  }

  @Get('start-authentication')
  async startAuthentication(@CurrentUser() user: User) {
    const { email } = user;
    return this.passkeyService.startAuthentication(email);
  }

  @Post('verify-authentication')
  async verifyAuthentication(
    @CurrentUser() user: User,
    @Body() passkeyStartAuthenticationDto: PasskeyStartAuthenticationDto,
  ) {
    const { _id } = user;
    return this.passkeyService.verifyAuthentication(
      _id,
      passkeyStartAuthenticationDto,
    );
  }
}
