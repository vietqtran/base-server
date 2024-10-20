import { User } from '@/modules/users/schemas/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsDate, IsString } from 'class-validator';
import { Types } from 'mongoose';

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Session {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({ required: true })
  @IsString()
  access_token: string;

  @Prop({ required: true })
  @IsString()
  refresh_token: string;

  @Prop({ required: true })
  @IsDate()
  expires_at: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
