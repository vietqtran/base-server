import { User } from '@/modules/users/schemas/user.schema'
import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'
import { UsersService } from 'src/modules/users/users.service'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private userService: UsersService) {
        super({
            usernameField: 'email',
        })
    }
    async validate(email: string, password: string): Promise<User> {
        return this.userService.validateUser(email, password)
    }
}