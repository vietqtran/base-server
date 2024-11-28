import { HttpStatus, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { SignUpDto } from './dtos/sign-up.dto';
import { User } from '../users/schemas/user.schema';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { TransactionService } from '@/helpers/transaction.service';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { TokenService } from '@/helpers/token.service';
import { SessionsService } from '../sessions/sessions.service';
import { MailService } from '@/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { AuthGateway } from './auth.gateway';
import { VerifyDto } from './dtos/verify.dto';

export interface AuthResponse {
  user: Partial<User>;
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionsService,
    private readonly transactionService: TransactionService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly authGateway: AuthGateway,
  ) {}

  async signIn(email: string, password: string): Promise<AuthResponse> {
    const user = await this.validateUser(email, password);
    const sanitizedUser = this.sanitizeUser(user);

    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.generateAccessToken(user),
      this.tokenService.generateRefreshToken(user),
    ]);

    await this.sessionService.upsertSession(
      user._id,
      accessToken,
      refreshToken,
    );

    return {
      user: sanitizedUser,
      accessToken,
      refreshToken,
    };
  }

  async signUp(signUpDto: SignUpDto): Promise<Partial<User>> {
    if (signUpDto.password !== signUpDto.confirmPassword) {
      throw new CustomHttpException(
        'Passwords do not match',
        HttpStatus.BAD_REQUEST,
        {
          field: 'confirm-password',
          message: 'not-match',
        },
      );
    }
    await this.validateUniqueFields(signUpDto);

    return this.transactionService.executeInTransaction(async (session) => {
      const hashedPassword = await argon2.hash(signUpDto.password);

      const user = await this.createUser(
        {
          ...signUpDto,
          password_hash: hashedPassword,
        },
        session,
      );

      await this.mailService.sendMail({
        context: {
          name: user.username,
          verifyUrl: `${this.configService.get<string>('CLIENT_APP_URL')}/verify/${user.verify_token}`,
        },
        subject: `Welcome to ${this.configService.get<string>('APP_NAME')}`,
        template: 'welcome',
        to: user.email,
      });

      const userResponse = this.sanitizeUser(user);
      this.authGateway.notifyUserCreated(userResponse);

      return userResponse;
    });
  }

  async verify(verifyDto: VerifyDto) {
    const { token } = verifyDto;
    const jwtPayload = await this.tokenService.verifyToken(token);
    if (!jwtPayload.sub) {
      throw new CustomHttpException('Invalid token', HttpStatus.BAD_REQUEST, {
        field: 'token',
        message: 'invalid',
      });
    }
    const existedUser = await this.userModel.findById(jwtPayload.sub);
    if (!existedUser) {
      throw new CustomHttpException('Invalid token', HttpStatus.BAD_REQUEST, {
        field: 'token',
        message: 'invalid',
      });
    }
    const user = await this.userModel.findByIdAndUpdate(existedUser._id, {
      $set: {
        is_verified: true,
        verify_token: null,
        verify_token_expires_at: null,
      },
    });

    return this.sanitizeUser(user);
  }

  private async validateUniqueFields(signUpDto: SignUpDto): Promise<void> {
    const { email, username } = signUpDto;

    const [existingEmail, existingUsername] = await Promise.all([
      this.userModel.findOne({ email }),
      this.userModel.findOne({ username }),
    ]);

    if (existingEmail) {
      throw new CustomHttpException(
        'User already exists',
        HttpStatus.BAD_REQUEST,
        {
          field: 'email',
          message: 'existed',
        },
      );
    }

    if (existingUsername) {
      throw new CustomHttpException(
        'User already exists',
        HttpStatus.BAD_REQUEST,
        {
          field: 'username',
          message: 'existed',
        },
      );
    }
  }

  private async createUser(
    createUserDto: CreateUserDto,
    session?: ClientSession,
  ): Promise<User> {
    try {
      const verify_token = await this.tokenService.generateVerifyToken(
        createUserDto.email,
      );
      const user = await this.userModel.create(
        [
          {
            username: createUserDto.username,
            email: createUserDto.email,
            password_hash: createUserDto.password_hash,
            roles: createUserDto.roles,
            verify_token,
            is_verified: false,
          },
        ],
        { session },
      );

      return user[0];
    } catch (error) {
      console.log('error', error);
      throw new CustomHttpException(
        'Failed to create user',
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          field: 'system-error',
          message: 'create-user',
        },
      );
    }
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userModel.findOne({ email }).exec();

    if (!user) {
      throw new CustomHttpException('User not found', HttpStatus.NOT_FOUND, {
        field: 'email',
        message: 'not-found',
      });
    }

    const isValid = await argon2.verify(user.password_hash, password);
    if (!isValid) {
      throw new CustomHttpException(
        'Invalid password',
        HttpStatus.BAD_REQUEST,
        {
          field: 'password',
          message: 'wrong-credentials',
        },
      );
    }

    return user;
  }

  async refreshToken(user: User) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.generateAccessToken(user),
      this.tokenService.generateRefreshToken(user),
    ]);

    await this.sessionService.upsertSession(
      user._id,
      accessToken,
      refreshToken,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async getUserById(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new CustomHttpException('User not found', HttpStatus.NOT_FOUND, {
        field: 'user',
        message: 'not-found',
      });
    }
    return this.sanitizeUser(user);
  }

  sanitizeUser(user: User): Partial<User> {
    const sanitizedUser = user;
    sanitizedUser.password_hash = undefined;
    sanitizedUser.sessions = undefined;
    sanitizedUser.social_logins = undefined;
    sanitizedUser.is_active = undefined;
    sanitizedUser.verify_token = undefined;
    sanitizedUser.verify_token_expires_at = undefined;
    sanitizedUser.passkeys = undefined;
    return sanitizedUser;
  }
}
