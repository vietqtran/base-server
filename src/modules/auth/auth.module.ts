import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { TransactionService } from '@/helpers/transaction.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';
import { TokenService } from '@/helpers/token.service';
import { SessionsModule } from '../sessions/sessions.module';
import { MailModule } from '@/mail/mail.module';
import { AuthGateway } from './auth.gateway';
import { I18nConfigModule } from '@/i18n/i18n.module';
import { Session, SessionSchema } from '../sessions/schemas/session.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get<string>('JWT_EXPIRE_IN')}s`,
        },
      }),
    }),
    SessionsModule,
    MailModule,
    I18nConfigModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    TransactionService,
    TokenService,
    AuthGateway,
  ],
})
export class AuthModule {}
