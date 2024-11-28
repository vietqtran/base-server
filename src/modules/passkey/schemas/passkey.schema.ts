import { BaseSchema } from '@/common/base/schema.base';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsArray, IsString } from 'class-validator';

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  versionKey: false,
})
export class Passkey extends BaseSchema {
  @Prop({ required: true })
  @IsString()
  aaguid: string;

  @Prop({ required: true })
  @IsString()
  user_id: string;

  @Prop({ required: true })
  @IsString()
  credential_id: string;

  @Prop({ required: true })
  @IsString()
  credential_type: string;

  @Prop({ required: true })
  public_key: string;

  @Prop({ required: true, default: 0 })
  @IsString()
  counter: number;

  @Prop({ required: true, default: ['hybrid', 'internal'] })
  @IsArray()
  transports: string[];

  @Prop({ required: false, default: null })
  name?: string;
}

export const PasskeySchema = SchemaFactory.createForClass(Passkey);
