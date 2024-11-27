import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionSchema, Session } from './schemas/session.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Session.name, schema: SessionSchema },
      { name: User.name, schema: UserSchema },
    ]),
    ScheduleModule.forRoot(),
  ],
  controllers: [SessionsController],
  providers: [SessionsService, JwtService],
  exports: [SessionsService],
})
export class SessionsModule {}
