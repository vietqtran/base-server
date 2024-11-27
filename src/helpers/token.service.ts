import { TokenPayload } from '@/modules/auth/interfaces/token-payload.interface';
import { User } from '@/modules/users/schemas/user.schema';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

export interface TokenConfig {
  secret?: string;
  expiresIn?: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateAccessToken(user: User): Promise<string> {
    const payload = this.createTokenPayload(user);
    return this.jwtService.signAsync(payload);
  }

  async generateRefreshToken(user: User): Promise<string> {
    const payload = this.createTokenPayload(user);
    const config: TokenConfig = {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: `${this.configService.get<string>('JWT_REFRESH_EXPIRE_IN')}s`,
    };
    return this.jwtService.signAsync(payload, config);
  }

  async generateVerifyToken(user: User): Promise<string> {
    const payload = this.createTokenPayload(user);
    const config: TokenConfig = {
      secret: this.configService.get<string>('JWT_VERIFY_SECRET'),
      expiresIn: `${this.configService.get<string>('JWT_VERIFY_EXPIRE_IN')}s`,
    };
    return this.jwtService.signAsync(payload, config);
  }

  async verifyToken(token: string): Promise<TokenPayload> {
    return this.jwtService.verifyAsync(token);
  }

  private createTokenPayload(user: User): TokenPayload {
    return {
      sub: user._id,
      name: user.username,
      email: user.email,
      roles: [...user.roles],
    };
  }
}
