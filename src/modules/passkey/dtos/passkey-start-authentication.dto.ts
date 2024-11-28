import { AuthenticationResponseJSON } from '@simplewebauthn/types';

export class PasskeyStartAuthenticationDto {
  response: AuthenticationResponseJSON;
  challenge: string;
}
