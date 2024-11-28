import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import {
  AuthenticatorTransportFuture,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/types';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { PasskeyStartAuthenticationDto } from './dtos/passkey-start-authentication.dto';
import { PasskeyVerifyRegistrationDto } from './dtos/passkey-verify-registration.dto';
import { Passkey } from './schemas/passkey.schema';

@Injectable()
export class PasskeyService {
  constructor(
    @InjectModel(Passkey.name) private readonly passkeyModel: Model<Passkey>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly configService: ConfigService,
  ) {}

  async startRegistration(
    userId: string,
  ): Promise<PublicKeyCredentialCreationOptionsJSON> {
    try {
      const user = await this.userModel.findOne({
        _id: userId,
      });
      if (!user) {
        throw new CustomHttpException('User not found', HttpStatus.NOT_FOUND, {
          field: 'user',
          message: 'not-found',
        });
      }
      const passkeys = await this.passkeyModel.find({
        user_id: user._id,
      });
      const registrationOptions = await generateRegistrationOptions({
        rpName: this.configService.get<string>('APP_NAME'),
        rpID: 'localhost',
        userName: user.username,
        attestationType: 'none',
        excludeCredentials: passkeys.map((passkey) => ({
          id: passkey.credential_id,
          transports: passkey.transports as AuthenticatorTransportFuture[],
        })),
        authenticatorSelection: {
          residentKey: 'preferred',
          userVerification: 'preferred',
        },
      });

      return registrationOptions;
    } catch (error) {
      console.log(error);
      throw new CustomHttpException(
        'Failed to start registration',
        HttpStatus.BAD_REQUEST,
        {
          field: 'system-error',
          message: 'system-error',
        },
      );
    }
  }

  async verifyRegistration(
    userId: string,
    passkeyVerifyRegistrationDto: PasskeyVerifyRegistrationDto,
  ) {
    const verifyResponse = await verifyRegistrationResponse({
      response: passkeyVerifyRegistrationDto.response,
      expectedChallenge: passkeyVerifyRegistrationDto.challenge,
      expectedOrigin: this.configService.get<string>('CLIENT_APP_URL'),
      expectedRPID: 'localhost',
    });

    if (verifyResponse.verified) {
      console.log('Passkey verified', verifyResponse);
      const passkey = await this.passkeyModel.create({
        ...verifyResponse,
        user_id: userId,
        aaguid: verifyResponse.registrationInfo.aaguid,
        credential_type: verifyResponse.registrationInfo.credentialType,
        credential_id: verifyResponse.registrationInfo.credential.id,
        public_key: Buffer.from(
          verifyResponse.registrationInfo.credential.publicKey,
        ).toString('base64'),
      });

      await this.userModel.updateOne(
        { _id: userId },
        {
          $push: {
            passkeys: passkey._id,
          },
        },
      );

      return passkey;
    }

    throw new CustomHttpException(
      'Failed to verify registration',
      HttpStatus.BAD_REQUEST,
      {
        field: 'system-error',
        message: 'system-error',
      },
    );
  }

  async startAuthentication(email: string) {
    const user = await this.userModel.findOne({
      email,
    });

    if (!user) {
      throw new CustomHttpException('User not found', HttpStatus.NOT_FOUND, {
        field: 'user',
        message: 'not-found',
      });
    }
    const passkeys = await this.passkeyModel.find({
      user_id: user._id,
    });

    const options: PublicKeyCredentialRequestOptionsJSON =
      await generateAuthenticationOptions({
        rpID: 'localhost',
        allowCredentials: passkeys.map((passkey) => ({
          id: passkey.credential_id,
          transports: passkey.transports as AuthenticatorTransportFuture[],
        })),
      });

    if (!options) {
      console.error('Failed to start authentication');
      throw new CustomHttpException(
        'Failed to start authentication',
        HttpStatus.BAD_REQUEST,
        {
          field: 'system-error',
          message: 'system-error',
        },
      );
    }

    return options;
  }

  async verifyAuthentication(
    userId: string,
    passkeyStartAuthenticationDto: PasskeyStartAuthenticationDto,
  ) {
    const passkey = await this.passkeyModel.findOne({
      user_id: userId,
    });
    if (!passkey) {
      throw new CustomHttpException('Passkey not found', HttpStatus.NOT_FOUND, {
        field: 'passkey',
        message: 'not-found',
      });
    }
    const verifyResponse = await verifyAuthenticationResponse({
      response: passkeyStartAuthenticationDto.response,
      expectedChallenge: passkeyStartAuthenticationDto.challenge,
      expectedOrigin: this.configService.get<string>('CLIENT_APP_URL'),
      expectedRPID: 'localhost',
      credential: {
        id: passkey.credential_id,
        publicKey: Buffer.from(passkey.public_key, 'base64'),
        counter: passkey.counter,
        transports: passkey.transports as AuthenticatorTransportFuture[],
      },
    });

    if (verifyResponse.verified) {
      console.log('Passkey verified', verifyResponse);
      return verifyResponse;
    }

    throw new CustomHttpException(
      'Failed to verify authentication',
      HttpStatus.BAD_REQUEST,
      {
        field: 'system-error',
        message: 'system-error',
      },
    );
  }
}
