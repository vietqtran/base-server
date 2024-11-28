import { RegistrationResponseJSON } from '@simplewebauthn/types';

export class PasskeyVerifyRegistrationDto {
  email: string;
  response: RegistrationResponseJSON;
  challenge: string;
}
