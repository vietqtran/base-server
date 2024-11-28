import { Module } from '@nestjs/common';
import { PasskeyService } from './passkey.service';
import { PasskeyController } from './passkey.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PasskeySchema } from './schemas/passkey.schema';
import { UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Passkey', schema: PasskeySchema }]),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  ],
  controllers: [PasskeyController],
  providers: [PasskeyService],
})
export class PasskeyModule {}
