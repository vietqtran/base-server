import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/modules/users/users.service';
import { TokenPayload } from '../interfaces/token-payload.interface';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { Model } from 'mongoose';
import { User } from '@/modules/users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {
    super({
      jwtFromRequest: JwtRefreshStrategy.extractJWT,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  private static extractJWT(req: Request): string | null {
    if (req && req.body && req.body.refreshToken) {
      return req.body.refreshToken;
    }
    return null;
  }

  async validate(req: Request, payload: TokenPayload) {
    const refreshToken = JwtRefreshStrategy.extractJWT(req);
    if (!refreshToken)
      throw new CustomHttpException('Missing refresh token', 400, {
        refreshToken: ['Missing refresh token'],
      });
    const user = await this.userModel.findOne({ _id: payload.sub });
    const isValid = await this.jwtService.verify(refreshToken, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });
    if (!isValid) {
      throw new CustomHttpException('Invalid refresh token', 401, {
        refreshToken: ['Invalid refresh token'],
      });
    }
    return user;
  }
}
