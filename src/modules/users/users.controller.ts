import { ROLES_IDS } from './../../constants/roles.constant';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import RoleGuard from '../auth/guards/role.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(RoleGuard([ROLES_IDS.ADMIN, ROLES_IDS.MANAGER, ROLES_IDS.USER]))
  @ApiBearerAuth()
  async getAll() {
    return await this.usersService.findAll();
  }

  @Get('/without-auth')
  @Public()
  async getAllWithoutAuth() {
    return await this.usersService.findAll();
  }
}
