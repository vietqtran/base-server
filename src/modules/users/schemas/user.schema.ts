import { BaseSchema } from '@/common/base/schema.base';
import { ROLES_IDS } from '@/constants/roles.constant';
import { Session } from '@/modules/sessions/schemas/session.schema';
import { SocialLogin } from '@/modules/social-login/schemas/social-login.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';

export class PublicFile {
  @Prop()
  @IsUrl()
  url: string;

  @Prop()
  key: string;
}

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  versionKey: false,
})
export class User extends BaseSchema {
  @Prop({ required: true, unique: true })
  @IsString()
  username: string;

  @Prop({ required: true, unique: true })
  @IsString()
  email: string;

  @Prop({ required: true })
  @IsString()
  password_hash: string;

  @Prop({ required: true, default: [ROLES_IDS.USER] })
  @IsArray()
  @IsString({ each: true })
  roles: string[];

  @Prop({ required: true, default: true })
  @IsBoolean()
  is_active?: boolean;

  @Prop({ required: true, default: false })
  @IsBoolean()
  is_verified?: boolean;

  @Prop({ type: PublicFile, default: null })
  @Type(() => PublicFile)
  avatar?: PublicFile;

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
