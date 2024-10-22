import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({
    description: 'Email',
    example: 'johndoe@gmail.com',
  })
  email: string;

  @ApiProperty({
    description: 'Password',
    example: '123456',
  })
  password: string;
}
