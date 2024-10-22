import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as argon2 from 'argon2';
import { Session } from './schemas/session.schema';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel('Session') private sessionModel: Model<any>,
    @InjectModel('User') private userModel: Model<User>,
    private configService: ConfigService,
  ) {}

  async upsertSession(
    userId: string,
    accessToken: string,
    refreshToken: string,
  ): Promise<Session> {
    try {
      const hashedRefreshToken = await argon2.hash(refreshToken);

      const expireInMs =
        parseInt(this.configService.get('JWT_EXPIRE_IN')) * 1000;

      if (isNaN(expireInMs)) {
        throw new Error('Invalid JWT_EXPIRE_IN configuration');
      }

      const expiresAt = new Date(Date.now() + expireInMs);

      if (isNaN(expiresAt.getTime())) {
        throw new Error('Invalid expiration date generated');
      }

      const session = await this.sessionModel.findOneAndUpdate(
        { user: userId, refresh_token: refreshToken },
        {
          user: userId,
          access_token: accessToken,
          refresh_token: hashedRefreshToken,
          expires_at: expiresAt,
        },
        { upsert: true, new: true },
      );

      await this.userModel.findByIdAndUpdate(
        userId,
        {
          $addToSet: { sessions: session },
        },
        { new: true },
      );

      return session;
    } catch (error) {
      throw new Error(`Failed to upsert session: ${error.message}`);
    }
  }

  async cleanupExpiredSessions(userId: string): Promise<void> {
    try {
      // Find expired sessions
      const expiredSessions = await this.sessionModel.find({
        user: userId,
        expires_at: { $lt: new Date() },
      });

      if (expiredSessions.length > 0) {
        const expiredSessionIds = expiredSessions.map((session) => session._id);

        await this.userModel.findByIdAndUpdate(userId, {
          $pull: { sessions: { $in: expiredSessionIds } },
        });

        await this.sessionModel.deleteMany({
          _id: { $in: expiredSessionIds },
        });
      }
    } catch (error) {
      throw new Error(`Failed to cleanup expired sessions: ${error.message}`);
    }
  }
}
