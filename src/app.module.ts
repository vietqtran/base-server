import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { DatabaseModule } from './database/database.module';
import { RolesModule } from './modules/roles/roles.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { SocialLoginModule } from './modules/social-login/social-login.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { RoleSeeder } from './database/seeds/roles.seed';
import { PermissionSeeder } from './database/seeds/permission.seed';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig],
      isGlobal: true,
      expandVariables: true,
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    RolesModule,
    SessionsModule,
    SocialLoginModule,
    PermissionsModule,
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
