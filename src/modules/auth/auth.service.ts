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
        },
        subject: `Welcome to ${this.configService.get<string>('APP_NAME')}`,
        template: 'welcome',
        to: user.email,
      });

      return this.sanitizeUser(user);
    });
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
        { email: ['Email is already taken'] },
      );
    }

    if (existingUsername) {
      throw new CustomHttpException(
        'User already exists',
        HttpStatus.BAD_REQUEST,
        { username: ['Username is already taken'] },
      );
    }
  }

  private async createUser(
    createUserDto: CreateUserDto,
    session?: ClientSession,
  ): Promise<User> {
    try {
      const user = await this.userModel.create(
        [
          {
            username: createUserDto.username,
            email: createUserDto.email,
            password_hash: createUserDto.password_hash,
            roles: createUserDto.roles,
          },
        ],
        { session },
      );

      return user[0];
    } catch (error) {
      throw new CustomHttpException(
        'Failed to create user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userModel.findOne({ email }).exec();

    if (!user) {
      throw new CustomHttpException('User not found', HttpStatus.NOT_FOUND, {
        email: ['Email not found'],
      });
    }

    const isValid = await argon2.verify(user.password_hash, password);
    if (!isValid) {
      throw new CustomHttpException(
        'Invalid password',
        HttpStatus.UNAUTHORIZED,
        { password: ['Invalid password'] },
      );
    }

    return user;
  }

  private sanitizeUser(user: User): Partial<User> {
    const sanitizedUser = user;
    sanitizedUser.password_hash = undefined;
    sanitizedUser.sessions = undefined;
    sanitizedUser.social_logins = undefined;
    sanitizedUser.is_active = undefined;

    return sanitizedUser;
  }
}
