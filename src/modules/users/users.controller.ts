import { ROLES_IDS } from './../../constants/roles.constant';
import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import RoleGuard from '../auth/guards/role.guard';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from '../../upload/upload.service';

@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly uploadService: UploadService,
  ) {}

  @Get()
  @UseGuards(RoleGuard([ROLES_IDS.ADMIN, ROLES_IDS.MANAGER, ROLES_IDS.USER]))
  async getAll() {
    return await this.usersService.findAll();
  }

  @Get('/without-auth')
  async getAllWithoutAuth() {
    return await this.usersService.findAll();
  }

  @Post('avatar/:userId')
  @Public()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File upload',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Param('userId') userId: string,
  ) {
    const uploadResult = await this.uploadService.uploadAvatar(file, userId);
    await this.usersService.findOneAndUpdate(userId, {
      avatar: uploadResult,
    });
    return uploadResult;
  }

  @Delete(':userId/:key')
  @Public()
  async deleteAvatar(
    @Param('userId') userId: string,
    @Param('key') key: string,
  ) {
    const deleteResult = await this.uploadService.deleteFile(key);
    await this.usersService.findOneAndUpdate(userId, {
      avatar: deleteResult,
    });
    return deleteResult;
  }
}
