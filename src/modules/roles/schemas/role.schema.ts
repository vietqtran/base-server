import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsInt, IsString } from 'class-validator';

@Schema()
export class Role {
  @Prop({ required: true })
  @IsInt()
  id: number;

  @Prop({ required: true })
  @IsString()
  name: string;

  @Prop({ required: true })
  @IsString()
  description: string;

  @Prop({ required: true })
  @IsString()
  permissions: string;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
