import { Body, Controller, Post } from '@nestjs/common';
import { PasskeyService } from './passkey.service';
import { PasskeyStartRegistrationDto } from './dtos/passkey-start-registration.dto';
import { PasskeyVerifyRegistrationDto } from './dtos/passkey-verify-registration.dto';
import { PasskeyStartAuthenticationDto } from './dtos/passkey-start-authentication.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('passkey')
@ApiTags('Passkeys')
export class PasskeyController {
  constructor(private readonly passkeyService: PasskeyService) {}

  @Post('start-registration')
  async startRegistration(
    @Body() passkeyStartRegistrationDto: PasskeyStartRegistrationDto,
  ) {
    return this.passkeyService.startRegistration(passkeyStartRegistrationDto);
  }

  @Post('verify-registration')
  async verifyRegistration(
    @Body() passkeyVerifyRegistrationDto: PasskeyVerifyRegistrationDto,
  ) {
    return this.passkeyService.verifyRegistration(passkeyVerifyRegistrationDto);
  }

  @Post('start-authentication')
  async startAuthentication(
    @Body() passkeyStartAuthenticationDto: PasskeyStartAuthenticationDto,
  ) {
    return this.passkeyService.startAuthentication(
      passkeyStartAuthenticationDto,
    );
  }

  @Post('verify-authentication')
  async verifyAuthentication(
    @Body() passkeyStartAuthenticationDto: PasskeyStartAuthenticationDto,
  ) {
    return this.passkeyService.verifyAuthentication(
      passkeyStartAuthenticationDto,
    );
  }
}
