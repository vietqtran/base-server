import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Session } from './schemas/session.schema';
import { InjectModel } from '@nestjs/mongoose';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Session.name) private readonly sessionModel: Model<Session>,
    private readonly configService: ConfigService,
  ) {}

  async upsertSession(
    userId: string,
    accessToken: string,
    refreshToken: string,
  ): Promise<void> {
    const hashedRefreshToken = await argon2.hash(refreshToken);
    const expiresAt = new Date(
      Date.now() + this.configService.get<string>('JWT_EXPIRE_IN'),
    );

    await this.sessionModel.updateOne(
      { user: userId },
      {
        user: userId,
        access_token: accessToken,
        refresh_token: hashedRefreshToken,
        expires_at: expiresAt,
      },
      { upsert: true },
    );
  }
}
