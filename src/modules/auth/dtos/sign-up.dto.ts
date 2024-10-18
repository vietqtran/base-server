import { ApiProperty } from "@nestjs/swagger"

export class SignUpDto {
    @ApiProperty({
        description: 'Username',
        example: 'johndoe',
    })
    username: string

    @ApiProperty({
        description: 'Email',
        example: 'johndoe@gmail.com',
    })
    email: string

    @ApiProperty({
        description: 'Password',
        example: '123456',
    })
    password: string

    @ApiProperty({
        description: 'Roles',
        example: '1,2,3',
    })
    roles: string
}