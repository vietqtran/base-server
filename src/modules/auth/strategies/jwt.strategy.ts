import { ExtractJwt, Strategy } from 'passport-jwt';

import { ConfigService } from '@nestjs/config';
import { HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { TokenPayload } from '../interfaces/token-payload.interface';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '@/modules/users/schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: TokenPayload) {
    const user = await this.userModel.findOne({ _id: payload.sub });
    if (!user) {
      throw new CustomHttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }
}
