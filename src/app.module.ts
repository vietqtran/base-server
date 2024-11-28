import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from '@/config/database.config';
import { RolesModule } from '@/modules/roles/roles.module';
import { SessionsModule } from '@/modules/sessions/sessions.module';
import { SocialLoginModule } from '@/modules/social-login/social-login.module';
import { PermissionsModule } from '@/modules/permissions/permissions.module';
import { RoleSeeder } from '@/database/seeds/roles.seed';
import { PermissionSeeder } from '@/database/seeds/permission.seed';
import { BullModule } from '@nestjs/bullmq';
import redisConfig from './config/redis.config';
import { MongooseModule } from '@nestjs/mongoose';
import { MailModule } from './mail/mail.module';
import { QueueModule } from './queue/queue.module';
import { UploadModule } from './upload/upload.module';
import { PasskeyModule } from '@/modules/passkey/passkey.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig, redisConfig],
      isGlobal: true,
      expandVariables: true,
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
          username: configService.get('redis.username'),
          password: configService.get('redis.password'),
          url: configService.get('redis.url'),
        },
        defaultJobOptions: {
          removeOnComplete: 1000,
          removeOnFail: 5000,
          attempts: 0,
        },
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('database.uri');
        return { uri };
      },
      inject: [ConfigService],
    }),
    UploadModule,
    MailModule,
    QueueModule,
    AuthModule,
    UsersModule,
    RolesModule,
    SessionsModule,
    SocialLoginModule,
    PermissionsModule,
    PasskeyModule,
  ],
})
export class AppModule {
  constructor(
    private readonly roleSeeder: RoleSeeder,
    private readonly permissionSeeder: PermissionSeeder,
  ) {}

  onModuleInit() {
    this.roleSeeder.seed();
    this.permissionSeeder.seed();
  }
}
