import {
  Controller,
  Post,
  HttpCode,
  Body,
  Res,
  Req,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiBody } from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { YandexAuthGuard } from './guards/yandex-auth.guard';
import type { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @ApiOperation({
    summary: 'Register new user',
  })
  @ApiBody({ type: RegisterDto })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('/login')
  @ApiOperation({
    summary: 'User login',
  })
  @ApiBody({ type: LoginDto })
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(dto, response);
  }

  @Post('/refresh')
  @ApiOperation({
    summary: 'Refresh access token',
  })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.refresh(request, response);
  }

  @Get('yandex')
  @ApiOperation({
    summary: 'Login with Yandex',
  })
  @UseGuards(YandexAuthGuard)
  async yandexAuth() {}

  @Get('yandex/callback')
  @ApiOperation({
    summary: 'Yandex OAuth callback',
  })
  @UseGuards(YandexAuthGuard)
  async yandexAuthRedirect(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.yandexLogin(req, response);
  }
}
