import { HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as argon2 from 'argon2';
import { SignUpDto } from './dtos/sign-up.dto';
import { TokenPayload } from './interfaces/token-payload.interface';
import { User } from '../users/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.validateUser(email, password);
    if (!user) {
      throw new CustomHttpException(
        'Invalid credentials',
        HttpStatus.UNAUTHORIZED,
        {
          email: ['Invalid credentials'],
        },
      );
    }
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);
    return { accessToken, refreshToken };
  }

  async signUp(signUpDto: SignUpDto) {
    const { email, username } = signUpDto;
    const existedEmail = await this.usersService.findOne({ email });
    if (existedEmail) {
      throw new CustomHttpException(
        'User already exists',
        HttpStatus.BAD_REQUEST,
        {
          email: ['Email is already taken'],
        },
      );
    }
    const existedUsername = await this.usersService.findOne({ username });
    if (existedUsername) {
      throw new CustomHttpException(
        'User already exists',
        HttpStatus.BAD_REQUEST,
        {
          username: ['Username is already taken'],
        },
      );
    }
    const hashedPassword = await argon2.hash(signUpDto.password);
    const createdUser = await this.usersService.create({
      username: signUpDto.username,
      email: signUpDto.email,
      password_hash: hashedPassword,
      roles: signUpDto.roles,
    });

    return createdUser;
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
