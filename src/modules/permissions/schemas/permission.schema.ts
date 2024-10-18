import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsInt, IsString } from 'class-validator';
import { Document } from 'mongoose';

@Schema()
export class Permission extends Document {
  @Prop({ required: true })
  @IsInt()
  id: number;

  @Prop({ required: true })
  @IsString()
  name: string;

  @Prop({ required: true })
  @IsString()
  description: string;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
