import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { Session } from './schemas/session.schema';
import { User } from '../users/schemas/user.schema';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel('Session') private readonly sessionModel: Model<any>,
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly configService: ConfigService,
  ) {}

  async upsertSession(
    userId: string,
    accessToken: string,
    refreshToken: string,
  ): Promise<Session> {
    const expireInMs =
      (parseInt(this.configService.get('JWT_REFRESH_EXPIRE_IN')) + 60) * 1000;

    if (isNaN(expireInMs)) {
      throw new CustomHttpException(
        "Token's expiration is not a valid number",
        HttpStatus.BAD_REQUEST,
        {
          field: 'token',
          message: 'invalid-format',
        },
      );
    }

    const expiresAt = new Date(Date.now() + expireInMs);

    if (isNaN(expiresAt.getTime())) {
      throw new CustomHttpException(
        "Token's expiration is not a valid number",
        HttpStatus.BAD_REQUEST,
        {
          field: 'token',
          message: 'invalid-format',
        },
      );
    }

    const session = await this.sessionModel.findOneAndUpdate(
      { user: userId },
      {
        user: userId,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresAt,
      },
      { upsert: true, new: true },
    );

    await this.userModel.findByIdAndUpdate(userId, {
      $addToSet: { sessions: session },
    });

    return session;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredSessions() {
    try {
      const expiredSessions = await this.sessionModel.find({
        expires_at: { $lt: new Date() },
      });

      const userSessionMap = expiredSessions.reduce((acc, session) => {
        if (!acc[session.user]) {
          acc[session.user] = [];
        }
        acc[session.user].push(session._id);
        return acc;
      }, {});

      await Promise.all(
        Object.entries(userSessionMap).map(([userId, sessionIds]) =>
          this.userModel.updateOne(
            { _id: userId },
            {
              $pull: {
                sessions: {
                  _id: { $in: sessionIds },
                },
              },
            },
          ),
        ),
      );

      await this.sessionModel.deleteMany({
        expires_at: { $lt: new Date() },
      });
    } catch (error) {
      console.log(error);
      throw new CustomHttpException(
        'Failed to cleanup expired sessions',
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          field: 'system-error',
          message: 'system-error',
        },
      );
    }
  }

  async removeSession(userId: string, refreshToken: string): Promise<void> {
    try {
      const session = await this.sessionModel.findOne({
        user: userId,
        refresh_token: refreshToken,
      });

      if (session) {
        await this.userModel.updateOne(
          { _id: userId },
          {
            $pull: {
              sessions: {
                _id: session._id,
              },
            },
          },
        );

        await this.sessionModel.deleteOne({ _id: session._id });
      }
    } catch (error) {
      console.log(error);
      throw new CustomHttpException(
        'Failed to remove session',
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          field: 'system-error',
          message: 'system-error',
        },
      );
    }
  }
}
