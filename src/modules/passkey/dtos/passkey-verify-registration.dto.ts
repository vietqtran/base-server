import { RegistrationResponseJSON } from '@simplewebauthn/types';

export class PasskeyVerifyRegistrationDto {
  response: RegistrationResponseJSON;
  challenge: string;
}
