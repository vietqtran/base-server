import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SignUpDto } from './dtos/sign-up.dto';
import { Public } from '@/common/decorators/public.decorator';
import { SignInDto } from './dtos/sign-in.dto';
import JwtRefreshGuard from './guards/jwt-refresh.guard';
import { RefreshTokenDto } from './dtos/refresh.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '../users/schemas/user.schema';
import { VerifyDto } from './dtos/verify.dto';

@ApiTags('Auth')
@Controller('auth')
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @HttpCode(HttpStatus.BAD_REQUEST)
  async signIn(@Body() signInDto: SignInDto) {
    return await this.authService.signIn(signInDto.email, signInDto.password);
  }

  @Public()
  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  @HttpCode(HttpStatus.BAD_REQUEST)
  async signUp(@Body() signUpDto: SignUpDto) {
    return await this.authService.signUp(signUpDto);
  }

  @Post('refresh-token')
  @UseGuards(JwtRefreshGuard)
  @Public()
  async refreshToken(
    @CurrentUser() user: User,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() refreshTokenDto: RefreshTokenDto,
  ) {
    return await this.authService.refreshToken(user);
  }

  @Post('verify')
  @Public()
  async verify(@Body() verifyDto: VerifyDto) {
    return await this.authService.verify(verifyDto);
  }

  @Get('me')
  async me(@CurrentUser() user: User) {
    return await this.authService.getUserById(user._id);
  }
}
