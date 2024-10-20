import { Transform } from 'class-transformer';

export class BaseSchema {
  @Transform(({ value }) => value.toString())
  _id?: string;
}
