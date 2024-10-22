import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty({
    description: 'User',
    example: '5f81b3d8a9f4e0d1c2d3',
  })
  user: string;

  @ApiProperty({
    description: 'Access token',
    example: 'token_example',
  })
  access_token: string;

  @ApiProperty({
    description: 'Refresh token',
    example: 'token_example',
  })
  refresh_token: string;

  @ApiProperty({
    description: 'Expires at',
    example: '2023-05-25T12:34:56.789Z',
  })
  expires_at: Date;
}
