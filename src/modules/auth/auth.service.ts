import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as argon2 from 'argon2';
import { SignUpDto } from './dtos/sign-up.dto';
import { TokenPayload } from './interfaces/token-payload.interface';
import { User } from '../users/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const user = await this.usersService.findOne({
      $or: [{ email: signUpDto.email }, { username: signUpDto.username }],
    });
    if (user) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }
    const hashedPassword = await argon2.hash(signUpDto.password);
    const createdUser = await this.usersService.create({
      username: signUpDto.username,
      email: signUpDto.email,
      password_hash: hashedPassword,
      roles: signUpDto.roles,
    });

    const accessToken = await this.generateAccessToken(createdUser);
    const refreshToken = await this.generateRefreshToken(createdUser);

    return {
      user: createdUser,
      accessToken,
      refreshToken,
    };
  }

  async generateAccessToken(user: User) {
    const tokenPayload: TokenPayload = {
      sub: user._id,
      name: user.username,
      email: user.email,
      roles: [...user.roles],
    };
    const token = await this.jwtService.signAsync(tokenPayload);
    return token;
  }

  async generateRefreshToken(user: User) {
    const tokenPayload: TokenPayload = {
      sub: user._id,
      name: user.username,
      email: user.email,
      roles: [...user.roles],
    };
    const token = await this.jwtService.signAsync(tokenPayload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: `${this.configService.get<string>('JWT_REFRESH_EXPIRE_IN')}s`,
    });
    return token;
  }
}
