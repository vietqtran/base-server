import { ROLES_IDS } from './../../constants/roles.constant';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import RoleGuard from '../auth/guards/role.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  // @Public()
  @UseGuards(RoleGuard(ROLES_IDS.USER))
  @ApiBearerAuth()
  async getAll() {
    return await this.usersService.findAll();
  }
}
