import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-jwt'
import { Request } from 'express'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from 'src/modules/users/users.service'
import { TokenPayload } from '../interfaces/token-payload.interface'

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(
        private configService: ConfigService,
        private jwtService: JwtService,
        private usersService: UsersService,
    ) {
        super({
            jwtFromRequest: JwtRefreshStrategy.extractJWT,
            secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
            passReqToCallback: true,
        })
    }

    private static extractJWT(req: Request): string | null {
        if (req && req.body && req.body.refreshToken) {
            return req.body.refreshToken
        }
        return null
    }

    async validate(req: Request, payload: TokenPayload) {
        const refreshToken = JwtRefreshStrategy.extractJWT(req)
        if (!refreshToken) throw new UnauthorizedException('Refresh token malformed.')
        const user = await this.usersService.findOne(payload.sub)
        const isValid = await this.jwtService.verify(refreshToken, {
            secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        })
        if (!isValid) throw new UnauthorizedException('Invalid refresh token')
        return user
    }
}