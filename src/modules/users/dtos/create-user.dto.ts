import { ROLES_IDS } from '@/constants/roles.constant';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Username',
    example: 'johndoe',
  })
  username: string;

  @ApiProperty({
    description: 'Email',
    example: 'johndoe@gmail.com',
  })
  email: string;

  @ApiProperty({
    description: 'Password',
    example: '123456',
  })
  password_hash: string;

  @ApiProperty({
    description: 'Roles',
    example: [ROLES_IDS.USER],
  })
  roles: string[];
}
