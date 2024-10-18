import { Session } from '@/modules/sessions/schemas/session.schema';
import { SocialLogin } from '@/modules/social-login/schemas/social-login.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsString, ValidateNested } from 'class-validator';
import { Document, Types } from 'mongoose';

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class User extends Document {
  @Prop({ required: true })
  @IsString()
  username: string;

  @Prop({ required: true })
  @IsString()
  email: string;

  @Prop({ required: true })
  @IsString()
  password_hash: string;
  
  @Prop({ required: true })
  @IsString()
  roles: string;

  @Prop({ required: true, default: true })
  @IsBoolean()
  is_active?: boolean;

  @Prop({ required: true, default: false })
  @IsBoolean()
  is_verified?: boolean;

  @Prop({ required: true })
  @IsDate()
  created_at: Date;

  @Prop({ required: true })
  @IsDate()
  updated_at: Date;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Session' }] })
  @ValidateNested()
  @Type(() => Session)
  sessions: Session[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'SocialLogin' }] })
  @ValidateNested()
  @Type(() => SocialLogin)
  social_logins: SocialLogin[];
}

export const UserSchema = SchemaFactory.createForClass(User);
