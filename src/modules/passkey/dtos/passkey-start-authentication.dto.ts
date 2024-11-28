import { AuthenticationResponseJSON } from '@simplewebauthn/types';

export class PasskeyStartAuthenticationDto {
  email: string;
  passkeyId: string;
  response: AuthenticationResponseJSON;
  challenge: string;
}
