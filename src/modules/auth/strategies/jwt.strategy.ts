import { ExtractJwt, Strategy } from 'passport-jwt'

import { ConfigService } from '@nestjs/config'
import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { UsersService } from 'src/modules/users/users.service'
import { TokenPayload } from '../interfaces/token-payload.interface'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly userService: UsersService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET'),
        })
    }

    async validate(payload: TokenPayload) {
        return await this.userService.findOne({_id: payload.sub})
    }
}